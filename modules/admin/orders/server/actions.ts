'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { handleImageReplace } from '@/lib/cloudinary'
import {
  OrderError,
  addPayment,
  cancelOrder,
  createOrder,
  deliverOrder,
  getOrderById,
  isDeliveryEditable,
  updateDeliveryInfo,
  updateOrder,
  voidPayment,
  type OrderErrorCode,
} from '@/lib/db/orders'
import { getProductList } from '@/lib/db/products'
import { logger } from '@/lib/logger'
import { MAX_DELIVERY_PHOTOS, MAX_PHOTO_BYTES, ORDER_STATUS, type DeliveryPhoto } from '@/lib/orders'
import { routes } from '@/lib/routes'
import {
  parseDeliveryFormData,
  parseOrderFormData,
  parsePaymentFormData,
} from '@/modules/admin/orders/form-schema'
import { ORDER_PERMISSION_KEYS, type OrderProductOption } from '@/modules/admin/orders/types'
import { hasModulePermission, type PermissionAction } from '@/modules/admin/shared/server/permissions'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import {
  errorResult,
  successResult,
  type ActionResult,
  type ActionState,
} from '@/modules/admin/shared/types/action-result'

const ORDER_ERROR_MESSAGE: Record<OrderErrorCode, string> = {
  NOT_FOUND: 'El pedido no existe.',
  NOT_PENDING: 'Solo se puede hacer esto mientras el pedido está pendiente.',
  NOT_DELIVERED: 'El pedido todavía no está entregado.',
  DELIVERY_EDIT_EXPIRED: 'Los datos de entrega solo se pueden editar durante la primera hora después de la entrega.',
  CANCELLED: 'El pedido está anulado.',
  TOTAL_BELOW_PAID: 'El total no puede quedar por debajo de lo ya abonado.',
  EXCEEDS_BALANCE: 'El abono supera el saldo pendiente.',
  INSUFFICIENT_STOCK: 'No hay stock suficiente.',
}

// Sin export: en un módulo 'use server' todo lo exportado debe ser async.
async function authorize(action: PermissionAction) {
  const payload = await getJwtPayload()

  if (!payload) {
    return { payload: null, error: errorResult('Tu sesión expiró. Vuelve a iniciar sesión.') }
  }

  if (!hasModulePermission(payload, ORDER_PERMISSION_KEYS, action)) {
    return { payload: null, error: errorResult('No tienes permiso para esta acción.') }
  }

  return { payload, error: null }
}

function failure(err: unknown, fallback: string): ActionResult {
  if (err instanceof OrderError) {
    const message = ORDER_ERROR_MESSAGE[err.code]
    return errorResult(err.detail ? `${message} ${err.detail}` : message)
  }

  logger.error({ err }, fallback)
  return errorResult(fallback)
}

function revalidateOrder(id: number) {
  revalidatePath(routes.admin.orders.index)
  revalidatePath(routes.admin.orders.detail(id))
}

export async function saveOrderAction(orderId: number | null, _: ActionState, formData: FormData) {
  const auth = await authorize(orderId ? 'can_edit' : 'can_create')
  if (!auth.payload) return auth.error

  const parsed = parseOrderFormData(formData)
  if (!parsed.success) return errorResult(getZodErrorMessage(parsed.error))

  const input = {
    customerName: parsed.data.customerName ?? null,
    customerIdNumber: parsed.data.customerIdNumber ?? null,
    customerPhone: parsed.data.customerPhone ?? null,
    discount: parsed.data.discount,
    notes: parsed.data.notes ?? null,
    estimatedDate: parsed.data.estimatedDate ?? null,
    items: parsed.data.items,
  }

  let id: number
  try {
    if (orderId) {
      await updateOrder(orderId, input)
      id = orderId
    } else {
      id = await createOrder(input, auth.payload.userId)
    }
  } catch (err) {
    return failure(err, 'No se pudo guardar el pedido.')
  }

  revalidateOrder(id)
  return successResult(orderId ? 'Pedido guardado' : 'Pedido creado', undefined, {
    redirectTo: routes.admin.orders.detail(id),
  })
}

