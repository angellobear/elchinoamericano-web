export const SUPPLIER_PERMISSION_KEYS = ['suppliers'] as const

export interface SupplierListItem {
  id: number
  name: string
  contactName: string | null
  email: string | null
  phone: string | null
  isActive: boolean | null
}
