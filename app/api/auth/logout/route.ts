import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  let origin = process.env.NEXT_PUBLIC_SITE_URL
  if (!origin) {
    const h = await headers()
    const proto = h.get('x-forwarded-proto') ?? 'http'
    const host = h.get('host') ?? 'localhost:3000'
    origin = `${proto}://${host}`
  }
  const res = NextResponse.redirect(new URL('/login', origin))
  res.cookies.set('admin_token', '', { maxAge: 0, path: '/' })
  return res
}
