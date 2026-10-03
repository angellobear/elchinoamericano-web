import { z } from 'zod'
import { PAYMENT_METHODS, toCents } from '@/lib/orders'
import { getOptionalString, getRequiredString } from '@/modules/admin/shared/server/form-data'

// Dólares con hasta 2 decimales. Nada de porcentajes ni signos.
const money = (message: string) => z.string().regex(/^\d{1,8}(\.\d{1,2})?$/, message)
const isoDate = /^\d{4}-\d{2}-\d{2}$/

const orderItemSchema = z.object({
  productId: z.number().int().positive().nullable(),
  description: z
    .string()
    .trim()
    .min(1, 'Cada ítem necesita una descripción.')
    .max(255, 'La descripción de un ítem es demasiado larga.'),
  quantity: z
    .number()
    .int('La cantidad debe ser un número entero.')
    .min(1, 'La cantidad mínima es 1.')
    .max(9999, 'La cantidad es demasiado alta.'),
  unitPrice: money('El valor unitario no es válido.'),
})

export const orderFormSchema = z
  .object({
    customerName: z.string().max(150, 'El nombre es demasiado largo.').optional(),
    customerIdNumber: z.string().max(20, 'La cédula/RUC es demasiado larga.').optional(),
    customerPhone: z.string().max(30, 'El teléfono es demasiado largo.').optional(),
    discount: money('El descuento debe ser un valor en dólares.'),
    notes: z.string().max(1000, 'Las notas son demasiado largas.').optional(),
    estimatedDate: z.string().regex(isoDate, 'La fecha estimada no es válida.').optional(),
    items: z.array(orderItemSchema).min(1, 'Agrega al menos un ítem.').max(100, 'Demasiados ítems.'),
  })
  .refine(
    (values) =>
      toCents(values.discount) <=
      values.items.reduce((sum, item) => sum + item.quantity * toCents(item.unitPrice), 0),
    { message: 'El descuento no puede superar el subtotal.', path: ['discount'] },
  )

export type OrderFormValues = z.infer<typeof orderFormSchema>

function parseItems(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function parseOrderFormData(formData: FormData) {
  return orderFormSchema.safeParse({
    customerName: getOptionalString(formData, 'customerName'),
    customerIdNumber: getOptionalString(formData, 'customerIdNumber'),
    customerPhone: getOptionalString(formData, 'customerPhone'),
    discount: getOptionalString(formData, 'discount') ?? '0',
    notes: getOptionalString(formData, 'notes'),
    estimatedDate: getOptionalString(formData, 'estimatedDate'),
    items: parseItems(getRequiredString(formData, 'items')),
  })
}

export const paymentFormSchema = z.object({
  amount: money('El monto no es válido.').refine((value) => toCents(value) > 0, 'El monto debe ser mayor que cero.'),
  method: z.enum(PAYMENT_METHODS, { error: 'Elige una forma de pago.' }),
  reference: z.string().max(100, 'La referencia es demasiado larga.').optional(),
  paidAt: z.string().regex(isoDate, 'La fecha del abono es obligatoria.'),
})

export function parsePaymentFormData(formData: FormData) {
  return paymentFormSchema.safeParse({
    amount: getRequiredString(formData, 'amount'),
    method: getRequiredString(formData, 'method'),
    reference: getOptionalString(formData, 'reference'),
    paidAt: getRequiredString(formData, 'paidAt'),
  })
}

export const deliveryFormSchema = z.object({
  // Obligatorio: es lo mínimo que respalda una entrega y evita marcarla por accidente.
  receivedByName: z
    .string({ error: 'Indica quién recibe el pedido.' })
    .min(1, 'Indica quién recibe el pedido.')
    .max(150, 'El nombre de quien recibe es demasiado largo.'),
})

export function parseDeliveryFormData(formData: FormData) {
  return deliveryFormSchema.safeParse({
    receivedByName: getOptionalString(formData, 'receivedByName'),
  })
}

export const invoiceFormSchema = z.object({
  // Vacío = quitar la factura registrada.
  invoiceNumber: z.string().max(50, 'El número de factura es demasiado largo.').optional(),
})

export function parseInvoiceFormData(formData: FormData) {
  return invoiceFormSchema.safeParse({ invoiceNumber: getOptionalString(formData, 'invoiceNumber') })
}
