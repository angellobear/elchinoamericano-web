# Admin Architecture

## Objetivo

Tratar `admin` como un subproyecto dentro de la app de Next.js, de forma que:

- `app/admin` sea solo la capa de rutas.
- `modules/admin` concentre la logica del dominio admin.
- `lib/db` quede como adaptador de infraestructura a la base de datos.
- Los componentes compartidos del admin vivan fuera de las rutas y puedan migrarse con menos friccion.

Esta estructura permite seguir usando Server Actions hoy, sin acoplar toda la UI directamente a Drizzle o al App Router.

## Capas

### 1. Route layer

Ubicacion: `app/admin/**`

Responsabilidad:

- definir rutas de Next.js
- resolver params
- cargar datos desde `modules/admin/**/server`
- renderizar vistas del modulo

Regla:

- las pages deben ser delgadas
- no deben contener mutaciones inline salvo casos excepcionales

### 2. Module layer

Ubicacion: `modules/admin/**`

Responsabilidad:

- tipos del modulo
- componentes del modulo
- server actions del modulo
- contratos entre UI y servidor
- repositorios del modulo que desacoplan la UI de `lib/db`

Cada modulo tiene, cuando aplica:

```text
modules/admin/<module>/
  components/
  server/
    actions.ts
    repository.ts
  types.ts
```

### 3. Shared admin layer

Ubicacion: `modules/admin/shared/**`

Responsabilidad:

- componentes compartidos por varios modulos
- tipos compartidos de acciones
- helpers server reutilizables

Ejemplos:

- `modules/admin/shared/components/StatusToggleButton.tsx`
- `modules/admin/shared/types/action-result.ts`
- `modules/admin/shared/server/permissions.ts`

### 4. Infrastructure layer

Ubicacion: `lib/**`

Responsabilidad:

- acceso real a DB
- auth
- logger
- integraciones externas

Regla:

- `lib/db` no debe conocer toasts, redirects ni UX
- esa orquestacion vive en Server Actions del modulo

## Estructura actual recomendada

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

## Reglas de organizacion

### Shared vs local

Algo es `shared` si:

- se usa en varios modulos, o
- es una primitive del admin, o
- define un contrato comun

Algo se queda local al modulo si:

- conoce labels, columnas o reglas de negocio de una sola entidad
- solo tiene sentido dentro de un modulo

### Server Actions

Cada modulo define sus propias Server Actions.

Las actions:

- validan sesion y permisos
- llaman a un repositorio del modulo
- revalidan rutas
- devuelven un `ActionResult`

Eso evita mezclar:

- acceso a DB
- auth
- mensajes de UI
- detalles del App Router

## Contratos compartidos

Todas las mutaciones del admin deberian converger en un shape comun:

```ts
interface ActionResult<TData = void> {
  ok: boolean
  message: string
  data?: TData
  fieldErrors?: Record<string, string[]>
}
```

Esto unifica:

- toasts
- formularios
- toggles
- manejo de errores de servidor

## Validacion de formularios

La estrategia recomendada es:

- validacion HTML nativa para feedback basico inmediato
- validacion cliente con `ValidatedForm` + `zod` para evitar submits invalidos
- validacion con `zod` en servidor como fuente de verdad
- `react-hook-form` solo cuando una pantalla necesite UX cliente compleja

Esto mantiene el bundle del admin liviano y funciona bien con Server Actions.

Ubicacion sugerida:

```text
modules/admin/<module>/form-schema.ts
modules/admin/<module>/components/*FormFields.tsx
```

## Rutas centralizadas

Las rutas deben salir de `lib/routes.ts`.

Eso evita strings hardcodeados en:

- pages
- links
- actions
- fetches cliente

Y deja el admin mejor preparado para una migracion futura.

## Uploads multiples en productos

`ImageUploadField` funciona bien para entidades con imagen unica.

Para productos, la direccion recomendada es crear un componente dedicado como:

```text
modules/admin/products/components/ProductImagesField.tsx
```

Ese componente debe soportar multiples archivos (`n` imagenes), orden, preview y eliminacion, sin meter esa complejidad en formularios simples como marcas o categorias.

## Decision sobre backend futuro

Esta arquitectura deja abierta cualquiera de estas rutas:

1. Mantener admin y backend dentro del mismo proyecto usando Server Actions.
2. Migrar despues a otro backend reemplazando `repository.ts` por un cliente HTTP o SDK.

La ventaja es que la UI del admin ya no depende directamente de `lib/db` en las rutas ni en los componentes cliente.

## Principios aplicados

- Colocation por modulo para mantener contexto cerca del uso.
- Shared explicito solo cuando hay reutilizacion real.
- Server Actions autenticadas como capa de aplicacion.
- Separacion entre dominio admin e infraestructura DB.
- Pages delgadas para reducir acoplamiento con App Router.
