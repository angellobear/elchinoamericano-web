import { NextRequest, NextResponse } from 'next/server'
import { products, stockMovements } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import { dbNow } from '@/lib/db/db-now'
import { logActivitySafe, withAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const payload = await getJwtPayload()
  if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!payload.permissions['inventory']?.can_edit) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  try {
    const { productId, quantity, finalStock, movementType, reason } = await req.json()

    if (!productId || !movementType) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const result = await withAudit(async (tx) => {
      const product = await tx.query.products.findFirst({
        where: eq(products.id, Number(productId)),
        columns: { id: true, stock: true },
      })

      if (!product) {
        return null
      }

      const normalizedMovementType = String(movementType)
      let movementQuantity = 0
      let nextStock = product.stock

      if (movementType === 'adjustment') {
        if (finalStock === undefined || finalStock === null || Number.isNaN(Number(finalStock))) {
          throw new Error('INVALID_FINAL_STOCK')
        }

        nextStock = Number(finalStock)
        movementQuantity = nextStock - product.stock
      } else {
        if (quantity === undefined || quantity === null || Number.isNaN(Number(quantity)) || Number(quantity) <= 0) {
          throw new Error('INVALID_QUANTITY')
        }

        const amount = Math.abs(Number(quantity))

        if (movementType === 'entry') {
          movementQuantity = amount
        } else if (movementType === 'exit' || movementType === 'transfer') {
          movementQuantity = -amount
        } else {
          throw new Error('INVALID_MOVEMENT_TYPE')
        }

        nextStock = product.stock + movementQuantity
      }

      if (nextStock < 0) {
        throw new Error('NEGATIVE_STOCK')
      }

      const beforeProduct = await tx.query.products.findFirst({
        where: eq(products.id, product.id),
      })

      await tx.update(products)
        .set({ stock: nextStock, updatedAt: dbNow() })
        .where(eq(products.id, product.id))

      await tx.insert(stockMovements).values({
        productId:    product.id,
        quantity:     movementQuantity,
        movementType: normalizedMovementType,
        reason:       reason || null,
        userId:       payload.userId,
      })

      const afterProduct = await tx.query.products.findFirst({
        where: eq(products.id, product.id),
      })

      return {
        newStock: nextStock,
        beforeProduct,
        afterProduct,
        movement: {
          productId: product.id,
          quantity: movementQuantity,
          movementType: normalizedMovementType,
          reason: reason || null,
          userId: payload.userId,
        },
      }
    })

    if (result === null) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    await Promise.all([
      logActivitySafe('UPDATE', 'products', Number(productId), result.beforeProduct as Record<string, unknown> | undefined, result.afterProduct as Record<string, unknown> | undefined, { userId: payload.userId }),
      logActivitySafe('CREATE', 'stock_movements', Number(productId), undefined, result.movement as Record<string, unknown>, { userId: payload.userId }),
    ])

    logger.info({ productId, quantity, movementType, newStock: result.newStock }, 'Stock movement recorded')
    return NextResponse.json({ ok: true, newStock: result.newStock })
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_QUANTITY') {
      return NextResponse.json({ error: 'La cantidad debe ser mayor que cero' }, { status: 400 })
    }

    if (err instanceof Error && err.message === 'INVALID_FINAL_STOCK') {
      return NextResponse.json({ error: 'El stock final no es valido' }, { status: 400 })
    }

    if (err instanceof Error && err.message === 'INVALID_MOVEMENT_TYPE') {
      return NextResponse.json({ error: 'Tipo de movimiento no valido' }, { status: 400 })
    }

    if (err instanceof Error && err.message === 'NEGATIVE_STOCK') {
      return NextResponse.json({ error: 'El stock no puede ser negativo' }, { status: 400 })
    }

    logger.error({ err }, 'Error recording stock movement')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
