import { NextRequest, NextResponse } from 'next/server'
import { deleteVehicleModel, updateVehicleModel } from '@/lib/db/vehicle-brands'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import { vehicleModelFormSchema } from '@/modules/admin/vehicle-brands/form-schema'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; modelId: string }> }) {
  const payload = await getJwtPayload()
  if (!payload?.permissions['vehicle-brands']?.can_edit) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }
  try {
    const { modelId } = await params
    const body = await req.json()
    const parsed = vehicleModelFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
    }

    const data = parsed.data
    await updateVehicleModel(Number(modelId), {
      name:         data.name,
      displacement: data.displacement ?? null,
      fuelType:     data.fuelType ?? null,
      transmission: data.transmission ?? null,
      bodyType:     data.bodyType ?? null,
      isActive:     data.isActive,
    })
    logger.info({ modelId }, 'Vehicle model updated')
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error({ err }, 'Error updating vehicle model')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; modelId: string }> }) {
  const payload = await getJwtPayload()
  if (!payload?.permissions['vehicle-brands']?.can_delete) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }
  try {
    const { modelId } = await params
    await deleteVehicleModel(Number(modelId))
    logger.info({ modelId }, 'Vehicle model deleted')
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error({ err }, 'Error deleting vehicle model')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
