# Plan Técnico — Web + Admin El Chino Americano

> Stack: Next.js 14 · Supabase · Cloudinary · Vercel · JWT nativo  
> Objetivo: catálogo público con SEO + panel admin privado, costo inicial ~$0.83/mes

---

## Stack y arquitectura

### Servicios

| Capa | Servicio | Plan | Costo |
|---|---|---|---|
| Hosting + CDN | Vercel | Free tier | $0/mes |
| Base de datos | Supabase | Free tier (500MB) | $0/mes |
| Auth | JWT nativo (jose + bcryptjs) | Sin servicio externo | $0/mes |
| Imágenes | Cloudinary | Free tier (25GB) | $0/mes |
| Dominio | Porkbun / Namecheap | Anual | ~$0.83/mes |
| **Total** | | | **~$0.83/mes** |

### Estructura del proyecto

```
app/
├── (public)/                  ← catálogo visible para clientes
│   ├── page.tsx               ← landing
│   ├── catalogo/page.tsx      ← listado de productos
│   └── catalogo/[slug]/       ← página de producto (ISR)
│
├── (admin)/                   ← protegido por middleware
│   ├── layout.tsx             ← verifica JWT en cookie
│   ├── dashboard/page.tsx
│   ├── productos/page.tsx     ← CRUD productos
│   ├── categorias/page.tsx
│   └── inventario/page.tsx
│
├── api/
│   └── revalidate/route.ts    ← revalida ISR al guardar producto
│
└── middleware.ts               ← bloquea /admin sin sesión activa
```

### Flujo de actualización del catálogo

```
Admin guarda producto
        ↓
Server Action (Next.js)
        ↓
Guarda en Supabase + sube imagen a Cloudinary
        ↓
revalidatePath('/catalogo')
        ↓
Catálogo público actualizado en segundos (sin redeploy)
```

---

## Fase 1 — Base del proyecto

**Duración estimada: semana 1–2**

### Tareas

1. **Crear proyecto Next.js 16**
   - Usar App Router + TypeScript + Tailwind CSS
   - Conectar repositorio a Vercel para deploy automático en cada push
   - Comando: `npx create-next-app@latest`

