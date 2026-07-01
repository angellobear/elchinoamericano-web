import { NextResponse } from 'next/server'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { getVehicleBrandsWithModels } from '@/lib/db/vehicle-brands'

export async function GET() {
  const payload = await getJwtPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const brands = await getVehicleBrandsWithModels()
  return NextResponse.json(brands)
}