export async function addPaymentAction(orderId: number, _: ActionState, formData: FormData) {
  const auth = await authorize('can_edit')
  if (!auth.payload) return auth.error

  const parsed = parsePaymentFormData(formData)
  if (!parsed.success) return errorResult(getZodErrorMessage(parsed.error))

  try {
    await addPayment(
      orderId,
      { ...parsed.data, reference: parsed.data.reference ?? null },
      auth.payload.userId,
    )
  } catch (err) {
    return failure(err, 'No se pudo registrar el abono.')
  }

  revalidateOrder(orderId)
  return successResult('Abono registrado')
}

export async function voidPaymentAction(orderId: number, paymentId: number) {
  const auth = await authorize('can_edit')
  if (!auth.payload) return auth.error

  try {
    await voidPayment(orderId, paymentId)
  } catch (err) {
    return failure(err, 'No se pudo anular el abono.')
  }

  revalidateOrder(orderId)
  return successResult('Abono anulado')
}

export async function cancelOrderAction(orderId: number) {
  const auth = await authorize('can_delete')
  if (!auth.payload) return auth.error

  try {
    await cancelOrder(orderId, auth.payload.userId)
  } catch (err) {
    return failure(err, 'No se pudo anular el pedido.')
  }

  revalidateOrder(orderId)
  revalidatePath(routes.admin.inventory.index)
  return successResult('Pedido anulado')
}

/** Entrega el pedido si está pendiente y guarda quién recibe, la factura y las fotos. */
export async function saveDeliveryAction(orderId: number, _: ActionState, formData: FormData) {
  const auth = await authorize('can_edit')
  if (!auth.payload) return auth.error

  const parsed = parseDeliveryFormData(formData)
  if (!parsed.success) return errorResult(getZodErrorMessage(parsed.error))

  const files: (File | null)[] = []
  for (let slot = 0; slot < MAX_DELIVERY_PHOTOS; slot++) {
    const file = formData.get(`photo${slot}`)
    const photo = file instanceof File && file.size > 0 ? file : null

    if (photo && !photo.type.startsWith('image/')) return errorResult('Las fotos deben ser imágenes.')
    if (photo && photo.size > MAX_PHOTO_BYTES) return errorResult('Cada foto puede pesar máximo 4 MB.')
    files.push(photo)
  }

  try {
    const order = await getOrderById(orderId)
    if (!order) return errorResult(ORDER_ERROR_MESSAGE.NOT_FOUND)
    if (order.status === ORDER_STATUS.cancelled) return errorResult(ORDER_ERROR_MESSAGE.CANCELLED)
    // Se revisa antes de tocar las fotos: una edición vencida no debe subir ni borrar nada.
    if (order.status === ORDER_STATUS.delivered && !(await isDeliveryEditable(orderId))) {
      return errorResult(ORDER_ERROR_MESSAGE.DELIVERY_EDIT_EXPIRED)
    }

    // Primero la entrega: si falla por stock, no se sube ninguna foto.
    if (order.status === ORDER_STATUS.pending) {
      await deliverOrder(orderId, auth.payload.userId)
    }

    const current = order.deliveryPhotos ?? []
    const deliveryPhotos: DeliveryPhoto[] = []
    for (let slot = 0; slot < MAX_DELIVERY_PHOTOS; slot++) {
      const old = current[slot]
      const { url, publicId } = await handleImageReplace(
        files[slot],
        formData.get(`photo${slot}_removed`) === '1',
        old?.publicId,
        old?.url,
        'orders',
      )
      if (url && publicId) deliveryPhotos.push({ url, publicId })
    }

    await updateDeliveryInfo(orderId, {
      receivedByName: parsed.data.receivedByName ?? null,
      // La cédula ya no se pide; se conserva la que hubiera de antes.
      receivedByIdNumber: order.receivedByIdNumber,
      // La factura solo viene al editar; al entregar no se envía y no debe borrar nada.
      invoiceNumber: formData.has('invoiceNumber') ? (parsed.data.invoiceNumber ?? null) : order.invoiceNumber,
      deliveryPhotos,
    })
  } catch (err) {
    return failure(err, 'No se pudo guardar la entrega.')
  }

  revalidateOrder(orderId)
  revalidatePath(routes.admin.inventory.index)
  return successResult('Entrega guardada')
}

export async function searchOrderProductsAction(query: string): Promise<OrderProductOption[]> {
  const auth = await authorize('can_view')
  const search = query.trim()
  if (!auth.payload || search.length < 2) return []

  const { items } = await getProductList({ search, limit: 8 })
  return items.map((product) => ({
    id: product.id,
    code: product.code,
    title: product.title,
    price: product.price,
    stock: product.stock,
  }))
}
