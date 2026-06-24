import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserById, updateUser, getRoles } from '@/lib/db/users'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'

async function save(id: string, formData: FormData) {
  'use server'
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect('/admin/forbidden')

  try {
    const fullName   = (formData.get('fullName') as string)?.trim() || undefined
    const roleId     = Number(formData.get('roleId'))
    const isActive   = formData.get('isActive') === 'on'
    const newPassword = (formData.get('password') as string)?.trim()

    const update: Parameters<typeof updateUser>[1] = { fullName, roleId, isActive }
    if (newPassword && newPassword.length >= 8) {
      update.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    // Evitar que el superadmin se desactive a sí mismo
    if (id === payload.userId) {
      delete update.isActive
      delete update.roleId
    }

    await updateUser(id, update)
    logger.info({ id }, 'User updated')
    revalidatePath('/admin/users')
  } catch (err) {
    logger.error({ err }, 'Error updating user')
    redirect('/admin/users?error=' + encodeURIComponent('Error al guardar usuario'))
  }
  redirect('/admin/users?success=' + encodeURIComponent('Usuario guardado'))
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect('/admin/forbidden')

  const { id } = await params
  const [user, roles] = await Promise.all([getUserById(id), getRoles()])
  if (!user) notFound()

  const isSelf = user.id === payload.userId
  const saveWithId = save.bind(null, user.id)

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a usuarios
        </Link>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Editar usuario</h1>
        <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form action={saveWithId} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
            <input
              name="fullName"
              defaultValue={user.fullName ?? ''}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nueva contraseña <span className="text-gray-400 text-xs font-normal">(dejar vacío para no cambiar)</span>
            </label>
            <input
              name="password"
              type="password"
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          {!isSelf && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
              <select
                name="roleId"
                defaultValue={user.roleId ?? ''}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent bg-white"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

          {!isSelf && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked={user.isActive ?? true}
                className="w-4 h-4 rounded border-gray-300 text-[#0d1f3c] focus:ring-[#0d1f3c]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Usuario activo</label>
            </div>
          )}

          {isSelf && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              No puedes cambiar tu propio rol o estado.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <SubmitButton className="px-5 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium disabled:opacity-60">
              Guardar cambios
            </SubmitButton>
            <Link
              href="/admin/users"
              className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
