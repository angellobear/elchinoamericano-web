import { NextRequest, NextResponse } from 'next/server'
import { updateStock } from '@/lib/db/products'
import { getJwtPayload } from '@/lib/auth/check-permission'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getJwtPayload()
  if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (!payload.permissions['inventory']?.can_edit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  const { id } = await params
  const { stock, reason } = await req.json()

  await updateStock(Number(id), stock, payload.userId, reason)
  return NextResponse.json({ ok: true })
}
