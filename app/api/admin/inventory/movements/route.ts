import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { products, stockMovements } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  const payload = await getJwtPayload()
  if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!payload.permissions['inventory']?.can_edit) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  try {
    const { productId, quantity, movementType, reason } = await req.json()

    if (!productId || !quantity || !movementType) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const db = await getDb()
    const product = await db.query.products.findFirst({
      where: eq(products.id, Number(productId)),
      columns: { id: true, stock: true },
    })

    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    const newStock = product.stock + Number(quantity)
    if (newStock < 0) {
      return NextResponse.json({ error: 'El stock no puede ser negativo' }, { status: 400 })
    }

    await db.update(products)
      .set({ stock: newStock, updatedAt: new Date() })
      .where(eq(products.id, product.id))

    await db.insert(stockMovements).values({
      productId:    product.id,
      quantity:     Number(quantity),
      movementType,
      reason:       reason || null,
      userId:       payload.userId,
    })

    logger.info({ productId, quantity, movementType, newStock }, 'Stock movement recorded')
    return NextResponse.json({ ok: true, newStock })
  } catch (err) {
    logger.error({ err }, 'Error recording stock movement')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
