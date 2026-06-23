import { getUsers } from '@/lib/db/users'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect('/admin/forbidden')

  const users = await getUsers()

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#0d1f3c] mb-6">Usuarios</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Último acceso</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role?.name === 'superadmin' ? 'bg-[#0d1f3c] text-white' :
                    u.role?.name === 'admin'       ? 'bg-blue-100 text-blue-800' :
                                                     'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role?.name ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('es-EC') : 'Nunca'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
