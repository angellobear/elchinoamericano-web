export const ORDER_PERMISSION_KEYS = ['orders', 'pedidos'] as const

export interface OrderProductOption {
  id: number
  code: string | null
  title: string
  price: string
  stock: number
}
