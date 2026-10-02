// Verifica las sesiones del admin contra la base LOCAL: rotación del token de renovación,
// margen de gracia, detección de token reutilizado, vencimiento, cierre de sesión y usuario
// desactivado. Si hay un servidor en localhost:3000, prueba además el flujo real por HTTP
// (login → proxy renueva → logout). Se niega a correr fuera de localhost.
//
// Usa un usuario de prueba propio (check-sessions@test.local) con una contraseña aleatoria
// que se genera en cada corrida y no se imprime; al terminar lo deja desactivado.
//
// Correr con: npm run check:sessions
import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { sql } from 'drizzle-orm'
import { closeDb, getDb } from '@/lib/db/client'
import { loadDatabaseUrl } from '@/lib/db/config-env'
import { createSession, renewSession, revokeSession, revokeUserSessions } from '@/lib/auth/sessions'
import { ACCESS_COOKIE, REFRESH_COOKIE, parseRefreshCookie, verifyAccessToken } from '@/lib/auth/tokens'

const EMAIL = 'check-sessions@test.local'
const BASE = 'http://localhost:3000'

type Db = Awaited<ReturnType<typeof getDb>>

async function rows<T>(db: Db, query: ReturnType<typeof sql>) {
  const [result] = (await db.execute(query)) as unknown as [T[]]
  return result
}

async function ensureTestUser(db: Db, password: string) {
  const hash = await bcrypt.hash(password, 4)
  const [existing] = await rows<{ id: string }>(db, sql`SELECT id FROM users WHERE email = ${EMAIL}`)
  if (existing) {
    await db.execute(
      sql`UPDATE users SET is_active = 1, deleted_at = NULL, password_hash = ${hash} WHERE id = ${existing.id}`,
    )
    return existing.id
  }

  const [role] = await rows<{ id: number }>(db, sql`SELECT id FROM roles WHERE name = 'employee'`)
  assert.ok(role, 'se necesita el rol employee en la base local')
  const id = randomUUID()
  await db.execute(
    sql`INSERT INTO users (id, email, password_hash, full_name, role_id, is_active) VALUES (${id}, ${EMAIL}, ${hash}, 'Prueba de sesiones', ${role.id}, 1)`,
  )
  return id
}

async function open(userId: string) {
  const session = await createSession(userId, 'check-sessions')
  assert.ok(session, 'un usuario activo puede abrir sesión')
  return session
}

function sessionId(refreshCookie: string) {
  return parseRefreshCookie(refreshCookie)!.sessionId
}

async function expectRotated(refreshCookie: string) {
  const result = await renewSession(refreshCookie)
  assert.equal(result.status, 'rotated')
  if (result.status !== 'rotated') throw new Error('inalcanzable')
  return result
}

async function checkSessionRules(db: Db, userId: string) {
  // Login: el token de acceso es válido y lleva la sesión y los permisos.
  const first = await open(userId)
  const payload = await verifyAccessToken(first.accessToken)
  assert.equal(payload?.userId, userId)
  assert.equal(payload?.sid, sessionId(first.refreshCookie))
  assert.equal(typeof payload?.permissions, 'object')
  assert.equal(await verifyAccessToken(`${first.accessToken}x`), null, 'un token alterado no pasa')

  // Rotación: cada renovación entrega un token nuevo distinto.
  const r1 = first.refreshCookie
  const second = await expectRotated(r1)
  assert.notEqual(second.refreshCookie, r1)

  // Petición en paralelo con el token recién rotado: entra, pero no vuelve a rotar.
  const parallel = await renewSession(r1)
  assert.equal(parallel.status, 'grace', 'el token anterior sirve dentro del margen de gracia')
  assert.equal((await renewSession(second.refreshCookie)).status, 'rotated', 'el token vigente sigue sirviendo')

  // r1 ya no es ni el vigente ni el anterior: alguien reutilizó un token viejo → se revoca todo.
  assert.equal((await renewSession(r1)).status, 'invalid', 'un token viejo reutilizado se rechaza')
  const [afterReuse] = await rows<{ revoked: number }>(
    db,
    sql`SELECT revoked_at IS NOT NULL AS revoked FROM sessions WHERE id = ${sessionId(r1)}`,
  )
  assert.equal(Number(afterReuse.revoked), 1, 'la reutilización revoca la sesión entera')

  // Margen de gracia vencido: el token anterior ya no entra y además tumba la sesión.
  const graceSession = await open(userId)
  const graceNext = await expectRotated(graceSession.refreshCookie)
  await db.execute(
    sql`UPDATE sessions SET rotated_at = NOW() - INTERVAL 2 MINUTE WHERE id = ${sessionId(graceSession.refreshCookie)}`,
  )
  assert.equal((await renewSession(graceSession.refreshCookie)).status, 'invalid')
  assert.equal((await renewSession(graceNext.refreshCookie)).status, 'invalid', 'tras el robo, ni el token nuevo sirve')

  // Sesión vencida por inactividad.
  const expired = await open(userId)
  await db.execute(
    sql`UPDATE sessions SET expires_at = NOW() - INTERVAL 1 MINUTE WHERE id = ${sessionId(expired.refreshCookie)}`,
  )
  assert.equal((await renewSession(expired.refreshCookie)).status, 'invalid')

  // Cierre de sesión: solo quien tiene el token puede cerrarla.
  const toLogout = await open(userId)
  const id = sessionId(toLogout.refreshCookie)
  await revokeSession('basura')
  await revokeSession(`${id}.${randomBytes(32).toString('base64url')}`)
  const stillOpen = await expectRotated(toLogout.refreshCookie)
  await revokeSession(stillOpen.refreshCookie)
  assert.equal((await renewSession(stillOpen.refreshCookie)).status, 'invalid', 'tras cerrar sesión no se renueva')

  // Cambio de contraseña o desactivación: se cierran todas las sesiones del usuario.
  const a = await open(userId)
  const b = await open(userId)
  await revokeUserSessions(userId)
  assert.equal((await renewSession(a.refreshCookie)).status, 'invalid')
  assert.equal((await renewSession(b.refreshCookie)).status, 'invalid')

  // Usuario desactivado: ni renueva ni abre sesión nueva.
  const beforeDeactivation = await open(userId)
  await db.execute(sql`UPDATE users SET is_active = 0 WHERE id = ${userId}`)
  assert.equal((await renewSession(beforeDeactivation.refreshCookie)).status, 'invalid')
  assert.equal(await createSession(userId, 'check-sessions'), null)
  await db.execute(sql`UPDATE users SET is_active = 1 WHERE id = ${userId}`)

  // Cookies mal formadas nunca llegan a consultar una sesión.
  for (const bad of [undefined, '', 'x', 'a.b.c', `${id}.corto`]) {
    assert.equal((await renewSession(bad)).status, 'invalid')
  }
}

