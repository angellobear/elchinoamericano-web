import { getVehicleBrandsForAdmin, updateVehicleBrand, deleteVehicleBrand } from '@/lib/db/vehicle-brands'
import { normalizeBoolean } from '@/lib/normalize-boolean'
import type { ActiveQueryOptions } from '@/lib/db/soft-delete'
import type { VehicleBrandListItem } from '@/modules/admin/vehicle-brands/types'

const ORIGIN_PRIORITY: Record<string, number> = { chinese: 0, american: 1 }
const originPriority = (o: string) => ORIGIN_PRIORITY[o] ?? 2

export interface VehicleBrandRepository {
  listForAdmin(options?: ActiveQueryOptions): Promise<VehicleBrandListItem[]>
  updateStatus(id: number, isActive: boolean): Promise<void>
  deleteBrand(id: number): Promise<void>
}

export const vehicleBrandRepository: VehicleBrandRepository = {
  async listForAdmin(options) {
    const brands = await getVehicleBrandsForAdmin(options)

    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      origin: brand.origin,
      isActive: normalizeBoolean(
        (brand as { isActive?: unknown; is_active?: unknown }).isActive
        ?? (brand as { isActive?: unknown; is_active?: unknown }).is_active,
        true,
      ),
      isVisibleOnWeb: normalizeBoolean(
        (brand as { isVisibleOnWeb?: unknown; is_visible_on_web?: unknown }).isVisibleOnWeb
        ?? (brand as { isVisibleOnWeb?: unknown; is_visible_on_web?: unknown }).is_visible_on_web,
        false,
      ),
      models: brand.models.map((model) => ({ id: model.id })),
    }))
    .sort((a, b) => originPriority(a.origin) - originPriority(b.origin))
  },

  async updateStatus(id, isActive) {
    await updateVehicleBrand(id, { isActive })
  },

  async deleteBrand(id) {
    await deleteVehicleBrand(id)
  },
}
