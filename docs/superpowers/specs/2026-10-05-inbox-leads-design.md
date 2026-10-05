# Bandeja de leads (Inbox) — Diseño

Fecha: 2026-10-05 · Rama: `feature/inbox-leads`

## Objetivo

Dejar de depender de que el cliente envíe el mensaje de WhatsApp. Dos flujos públicos pasan a registrar un lead en el servidor (nombre + teléfono obligatorios) y el equipo lo procesa desde una bandeja en el admin:

1. **Solicitud de repuesto** — formulario `RequestPartForm` que aparece cuando el catálogo no tiene resultados.
2. **Pedido de carrito** — botón final del `CartDrawer`.

Todos los demás botones de WhatsApp (navbar, "Consultar" en tarjetas, "Consultar por WhatsApp" en ficha de producto) **no cambian** y no registran nada.

## 1. Modelo de datos

Tabla nueva `inbox_messages` (MySQL 8, Drizzle en `lib/db/schema.ts`):

| Columna | Tipo | Notas |
|---|---|---|
| `id` | int PK auto | |
| `type` | enum(`part_request`, `cart`) | Diferencia solicitud de búsqueda vs pedido |
| `name` | varchar(120) NOT NULL | |
| `phone` | varchar(30) NOT NULL | Normalizado (solo dígitos y `+` inicial) |
| `payload` | json NOT NULL | Datos específicos del tipo |
| `ip` | varchar(45) NULL | Para rate limit |
| `read_at` | timestamp NULL | NULL = no leído. Estado **compartido** por todo el equipo |
| `hidden_at` | timestamp NULL | NULL = visible. Ocultar es reversible |
| `deleted_at` | timestamp NULL | Borrado lógico. Excluido de todo listado y del contador |
| `created_at` | timestamp default now | |

Índices: `(created_at)`, `(read_at, hidden_at)`, `(ip, created_at)`.

Payloads:

- `part_request`: `{ repuesto, marcaVehiculo, modelo?, anio?, cilindraje?, nota?, searchQuery? }`
- `cart`: `{ items: [{ id, code, title, qty, unitPrice }], total }` — snapshot con precios **recalculados en el servidor** (precio vigente con descuento activo, misma regla que el catálogo). El precio enviado por el navegador se ignora.

Permisos: módulo nuevo `inbox` en `modules` / `role_permissions` (`can_view` ver, `can_edit` leer/ocultar, `can_delete` eliminar). Script de parche `lib/db/scripts/apply-inbox-table.ts` crea tabla, módulo y permisos (superadmin y admin con todo).

## 2. Flujo público

### Server Action `submitInboxMessage`

Ubicación: `modules/inbox/server/actions.ts` (fuera de `modules/admin` porque lo consume el sitio público). Pasos:

1. **Honeypot**: campo oculto `website`. Si viene lleno → responde `{ ok: true }` sin guardar.
2. **Validación Zod** (lógica pura en `modules/inbox/schema.ts`):
   - `name` 2–120 caracteres (trim).
   - `phone`: se eliminan espacios, guiones, paréntesis y puntos; debe quedar `^\+?\d{7,15}$`.
   - Payload discriminado por `type`. Carrito: 1–50 ítems, `qty` 1–99, `id` entero.
3. **Rate limit por IP**: IP desde `x-forwarded-for` (primer valor) / `x-real-ip`. Si hay ≥ 5 registros de esa IP en los últimos 10 minutos → error "Demasiados intentos, intenta en unos minutos".
4. **Carrito**: carga productos activos y no eliminados por `id`, arma ítems con precio vigente; descarta los inexistentes; si no queda ninguno → error.
5. Inserta y devuelve `{ ok: true }`. Errores de validación devuelven `{ ok: false, error, fieldErrors? }`.

### `RequestPartForm`

- Teléfono pasa a obligatorio (nombre ya lo era).
- Botón principal: **"Enviar solicitud"** (`useTransition`, deshabilitado mientras envía).
- Éxito: "¡Solicitud recibida! Un asesor te contactará pronto." + link secundario "¿Prefieres escribirnos ya? Abrir WhatsApp" (mismo mensaje armado de hoy).
- GA: evento `lead_submit` con `source: "repuesto"`. El link de WhatsApp sigue con `trackWhatsApp`.

