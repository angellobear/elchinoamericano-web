import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

// Which module + action each admin route requires
const routePermissions: Record<string, { module: string; action: keyof import('@/types').ModulePermissions }> = {
  '/admin/products':      { module: 'products',       action: 'can_view' },
  '/admin/categories':    { module: 'categories',     action: 'can_view' },
  '/admin/inventory':     { module: 'inventory',      action: 'can_view' },
  '/admin/vehicle-brands':{ module: 'vehicle_brands', action: 'can_view' },
  '/admin/part-brands':   { module: 'part_brands',    action: 'can_view' },
  '/admin/suppliers':     { module: 'suppliers',      action: 'can_view' },
  '/admin/users':         { module: 'users',           action: 'can_view' },
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const token = req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  try {
    const { payload } = await jwtVerify(token, secret)
    const permissions = payload.permissions as import('@/types').PermissionsMap

    // Find the most specific matching route prefix
    const matchedRoute = Object.keys(routePermissions).find(r => pathname.startsWith(r))
    if (matchedRoute) {
      const { module, action } = routePermissions[matchedRoute]
      if (!permissions[module]?.[action]) {
        return NextResponse.redirect(new URL('/admin/forbidden', req.url))
      }
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = { matcher: ['/admin/:path*'] }
