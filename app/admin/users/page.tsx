import { getUsers, deactivateUser } from '@/lib/db/users'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Users, UserX, Crown, Shield, User } from 'lucide-react'

async function handleDeactivate(id: string) {
  'use server'
  await deactivateUser(id)
  revalidatePath('/admin/users')
}

export default async function UsersPage() {
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect('/admin/forbidden')

  const users = await getUsers()

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} usuarios registrados</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Usuario</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Rol</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Último acceso</th>
              <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3.5 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => {
              const roleName = u.role?.name ?? ''
              const RoleIcon = roleName === 'superadmin' ? Crown : roleName === 'admin' ? Shield : User
              return (
                <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-[#0d1f3c]/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-[#0d1f3c] text-xs font-semibold uppercase">
                          {(u.fullName ?? u.email).charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{u.fullName ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      roleName === 'superadmin' ? 'bg-[#0d1f3c] text-white' :
                      roleName === 'admin'       ? 'bg-blue-100 text-blue-700' :
                                                   'bg-gray-100 text-gray-600'
                    }`}>
                      <RoleIcon size={10} />
                      {roleName || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('es-EC') : 'Nunca'}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                      u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {u.isActive && u.id !== payload?.userId && (
                      <form action={handleDeactivate.bind(null, u.id)}>
                        <button
                          type="submit"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-[#e03030] transition-colors cursor-pointer"
                          title="Desactivar usuario"
                        >
                          <UserX size={13} />
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Users size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400">No hay usuarios registrados</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
