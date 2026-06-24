import { getPartBrands, updatePartBrand } from '@/lib/db/part-brands'
import type { PartBrandListItem } from '@/modules/admin/part-brands/types'

export interface PartBrandRepository {
  listForAdmin(): Promise<PartBrandListItem[]>
  updateStatus(id: number, isActive: boolean): Promise<void>
}

export const partBrandRepository: PartBrandRepository = {
  async listForAdmin() {
    const brands = await getPartBrands(true)

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
