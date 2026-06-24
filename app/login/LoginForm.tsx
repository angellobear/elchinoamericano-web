"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      startTransition(() => {
        router.push("/admin/dashboard")
      })
      return
    }

    const data = await response.json()
    setError(data.error ?? "Error al iniciar sesión")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          placeholder="admin@chinoamericano.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      {error && <p className="text-brand text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-navy hover:bg-navy-dark text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
      >
        {isPending ? "Verificando..." : "Ingresar"}
      </button>
    </form>
  )
}
