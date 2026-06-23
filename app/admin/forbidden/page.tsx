export default function ForbiddenPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="text-6xl font-bold text-[#e03030] mb-4">403</div>
      <p className="text-gray-600 text-lg mb-6">No tienes permiso para acceder a esta sección.</p>
      <a href="/admin/dashboard" className="px-4 py-2 bg-[#0d1f3c] text-white rounded-lg text-sm hover:bg-[#0a1628] transition-colors">
        Volver al dashboard
      </a>
    </div>
  )
}
