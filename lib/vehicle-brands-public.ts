export interface PublicVehicleBrand {
  id: number
  key: string
  name: string
  origin: string
}

export const LEGACY_VISIBLE_VEHICLE_BRAND_NAMES = [
  'Chery',
  'Great Wall',
  'SWM',
  'DFSK',
  'Jetour',
  'Shineray',
  'JAC',
  'Ford',
  'Chevrolet',
] as const

export function toVehicleBrandKey(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
