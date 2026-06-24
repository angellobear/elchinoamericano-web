import { NextRequest, NextResponse } from 'next/server'
import { createVehicleModel } from '@/lib/db/vehicle-brands'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getJwtPayload()
  if (!payload?.permissions['vehicle_brands']?.can_create) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }
  try {
    const { id } = await params
    const body = await req.json()
    const modelId = await createVehicleModel({
      brandId:      Number(id),
      name:         body.name,
      displacement: body.displacement ?? null,
      fuelType:     body.fuelType ?? null,
      transmission: body.transmission ?? null,
      bodyType:     body.bodyType ?? null,
      isActive:     true,
    })
    logger.info({ brandId: id, modelId, name: body.name }, 'Vehicle model created')
    return NextResponse.json({ model: { id: modelId, ...body, isActive: true } })
  } catch (err) {
    logger.error({ err }, 'Error creating vehicle model')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
