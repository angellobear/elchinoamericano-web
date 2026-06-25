export const VEHICLE_BRAND_PERMISSION_KEYS = ['vehicle-brands', 'vehicle_brands'] as const

export interface VehicleBrandModelCountItem {
  id: number
}

export interface VehicleBrandListItem {
  id: number
  name: string
  origin: string
  isActive: boolean | null
  isVisibleOnWeb: boolean | null
  models: VehicleBrandModelCountItem[]
}
