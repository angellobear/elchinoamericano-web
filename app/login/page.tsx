import { redirect } from 'next/navigation'
import type { Metadata } from "next"
import { getJwtPayload } from '@/lib/auth/check-permission'
import { routes } from '@/lib/routes'
import LoginForm from "./LoginForm"

export const metadata: Metadata = {
  title: "Acceso Administrador | El Chino Americano",
  description: "Inicio de sesión para el panel administrativo de El Chino Americano.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default async function LoginPage() {
  const payload = await getJwtPayload()
  if (payload) redirect(routes.admin.dashboard)
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center p-4">
      <section className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center text-white font-bold text-lg">
              CA
            </div>
            <span className="text-navy font-semibold text-lg leading-tight">
              El Chino
              <br />
              <span className="text-brand">Americano</span>
            </span>
          </div>
          <h1 className="text-navy font-semibold text-lg">Panel Administrador</h1>
          <p className="text-gray-500 text-sm mt-2">
            Ingresa con tus credenciales para continuar.
          </p>
        </header>

        <LoginForm />
      </section>
    </main>
  )
}
