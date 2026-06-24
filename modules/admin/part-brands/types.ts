export const PART_BRAND_PERMISSION_KEYS = ['part-brands', 'part_brands'] as const

export interface PartBrandListItem {
  id: number
  name: string
  originCountry: string | null
  isActive: boolean | null
}
