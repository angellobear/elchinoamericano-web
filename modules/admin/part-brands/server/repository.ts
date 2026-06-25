import { getPartBrands, updatePartBrand } from '@/lib/db/part-brands'
import type { ActiveQueryOptions } from '@/lib/db/soft-delete'
import type { PartBrandListItem } from '@/modules/admin/part-brands/types'

export interface PartBrandRepository {
  listForAdmin(options?: ActiveQueryOptions): Promise<PartBrandListItem[]>
  updateStatus(id: number, isActive: boolean): Promise<void>
}

export const partBrandRepository: PartBrandRepository = {
  async listForAdmin(options) {
    const brands = await getPartBrands({ includeInactive: true, withTrashed: options?.withTrashed })

    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      originCountry: brand.originCountry ?? null,
      isActive: brand.isActive ?? true,
    }))
  },

  async updateStatus(id, isActive) {
    await updatePartBrand(id, { isActive })
  },
}