### `CartDrawer`

- Campos Nombre y Teléfono en el footer; botón **"Enviar pedido"**.
- Éxito: "¡Pedido recibido! Un asesor te contactará pronto para confirmar disponibilidad y envío." + link secundario a WhatsApp con el mensaje del pedido. **Se vacía el carrito.**
- Nombre/teléfono recordados en `localStorage` (try/catch; si falla, simplemente no se recuerdan).
- GA: `lead_submit` con `source: "carrito"`.

### Errores

Fallo de red o servidor: mensaje en el formulario, **se conservan los datos** y se muestra el link a WhatsApp como alternativa.

## 3. Panel admin `/admin/inbox` ("Bandeja")

### Estructura

- `app/admin/inbox/page.tsx` — listado (Server Component).
- `app/admin/inbox/[id]/page.tsx` — detalle; al abrir marca como leído (si tiene `can_edit`).
- `lib/db/inbox.ts` — repositorio: `listInbox`, `countUnread`, `getInboxMessage`, `insertInboxMessage`, `countRecentByIp`, `setRead`, `setHidden`, `softDelete`, `markAllRead`.
- `modules/admin/inbox/` — `types.ts` (`INBOX_PERMISSION_KEYS`), `server/actions.ts`, `components/`.
- `lib/routes.ts` — `routes.admin.inbox.{index, detail}`.

### Badge

`app/admin/layout.tsx` llama `countUnread()` (no leídos, no ocultos, no eliminados, sin filtro de fecha) y lo pasa a `SidebarNav` y `MobileAdminHeader`. Pastilla roja junto a "Bandeja" (`99+` si excede); en móvil también un punto en el botón de menú. Se actualiza al cargar el panel y tras cada acción de la bandeja (incluido abrir un lead); no en cada navegación del cliente ni en tiempo real.

### Listado

- Filtros como query params:
  - `type`: Todos · Solicitudes · Pedidos de carrito.
  - `unread=1`: solo no leídos.
  - `from` / `to` (`<input type="date">`). **Default: últimos 30 días** en hora de Ecuador (`lib/today-ecuador.ts`). Botón "Últimos 30 días" para restablecer.
  - `hidden=1`: incluir ocultos.
  - `search`: nombre o teléfono. Todos los filtros viven en un único `<form method="get">` nativo (sin JS), porque `AdminSearchInput` descarta los demás params.
  - `page`: paginación de 50.
- Fila: badge de tipo (🔍 "Solicitud" slate / 🛒 "Pedido" `brand`), no leídos en negrita con punto, nombre, teléfono, resumen ("Filtro de aceite · Chery Tiggo 5 2020" o "3 productos · $45.20"), fecha corta absoluta en hora de Ecuador.
- Acciones por fila: marcar leído/no leído, ocultar/mostrar, eliminar (confirmación; solo con `can_delete`).
- Acción masiva: "Marcar todo como leído" sobre el filtro actual.

### Detalle

Todos los datos; en carrito, tabla de productos con link a la ficha pública y total. Botón **"Contactar por WhatsApp"** → `wa.me/<teléfono del cliente>` con saludo prellenado ("Hola {nombre}, te escribimos de El Chino Americano por tu solicitud de…"). Botones ocultar, marcar no leído, eliminar.

### Seguridad

Cada acción admin verifica permiso en servidor. Eliminar registra en `audit_log` vía `lib/audit.ts`. El detalle y el listado están detrás del login existente.

## 4. Pruebas

- Test de lógica pura (`modules/inbox/schema.test.ts` o equivalente al patrón de tests existente): normalización/validación de teléfono, schema por tipo, rango de fechas por defecto, armado del payload del carrito con precios del servidor.
- Verificación manual: enviar ambos formularios, ver badge, filtrar, ocultar, eliminar, rate limit, honeypot.

## Fuera de alcance (futuro)

- Cloudflare Turnstile (siguiente paso anti-spam).
- Notificaciones push/email al llegar un lead.
- Actualización en tiempo real del badge.
- Estados de lead (contactado, cerrado) y conversión de lead a Pedido.
