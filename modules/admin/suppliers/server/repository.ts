import { deleteSupplier, getSuppliers, updateSupplier } from '@/lib/db/suppliers'
import type { SupplierListItem } from '@/modules/admin/suppliers/types'

export interface SupplierRepository {
  listForAdmin(): Promise<SupplierListItem[]>
  updateStatus(id: number, isActive: boolean): Promise<void>
  softDelete(id: number): Promise<void>
}

export const supplierRepository: SupplierRepository = {
  async listForAdmin() {
    const suppliers = await getSuppliers(true)

    return suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      contactName: supplier.contactName ?? null,
      email: supplier.email ?? null,
      phone: supplier.phone ?? null,
      isActive: supplier.isActive ?? true,
    }))
  },

  async updateStatus(id, isActive) {
    await updateSupplier(id, { isActive })
  },

  async softDelete(id) {
    await deleteSupplier(id)
  },
}
