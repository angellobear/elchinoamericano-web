import { getUsers } from '@/lib/db/users'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Crown, Shield, User, Plus, Pencil } from 'lucide-react'
import { UserStatusToggle } from '@/modules/admin/users/components/UserStatusToggle'

export default async function UsersPage() {
  const payload = await getJwtPayload()
  // Solo superadmin puede gestionar usuarios; admin puede ver la lista
  if (!payload || (payload.role !== 'superadmin' && payload.role !== 'admin')) {
    redirect('/admin/forbidden')
  }

  const users = await getUsers()
  const isSuperAdmin = payload.role === 'superadmin'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy">Usuarios</h1>
          <p className="text-slate-400 text-sm mt-0.5">{users.length} usuarios registrados</p>
        </div>
        {isSuperAdmin && (
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 active:scale-[0.98] transition-all"
          >
            <Plus size={15} />
            Nuevo usuario
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Usuario</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Rol</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Último acceso</th>
              <th className="text-center px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3.5 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => {
              const roleName = u.role?.name ?? ''
              const RoleIcon = roleName === 'superadmin' ? Crown : roleName === 'admin' ? Shield : User
              const isSelf = u.id === payload.userId
              return (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-navy/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-navy text-xs font-semibold uppercase">
                          {(u.fullName ?? u.email).charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {u.fullName ?? '—'}
                        {isSelf && <span className="ml-1.5 text-xs text-gray-400">(tú)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      roleName === 'superadmin' ? 'bg-navy text-white' :
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
                    <div className="flex items-center justify-end gap-1">
                      {isSuperAdmin && (
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors"
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </Link>
                      )}
                      {isSuperAdmin && !isSelf && (
                        <UserStatusToggle id={u.id} isActive={u.isActive ?? true} />
                      )}
                    </div>
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
