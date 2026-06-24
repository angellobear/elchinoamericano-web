import { NextRequest, NextResponse } from 'next/server'
import { createVehicleModel } from '@/lib/db/vehicle-brands'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import { vehicleModelFormSchema } from '@/modules/admin/vehicle-brands/form-schema'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getJwtPayload()
  if (!payload?.permissions['vehicle_brands']?.can_create) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = vehicleModelFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
    }

    const data = parsed.data
    const modelId = await createVehicleModel({
      brandId:      Number(id),
      name:         data.name,
      displacement: data.displacement ?? null,
      fuelType:     data.fuelType ?? null,
      transmission: data.transmission ?? null,
      bodyType:     data.bodyType ?? null,
      isActive:     true,
    })
    logger.info({ brandId: id, modelId, name: data.name }, 'Vehicle model created')
    return NextResponse.json({ model: { id: modelId, ...data, isActive: true } })
  } catch (err) {
    logger.error({ err }, 'Error creating vehicle model')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
