import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createUser, getRoles } from '@/lib/db/users'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'

async function create(formData: FormData) {
  'use server'
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect('/admin/forbidden')

  try {
    const email    = String(formData.get('email')).trim().toLowerCase()
    const fullName = (formData.get('fullName') as string)?.trim() || undefined
    const password = String(formData.get('password'))
    const roleId   = Number(formData.get('roleId'))

    if (!email || !password || !roleId) {
      redirect('/admin/users/new?error=' + encodeURIComponent('Completa todos los campos requeridos'))
    }

    await createUser({ email, fullName, password, roleId })
    logger.info({ email, roleId }, 'User created')
    revalidatePath('/admin/users')
  } catch (err) {
    logger.error({ err }, 'Error creating user')
    redirect('/admin/users?error=' + encodeURIComponent('Error al crear usuario'))
  }
  redirect('/admin/users?success=' + encodeURIComponent('Usuario creado'))
}

export default async function NewUserPage() {
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect('/admin/forbidden')

  const roles = await getRoles()

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a usuarios
        </Link>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Nuevo usuario</h1>
        <p className="text-gray-500 text-sm mt-0.5">Solo el superadmin puede crear usuarios</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form action={create} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre completo
            </label>
            <input
              name="fullName"
              placeholder="ej: Carlos Rueda"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-[#e03030]">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="usuario@empresa.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña <span className="text-[#e03030]">*</span>
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rol <span className="text-[#e03030]">*</span>
            </label>
            <select
              name="roleId"
              required
              defaultValue=""
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent bg-white"
            >
              <option value="" disabled>Seleccionar rol...</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton className="px-5 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium disabled:opacity-60">
              Crear usuario
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
