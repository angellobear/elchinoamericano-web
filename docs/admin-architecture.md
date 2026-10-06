# Admin Architecture

## Objective

Treat `admin` as a separate internal subproject inside the Next.js app with clear boundaries between:

- route layer
- module/domain layer
- shared admin layer
- infrastructure layer

## Important Scope Rule

Admin pages are internal tooling.

They do not require:

- SEO
- AEO
- GEO
- social-sharing metadata optimization

That work is reserved for customer-facing public routes.

## Current Route Layer

Location:

- `app/admin/**`

Current routes include:

- `app/admin/layout.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/categories/page.tsx`
- `app/admin/products/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/vehicle-brands/page.tsx`
- `app/admin/part-brands/page.tsx`
- `app/admin/suppliers/page.tsx`
- `app/admin/inventory/page.tsx`
- `app/admin/announcements/page.tsx`
- `app/admin/orders/page.tsx`

Shared route-adjacent components currently present:

- `app/admin/_components/ImageUploadField.tsx`
- `app/admin/_components/SidebarNav.tsx`
- `app/admin/_components/SubmitButton.tsx`
- `app/admin/_components/ToastOnMount.tsx`

## Layer Responsibilities

### 1. Route Layer

Location:

- `app/admin/**`

Responsibilities:

- define Next.js routes
- resolve params
- load data from module server logic
- render module UI

Rules:

- pages should stay thin
- avoid embedding domain logic directly in route files

### 2. Module Layer

Location:

- `modules/admin/**`

Responsibilities:

- module-specific components
- schemas
- server actions
- repositories
- types

Current module areas:

- `modules/admin/categories/**`
- `modules/admin/products/**`
- `modules/admin/users/**`
- `modules/admin/vehicle-brands/**`
- `modules/admin/part-brands/**`
- `modules/admin/suppliers/**`
- `modules/admin/announcements/**`
- `modules/admin/orders/**`
- `modules/admin/shared/**`

### 3. Shared Admin Layer

Location:

- `modules/admin/shared/**`

Responsibilities:

- reusable admin components
- shared action result contracts
- form helpers
- permission helpers

Current examples:

- `modules/admin/shared/components/AdminFormControls.tsx`
- `modules/admin/shared/components/AdminPageHeader.tsx`
- `modules/admin/shared/components/StatusToggleButton.tsx`
- `modules/admin/shared/components/ValidatedForm.tsx`
- `modules/admin/shared/server/form-data.ts`
- `modules/admin/shared/server/permissions.ts`
- `modules/admin/shared/server/zod.ts`
- `modules/admin/shared/types/action-result.ts`

### 4. Infrastructure Layer

Location:

- `lib/**`

Responsibilities:

- database access
- auth
- logging
- external integrations

Rule:

- infrastructure should not know about toasts, route revalidation strategy at the page UX level, or view concerns

## Current Recommended Organization

```text
app/admin/
  layout.tsx
  dashboard/page.tsx
  categories/page.tsx
  products/page.tsx
  users/page.tsx
  vehicle-brands/page.tsx
  part-brands/page.tsx
  suppliers/page.tsx
  inventory/page.tsx

modules/admin/
  shared/
    components/
    server/
    types/
  categories/
    components/
    form-schema.ts
  products/
    components/
    form-schema.ts
  users/
    components/
    form-schema.ts
  vehicle-brands/
    components/
    server/
    types.ts
  part-brands/
    components/
    server/
    types.ts
  suppliers/
    components/
    server/
    types.ts
```

## Actions and Repositories

Each admin module should own its own server action and repository boundary where needed.

Action responsibilities:

- validate auth and permissions
- validate input
- call repository logic
- trigger revalidation
- return a consistent result shape

Recommended shared result shape:

```ts
interface ActionResult<TData = void> {
  ok: boolean
  message: string
  data?: TData
  fieldErrors?: Record<string, string[]>
}
```

## Form Strategy

Preferred approach:

- native HTML validation for basic UX
- `zod` for server truth
- `ValidatedForm` for reusable admin behavior
- `react-hook-form` only when a view truly needs heavier client form UX

Suggested ownership:

- `modules/admin/<module>/form-schema.ts`
- `modules/admin/<module>/components/*Form*.tsx`

## Shared vs Local Rule

Put code in `shared` only when:

- multiple admin modules use it, or
- it is a true admin primitive, or
- it defines a cross-module contract

Keep code local to a module when:

- it knows one entity deeply
- it only serves one module’s workflow
- it contains labels, columns, or domain rules for one area

## Uploads Rule

Single-image helpers can stay generic.

For product-specific multi-image needs, prefer a dedicated product component under:

