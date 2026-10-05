import { NextRequest, NextResponse } from 'next/server'
import { renewSession, type RenewResult } from '@/lib/auth/sessions'
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  clearedCookieOptions,
  refreshCookieOptions,
  verifyAccessToken,
} from '@/lib/auth/tokens'

// Which module + action each admin route requires
const routePermissions: Record<string, { module: string; action: keyof import('@/types').ModulePermissions }> = {
  '/admin/products':      { module: 'products',       action: 'can_view' },
  '/admin/categories':    { module: 'categories',     action: 'can_view' },
  '/admin/inventory':     { module: 'inventory',      action: 'can_view' },
  '/admin/vehicle-brands':{ module: 'vehicle-brands', action: 'can_view' },
  '/admin/part-brands':   { module: 'part-brands',    action: 'can_view' },
  '/admin/suppliers':     { module: 'suppliers',      action: 'can_view' },
  '/admin/announcements': { module: 'announcements',  action: 'can_view' },
  '/admin/orders':        { module: 'orders',         action: 'can_view' },
  '/admin/inbox':         { module: 'inbox',          action: 'can_view' },
  '/admin/users':         { module: 'users',           action: 'can_view' },
}

/** Copia a la respuesta las cookies que resultaron de renovar (o de invalidar) la sesión. */
function applySession(res: NextResponse, renewed: RenewResult | null) {
  if (!renewed) return res

  if (renewed.status === 'invalid') {
    res.cookies.set(ACCESS_COOKIE, '', clearedCookieOptions())
    res.cookies.set(REFRESH_COOKIE, '', clearedCookieOptions())
    return res
  }

  res.cookies.set(ACCESS_COOKIE, renewed.accessToken, accessCookieOptions())
  if (renewed.status === 'rotated') res.cookies.set(REFRESH_COOKIE, renewed.refreshCookie, refreshCookieOptions())
  return res
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAdminPage = pathname.startsWith('/admin')

  let payload = await verifyAccessToken(req.cookies.get(ACCESS_COOKIE)?.value)
  let renewed: RenewResult | null = null

  // Token de acceso vencido o ausente: se renueva aquí, antes de que la petición llegue a la
  // página, la ruta API o el server action, para que nadie vea un "sesión expirada" a medio uso.
  const refreshCookie = req.cookies.get(REFRESH_COOKIE)?.value
  if (!payload && refreshCookie) {
    try {
      renewed = await renewSession(refreshCookie)
    } catch {
      // Base caída: no se borra nada; el siguiente intento puede renovar.
      renewed = null
    }
    if (renewed && renewed.status !== 'invalid') payload = renewed.payload
  }

  if (!payload) {
    // Las rutas API y /login responden por su cuenta (401 o el formulario).
    const res = isAdminPage ? NextResponse.redirect(new URL('/login', req.url)) : NextResponse.next()
    return applySession(res, renewed)
  }

  if (isAdminPage) {
    // Find the most specific matching route prefix
    const matchedRoute = Object.keys(routePermissions).find(r => pathname.startsWith(r))
    if (matchedRoute) {
      const { module, action } = routePermissions[matchedRoute]
      if (!payload.permissions[module]?.[action]) {
        return applySession(NextResponse.redirect(new URL('/admin/forbidden', req.url)), renewed)
      }
    }
  }

  if (!renewed || renewed.status === 'invalid') return NextResponse.next()

  // El token recién emitido también va en la petición, para que `cookies()` lo lea en este mismo render.
  req.cookies.set(ACCESS_COOKIE, renewed.accessToken)
  return applySession(NextResponse.next({ request: { headers: req.headers } }), renewed)
}

// /api/admin y /login entran para que una sesión con el token de acceso vencido se renueve también ahí.
export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/login'] }