2. **Configurar Supabase**
   - Crear proyecto en supabase.com
   - Instalar SDK: `npm install @supabase/supabase-js`
   - Configurar variables de entorno en Vercel:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_KEY`

3. **Schema de base de datos**
   - Tablas: `productos`, `categorias`, `inventario`
   - Gestionar migraciones con Supabase CLI en `/supabase/migrations`
   - Versionar migraciones en el repositorio

4. **Auth JWT nativo**
   - Tabla `usuarios` en Supabase con campos: `id`, `email`, `password_hash`, `created_at`
   - Contraseña hasheada con `bcryptjs` — nunca se guarda en texto plano
   - Al hacer login, se verifica el hash y se firma un JWT con `jose`
   - El token se guarda en una cookie `httpOnly + secure + sameSite: strict` (no accesible desde JS)
   - Variables de entorno necesarias:
     - `JWT_SECRET` — clave secreta para firmar los tokens
     - `JWT_EXPIRES_IN` — expiración, ej. `"8h"`

   Flujo completo:

   ```
   POST /api/auth/login
           ↓
   Busca usuario en DB por email
           ↓
   bcrypt.compare(password, hash)
           ↓
   jose.SignJWT({ userId, email })
           ↓
   Cookie httpOnly con el token
           ↓
   Redirect a /admin/dashboard
   ```

   Librerías:
   ```bash
   npm install jose bcryptjs
   npm install -D @types/bcryptjs
   ```

5. **Middleware de autenticación**
   - Intercepta todas las rutas `/admin/*`
   - Lee la cookie del JWT y lo verifica con `jose` (compatible con Edge Runtime de Vercel)
   - Redirige a `/login` si el token no existe, es inválido o está expirado
   - `jsonwebtoken` no usar — no funciona en Edge Runtime, `jose` sí

   ```typescript
   // middleware.ts
   import { jwtVerify } from 'jose'
   import { NextRequest, NextResponse } from 'next/server'

   export async function middleware(req: NextRequest) {
     const token = req.cookies.get('admin_token')?.value
     if (!token) return NextResponse.redirect(new URL('/login', req.url))

     try {
       await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
       return NextResponse.next()
     } catch {
       return NextResponse.redirect(new URL('/login', req.url))
     }
   }

   export const config = { matcher: ['/admin/:path*'] }
   ```

6. **Página de login admin**
   - Formulario simple email/contraseña
   - Sin registro público — el usuario admin se inserta directamente en la DB con el hash generado
   - Redirige a `/admin/dashboard` tras login exitoso
   - Endpoint de logout: borra la cookie y redirige a `/login`

> **Nota:** El proyecto de Supabase free tier se pausa tras 7 días sin actividad. Configurar un cron job en Vercel (gratis) que haga un ping periódico para mantenerlo activo. El auth JWT es completamente independiente de Supabase — si migras la DB, el sistema de autenticación no cambia.

---

## Fase 2 — Panel administrador

**Duración estimada: semana 3–4**

### Módulos

#### A. Dashboard

- Métricas rápidas: total de productos, categorías, productos sin stock
- Listado de últimos productos agregados o modificados

#### B. Gestión de productos

Campos por producto:
- Nombre y slug (URL amigable)
- Descripción
- Precio de referencia
- Categoría
- Marcas de vehículos compatibles
- Imágenes (upload directo a Cloudinary)
- Estado: activo / inactivo

Acciones: crear, editar, eliminar, activar/desactivar.

#### C. Gestión de categorías

- Categorías base: Frenos, Filtros, Carrocería, Motor, Suspensión y dirección, Sistema de enfriamiento
- Estructura padre / hijo para subcategorías
- CRUD simple

#### D. Control de inventario

- Cantidad disponible por producto
- Alerta visual cuando el stock está por debajo de un umbral configurable
- Sin sistema de ventas por ahora — solo control de cantidad

#### E. Revalidación automática

Al guardar o actualizar un producto desde el admin:

```typescript
// Server Action en Next.js
'use server'
import { revalidatePath } from 'next/cache'

export async function guardarProducto(data: ProductoForm) {
  await supabase.from('productos').upsert(data)
  revalidatePath('/catalogo')
  revalidatePath(`/catalogo/${data.slug}`)
}
```

El catálogo público se actualiza en segundos, sin necesidad de redeploy.

> **Buena práctica:** Usar Server Actions de Next.js para todo el CRUD del admin en lugar de API Routes separadas. Menos código, más seguro, y no consume invocaciones serverless adicionales.

---

## Fase 3 — Catálogo público

**Duración estimada: semana 5–6**

### Páginas

1. **Landing page**
   - Hero con identidad visual de El Chino Americano
   - Marcas compatibles (JAC, SWM, Jetour, Ford, Chevrolet, etc.)
   - Categorías destacadas
   - Botón de contacto por WhatsApp

2. **Catálogo con filtros**
   - Filtrar por categoría y marca
   - Búsqueda por nombre de producto
   - Paginación o scroll infinito
   - Renderizado ISR: se genera una vez, se cachea, no gasta serverless por visita

3. **Página de producto**
   - Galería de imágenes
   - Descripción y compatibilidad de vehículos
   - Indicador de stock disponible
   - Botón de WhatsApp con mensaje prellenado:  
     `"Hola, estoy interesado en el producto: [nombre]"`

4. **SEO técnico**
   - `generateMetadata()` por producto y categoría
   - `sitemap.xml` automático generado desde la base de datos
   - `robots.txt` configurado
   - Open Graph para previsualización en WhatsApp y redes sociales

5. **Dominio propio**
   - Comprar en Porkbun o Namecheap (~$10/año)
   - Conectar a Vercel con registro CNAME
   - HTTPS automático sin configuración extra

### Estrategia de renderizado

```
/catalogo            → ISR (revalida cada vez que se guarda un producto)
/catalogo/[slug]     → ISR por producto (generateStaticParams)
/admin/*             → SSR dinámico (requiere autenticación)
```

---

## Costos — arranque vs versión pagada

### Arranque (fase inicial)

| Servicio | Uso | Costo/mes |
|---|---|---|
| Vercel | Hosting + CDN + serverless | $0 |
| Supabase | DB + Auth | $0 |
| Cloudinary | Imágenes productos | $0 |
| Dominio | ~$10/año | ~$0.83 |
| **Total** | | **~$0.83/mes** |

### Versión pagada (cuando crezcas)

| Servicio | Plan | Costo/mes |
|---|---|---|
| Vercel Pro | Más bandwidth + logs + soporte | $20 |
| Supabase Pro | Sin pausa + 8GB + backups | $25 |
| Cloudinary Plus | 225GB storage | $89 |
| **Total** | | **~$134/mes** |

**Alternativa económica al crecer:** VPS propio en DigitalOcean o Hetzner (~$6–12/mes) con PostgreSQL propio. Más trabajo de configuración, pero control total y costo mucho más bajo.

---

## Migración futura de base de datos

La clave es **abstraer el acceso a datos desde el inicio**:

```typescript
// lib/db/productos.ts — hoy con Supabase
import { supabase } from '@/lib/supabase'

export async function getProductos() {
  return supabase.from('productos').select('*')
}

// Mañana, si migras a PostgreSQL propio, solo cambias este archivo
import { pool } from '@/lib/postgres'

export async function getProductos() {
  return pool.query('SELECT * FROM productos')
}
```

El resto de la aplicación no cambia.

### Opciones de migración

#### Opción A — Supabase Pro
- **Cuándo:** cuando los 500MB estén llenos o el proyecto sea crítico
- **Dificultad:** ninguna — solo cambias el plan en el panel
- **Cambios de código:** 0

#### Opción B — VPS propio (DigitalOcean / Hetzner)
- **Cuándo:** cuando quieras control total y reducir costos a largo plazo
- **Dificultad:** media — requiere configurar PostgreSQL, backups y seguridad
- **Pasos:**
  1. `pg_dump` desde Supabase para exportar los datos
  2. Levantar PostgreSQL en VPS
  3. Cambiar variables de entorno en Vercel
  4. Actualizar `lib/db/` con el nuevo cliente de conexión

#### Opción C — Neon (PostgreSQL serverless)
- **Cuándo:** si Supabase se pausa con frecuencia y no quieres pagar aún
- **Free tier:** permanente, sin pausas
- **Pasos:**
  1. Exportar schema SQL desde Supabase
  2. Migrar datos con `pg_dump`
  3. Actualizar la cadena de conexión

---

## Roles y permisos

### Diseño del sistema

Dos capas: **roles** (quién es el usuario) y **permisos por módulo** (qué puede hacer en cada sección). Los permisos se definen al crear el rol y se verifican tanto en el middleware como en los Server Actions.

### Roles base

| Rol | Descripción | Puede crear usuarios |
|---|---|---|
| `superadmin` | Acceso total, sin restricciones | Sí |
| `admin` | Acceso a todos los módulos, sin gestión de usuarios | No |
| `empleado` | Acceso solo a módulos permitidos (configurable) | No |

Solo el `superadmin` puede crear usuarios y asignar roles. No hay registro público.

### Schema de base de datos

```sql
-- Roles disponibles
CREATE TABLE roles (
  id        SERIAL PRIMARY KEY,
  nombre    VARCHAR(50) UNIQUE NOT NULL  -- 'superadmin', 'admin', 'empleado'
);

-- Módulos del sistema
CREATE TABLE modulos (
  id      SERIAL PRIMARY KEY,
  clave   VARCHAR(50) UNIQUE NOT NULL  -- 'productos', 'categorias', 'inventario', 'usuarios'
);

-- Permisos por rol y módulo
CREATE TABLE rol_permisos (
  rol_id    INT REFERENCES roles(id),
  modulo_id INT REFERENCES modulos(id),
  ver       BOOLEAN DEFAULT false,
  crear     BOOLEAN DEFAULT false,
  editar    BOOLEAN DEFAULT false,
  eliminar  BOOLEAN DEFAULT false,
  PRIMARY KEY (rol_id, modulo_id)
);

-- Usuarios del panel admin
CREATE TABLE usuarios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  nombre         VARCHAR(100),
  rol_id         INT REFERENCES roles(id),
  activo         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

### Permisos por defecto

| Módulo | superadmin | admin | empleado |
|---|---|---|---|
| Productos — ver | ✅ | ✅ | ✅ |
| Productos — crear/editar | ✅ | ✅ | ❌ |
| Productos — eliminar | ✅ | ✅ | ❌ |
| Inventario — ver | ✅ | ✅ | ✅ |
| Inventario — editar stock | ✅ | ✅ | ✅ |
| Categorías — gestionar | ✅ | ✅ | ❌ |
| Usuarios — gestionar | ✅ | ❌ | ❌ |

Los permisos del rol `empleado` son configurables por el superadmin al momento de crear o editar el rol.

### JWT payload

El token incluye el rol y los permisos para no consultar la DB en cada request:

```typescript
// Payload firmado al hacer login
{
  userId: "uuid",
  email: "admin@chinoamericano.com",
  rol: "empleado",
  permisos: {
    productos:   { ver: true,  crear: false, editar: false, eliminar: false },
    inventario:  { ver: true,  crear: false, editar: true,  eliminar: false },
    categorias:  { ver: true,  crear: false, editar: false, eliminar: false },
    usuarios:    { ver: false, crear: false, editar: false, eliminar: false }
  }
}
```

### Verificación en middleware

```typescript
// middleware.ts — verifica ruta y permiso necesario
const rutaPermisos: Record<string, { modulo: string; accion: string }> = {
  '/admin/productos':  { modulo: 'productos',  accion: 'ver' },
  '/admin/inventario': { modulo: 'inventario', accion: 'ver' },
  '/admin/usuarios':   { modulo: 'usuarios',   accion: 'ver' },
}

const { payload } = await jwtVerify(token, secret)
const ruta = rutaPermisos[req.nextUrl.pathname]

if (ruta && !payload.permisos[ruta.modulo]?.[ruta.accion]) {
  return NextResponse.redirect(new URL('/admin/sin-permiso', req.url))
}
```

### Verificación en Server Actions

El middleware protege las páginas, pero las acciones de escritura también se verifican:

```typescript
// lib/auth/verificar-permiso.ts
export async function verificarPermiso(modulo: string, accion: string) {
  const payload = await getJwtPayload()  // lee cookie del request actual
  if (!payload?.permisos[modulo]?.[accion]) {
    throw new Error('Sin permiso para esta acción')
  }
}

// Uso en un Server Action
export async function eliminarProducto(id: string) {
  await verificarPermiso('productos', 'eliminar')
  await supabase.from('productos').delete().eq('id', id)
  revalidatePath('/catalogo')
}
```

### Módulo de gestión de usuarios (solo superadmin)

Pantalla en `/admin/usuarios` accesible únicamente para el `superadmin`:
- Listar usuarios activos con su rol
- Crear usuario: nombre, email, contraseña temporal, rol
- Editar rol o desactivar usuario (no eliminar — solo desactivar para mantener historial)
- El superadmin no puede eliminarse a sí mismo ni cambiar su propio rol

> **Nota:** Si en el futuro necesitas roles completamente personalizables (crear roles con nombre libre y marcar permisos uno a uno), el schema ya lo soporta — solo agregas filas en `roles` y `rol_permisos` sin tocar el código.

---

## Cloudflare como capa intermedia

### Flujo de red

```
Usuario
   ↓
Cloudflare (DNS + CDN + protección)
   ↓
Vercel (Next.js)
```

En lugar de apuntar el dominio directamente a Vercel, los nameservers del dominio apuntan a Cloudflare y Cloudflare reenvía a Vercel. Se obtienen los beneficios de protección y CDN adicional sin costo extra.

### Beneficios del plan gratuito

| Beneficio | Detalle |
|---|---|
| DDoS protection | Absorbe ataques antes de que lleguen a Vercel |
| Firewall de aplicaciones | Bloquea bots, scrapers y tráfico malicioso |
| Cache adicional | Cachea assets estáticos antes de llegar a Vercel |
| Analytics | Visitas reales sin cookies, sin configuración de GDPR |
| Turnstile | CAPTCHA gratis — útil para proteger el login del admin |
| SSL/TLS | Certificado automático en paralelo al de Vercel |

### Advertencia — cache y Next.js ISR

Cloudflare por defecto intenta cachear todo. Con ISR esto puede causar que Cloudflare sirva páginas viejas aunque Vercel ya las revalidó. Configurar estas reglas en Cloudflare:

```
Rules → Cache Rules:
- /admin/*  → Cache Level: Bypass
- /*        → Respect origin headers (x-vercel-cache)
```

### Setup paso a paso

1. Comprar dominio en Porkbun o Namecheap
2. Crear cuenta en cloudflare.com y agregar el dominio
3. Cambiar los nameservers del dominio a los que Cloudflare indique
4. En Cloudflare agregar registro `CNAME` apuntando a `cname.vercel-dns.com`
5. En Vercel → Settings → Domains → agregar el dominio personalizado
6. Cloudflare maneja SSL, protección y CDN — Vercel maneja la aplicación

### Cloudflare Workers KV (futuro)

No es necesario en esta fase, pero el free tier (100k lecturas/día, 1k escrituras/día) puede servir más adelante para:

- Cachear consultas frecuentes del catálogo sin golpear Supabase
- Rate limiting en el endpoint de login del admin
- Sesiones distribuidas si se escala horizontalmente

---

## Checklist de lanzamiento

- [ ] Proyecto Next.js creado y en Vercel
- [ ] Supabase configurado con schema de producción
- [ ] Auth JWT nativo funcionando — cookie httpOnly, middleware protegiendo /admin/*
- [ ] Roles y permisos configurados — superadmin, admin, empleado
- [ ] Módulo de gestión de usuarios accesible solo para superadmin
- [ ] CRUD de productos completo con upload de imágenes
- [ ] Revalidación ISR al guardar desde el admin
- [ ] Catálogo público con filtros y búsqueda
- [ ] Página de producto con Open Graph y metadata
- [ ] Sitemap.xml generado automáticamente
- [ ] Dominio propio conectado a Vercel
- [ ] Cloudflare configurado — nameservers, CNAME, cache rules para /admin/*
- [ ] Cron job activo para evitar pausa de Supabase
- [ ] Botón de WhatsApp en cada producto