- `modules/admin/products/components/`

instead of pushing that complexity into generic shared inputs.

## Future Direction

This structure should remain flexible enough to support either:

1. Next.js admin with Server Actions
2. a future separate backend behind repositories

The key principle is to avoid coupling admin UI directly to raw DB calls inside route files or client components.

## Orders Module

- Pure domain (statuses, totals in integer cents, document view model): `lib/orders.ts`. No server imports; covered by `npm run check:orders`.
- Data access and transactional rules (payments, delivery, stock reversal): `lib/db/orders.ts`. Covered by `npm run check:orders:db`, which only runs against a local database and leaves two cancelled test orders behind.
- Tables are created with `npm run db:patch:orders` (idempotent), not `drizzle-kit push`.
- `db:patch:*` scripts target the local database by default. To apply one to another environment, pass its URL explicitly: `PATCH_DATABASE_URL=mysql://... npm run db:patch:orders`. The script prints the target host before writing.
- One template, `components/orders/OrderDocument.tsx`, renders the payment receipt, the delivery act and the public status page.
- Public verification route `/pedido/[token]` is deliberately excluded from SEO, sitemap, Google Analytics, Clarity and the announcement modal: the URL carries a secret token.

## Sessions

- Two `httpOnly`, `Secure`, `SameSite=Strict` cookies: `admin_token` (access JWT, 15 minutes) and `admin_refresh` (opaque token, 30 days sliding). Constants live in `lib/auth/tokens.ts`.
- The refresh token is stored only as a hash in the `sessions` table (`lib/auth/sessions.ts`), one row per device. It rotates on every renewal; the previous token stays valid for 60 seconds so parallel requests do not log the user out.
- Presenting an already-rotated token outside that window means it was reused by someone else: the whole session is revoked.
- Renewal happens in `proxy.ts` (Node.js runtime), before pages, `/api/admin/**` routes and server actions run, and the fresh access token is forwarded on the same request. Application code keeps calling `getJwtPayload()` and never deals with renewal.
- Each renewal re-reads the user and role permissions, so deactivating a user or changing permissions takes effect within 15 minutes without a new login.
- Logout, password change, deactivation and deletion revoke sessions server-side.
- The table is created with `npm run db:patch:sessions`. **It must exist in an environment before the code that uses it is deployed**, otherwise nobody can log in.
- Covered by `npm run check:sessions` (local database only; also exercises the real HTTP flow when a dev server is running on port 3000). It uses its own test user and leaves it deactivated.
- Expired and revoked rows are never purged; add a cleanup job if the table grows.

## Bandeja (inbox)

Leads del sitio público: solicitudes de repuesto no encontrado (`RequestPartForm`) y pedidos del carrito (`CartDrawer`).

- Tabla `inbox_messages` (parche: `npm run db:patch:inbox`). `payload` JSON según `type` (`part_request` | `cart`).
- Entrada pública: `modules/inbox/server/actions.ts` → `submitInboxMessage` (honeypot `website`, 5 envíos/IP/10 min, precios del carrito recalculados en servidor).
- Lógica pura y su check: `modules/inbox/schema.ts`, `npm run check:inbox`.
- Admin: `app/admin/inbox` (listado y detalle), acciones en `modules/admin/inbox/server/actions.ts`, repositorio `lib/db/inbox.ts`.
- Estado leído compartido (`read_at`), ocultar reversible (`hidden_at`), borrado lógico (`deleted_at`, auditado).
- Badge: `app/admin/layout.tsx` → `countUnread()`. Se actualiza al cargar el panel y tras cada acción de la bandeja (incluido abrir un lead); no en cada navegación del cliente ni en tiempo real.
- **La tabla y el permiso deben existir en producción antes de desplegar este código**: correr `PATCH_DATABASE_URL=<prod> npm run db:patch:inbox` antes del merge (el código anterior ignora la tabla) y luego cerrar sesión y volver a entrar para que el JWT traiga el permiso `inbox`. Sin esto, ambos formularios públicos devuelven error (con WhatsApp como alternativa) y /admin/inbox redirige a forbidden.
- Futuro: Cloudflare Turnstile, notificaciones, estados de lead, convertir a Pedido.

## Installable admin (PWA)

- `public/manifest-admin.webmanifest` plus icons in `public/pwa/`, linked only from `app/admin/layout.tsx` and `app/login/page.tsx` through `lib/pwa.ts`. Public pages do not link a manifest, so the storefront never offers installation.
- The whole admin is in the app (`scope: "/"`, `start_url: "/admin/dashboard"`), not just one module.
- No service worker: there is no offline mode. The installed app needs a connection, exactly like the admin in a browser tab.