function cookieHeader(jar: Record<string, string>) {
  return Object.entries(jar)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}

/** Cookies que el servidor mandó en esta respuesta: valor nuevo, o '' si la borró. */
function setCookies(res: Response) {
  const jar: Record<string, string> = {}
  for (const line of res.headers.getSetCookie()) {
    const [pair] = line.split(';')
    const index = pair.indexOf('=')
    jar[pair.slice(0, index)] = pair.slice(index + 1)
  }
  return jar
}

async function checkHttpFlow(password: string) {
  try {
    await fetch(`${BASE}/login`, { redirect: 'manual' })
  } catch {
    console.log('  (sin servidor en localhost:3000: se omite la prueba por HTTP)')
    return false
  }

  const get = (path: string, jar: Record<string, string>) =>
    fetch(`${BASE}${path}`, { redirect: 'manual', headers: { cookie: cookieHeader(jar) } })

  const wrong = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: `${password}x` }),
  })
  assert.equal(wrong.status, 401, 'contraseña incorrecta no abre sesión')
  assert.deepEqual(setCookies(wrong), {})

  const login = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password }),
  })
  assert.equal(login.status, 200)
  const issued = setCookies(login)
  assert.ok(issued[ACCESS_COOKIE] && issued[REFRESH_COOKIE], 'el login entrega las dos cookies')
  for (const line of login.headers.getSetCookie()) {
    assert.match(line, /HttpOnly/i)
    assert.match(line, /SameSite=strict/i)
  }

  // Con las dos cookies entra sin tocar nada.
  const normal = await get('/admin/dashboard', issued)
  assert.equal(normal.status, 200)
  assert.deepEqual(setCookies(normal), {}, 'con token de acceso vigente no se renueva nada')

  // Sin token de acceso (vencido): el proxy renueva y la página carga en la misma petición.
  const renewed = await get('/admin/dashboard', { [REFRESH_COOKIE]: issued[REFRESH_COOKIE] })
  assert.equal(renewed.status, 200, 'la página carga aunque el token de acceso haya vencido')
  const rotated = setCookies(renewed)
  assert.ok(rotated[ACCESS_COOKIE], 'llega un token de acceso nuevo')
  assert.ok(rotated[REFRESH_COOKIE] && rotated[REFRESH_COOKIE] !== issued[REFRESH_COOKIE], 'el token de renovación rotó')

  // Las rutas API del admin también se renuevan en el proxy (antes respondían 401 al vencer el token).
  const api = await fetch(`${BASE}/api/admin/inventory/movements`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: cookieHeader({ [REFRESH_COOKIE]: rotated[REFRESH_COOKIE] }) },
    body: '{}',
  })
  assert.notEqual(api.status, 401, 'la API reconoce la sesión renovada')
  const afterApi = { ...rotated, ...setCookies(api) }

  // Sin ninguna cookie: al login.
  const anonymous = await get('/admin/dashboard', {})
  assert.equal(anonymous.status, 307)
  assert.match(anonymous.headers.get('location') ?? '', /\/login$/)

  // Cerrar sesión invalida el token en el servidor.
  const logout = await get('/api/auth/logout', afterApi)
  assert.equal(logout.status, 307)
  const afterLogout = await get('/admin/dashboard', { [REFRESH_COOKIE]: afterApi[REFRESH_COOKIE] })
  assert.equal(afterLogout.status, 307, 'tras cerrar sesión el token de renovación ya no entra')
  assert.equal(setCookies(afterLogout)[REFRESH_COOKIE], '', 'y el proxy borra la cookie inválida')
  return true
}

async function main() {
  const { url } = loadDatabaseUrl('local')
  const host = new URL(url).hostname
  assert.ok(['localhost', '127.0.0.1', '::1'].includes(host), `solo corre contra una base local, no contra ${host}`)

  const db = await getDb()
  const password = randomBytes(18).toString('base64url')
  const userId = await ensureTestUser(db, password)

  try {
    await checkSessionRules(db, userId)
    console.log('✓ reglas de sesión OK (rotación, gracia, reutilización, vencimiento, cierre, usuario desactivado)')
    if (await checkHttpFlow(password)) console.log('✓ flujo por HTTP OK (login, renovación en el proxy, API, logout)')
  } finally {
    // El usuario de prueba nunca queda utilizable.
    await db.execute(sql`UPDATE users SET is_active = 0 WHERE id = ${userId}`)
    await revokeUserSessions(userId)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => closeDb())
