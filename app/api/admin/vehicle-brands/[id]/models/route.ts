import { NextRequest, NextResponse } from 'next/server'
import { createVehicleModel } from '@/lib/db/vehicle-brands'
import { getJwtPayload } from '@/lib/auth/check-permission'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getJwtPayload()
  if (!payload?.permissions['vehicle_brands']?.can_create) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const modelId = await createVehicleModel({ ...body, brand_id: Number(id), is_active: true })
  return NextResponse.json({ model: { id: modelId, ...body } })
}
