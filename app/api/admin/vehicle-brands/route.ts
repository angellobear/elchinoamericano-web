import { NextResponse } from 'next/server'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { getVehicleBrandsWithModels } from '@/lib/db/vehicle-brands'

export async function GET() {
  const payload = await getJwtPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!payload.permissions['vehicle-brands']?.can_view) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }
  const brands = await getVehicleBrandsWithModels()
  return NextResponse.json(brands)
}
