import { NextRequest, NextResponse } from 'next/server'
import { deleteVehicleModel } from '@/lib/db/vehicle-brands'
import { getJwtPayload } from '@/lib/auth/check-permission'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ modelId: string }> }) {
  const payload = await getJwtPayload()
  if (!payload?.permissions['vehicle_brands']?.can_delete) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }
  const { modelId } = await params
  await deleteVehicleModel(Number(modelId))
  return NextResponse.json({ ok: true })
}
