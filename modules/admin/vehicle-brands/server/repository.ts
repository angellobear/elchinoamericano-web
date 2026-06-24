import { getVehicleBrandsWithModels, updateVehicleBrand } from '@/lib/db/vehicle-brands'
import type { VehicleBrandListItem } from '@/modules/admin/vehicle-brands/types'

export interface VehicleBrandRepository {
  listForAdmin(): Promise<VehicleBrandListItem[]>
  updateStatus(id: number, isActive: boolean): Promise<void>
}

export const vehicleBrandRepository: VehicleBrandRepository = {
  async listForAdmin() {
    const brands = await getVehicleBrandsWithModels()

    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      origin: brand.origin,
      isActive: brand.isActive ?? true,
      models: brand.models.map((model) => ({ id: model.id })),
    }))
  },

  async updateStatus(id, isActive) {
    await updateVehicleBrand(id, { isActive })
  },
}
