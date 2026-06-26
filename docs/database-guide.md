# Guía de Base de Datos — El Chino Americano

## Resumen

El proyecto usa **Drizzle ORM** y maneja dos motores:

- `MySQL` para desarrollo local
- `PostgreSQL` para producción en Supabase

Cada motor tiene:

- su propio schema TypeScript
- su propia config de Drizzle
- su propia carpeta de migraciones

Las migraciones fueron reinicializadas desde el estado actual del schema. Eso significa:

- la estructura actual ya está incluida en la **migración base**
- los parches viejos de estructura ya no se usan
- la auditoría ahora vive en la aplicación, no en triggers de la base

## Archivos clave

```text
lib/db/
├── schema.mysql.ts       # schema local MySQL
├── schema.ts             # schema PostgreSQL / Supabase
├── client.ts             # conexión runtime según APP_ENV
├── seed.ts               # seeder oficial
└── config-env.ts         # carga segura de .env / .env.local

drizzle.mysql.config.ts   # drizzle-kit para MySQL
drizzle.config.ts         # drizzle-kit para PostgreSQL

supabase/migrations/
├── drizzle-mysql/        # migraciones MySQL
├── drizzle-pg/           # migraciones PostgreSQL
├── 002_seed.sql          # seed SQL legado
├── 003_vehicles_extended.sql
├── 004_users_dev.sql
└── 005_suppliers_seed.sql
```

## Reglas de entorno

- `drizzle.mysql.config.ts` lee solo `.env.local`
- `drizzle.config.ts` lee solo `.env`
- `APP_ENV=local` usa MySQL
- `APP_ENV=prod` usa PostgreSQL

Variables esperadas:

```env
# .env.local
APP_ENV=local
DATABASE_URL=mysql://root:password@localhost:3306/elchinoamericano

# .env
APP_ENV=prod
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
```

## Estado actual de migraciones

### MySQL local

```text
supabase/migrations/drizzle-mysql/
├── 0000_initial_schema.sql
└── 0002_soft_delete.sql
```

### PostgreSQL / Supabase

```text
supabase/migrations/drizzle-pg/
├── 0000_initial_schema.sql
└── 0002_soft_delete.sql
```

## Auditoría

El proyecto ya no depende de triggers, procedures ni funciones SQL para auditar cambios.

Ahora la auditoría se hace a nivel aplicación:

- las operaciones de escritura pasan por `withAudit()`
- después de confirmar la transacción, se intenta escribir en `audit_log`
- si la auditoría falla, la operación principal **no falla**

Archivos clave:

```text
lib/audit.ts            # utilidades de auditoría tolerantes a fallos
lib/db/*.ts             # writes con auditoría explícita
app/api/**/*.ts         # rutas críticas también registran auditoría
```

Ventajas:

- funciona igual en MySQL 5.7, MySQL 8 y PostgreSQL
- no depende de permisos especiales para triggers
- no bloquea el flujo si el insert de auditoría falla

## Comandos y cuándo usar cada uno

### Generar migración

```bash
npm run db:generate:mysql
npm run db:generate
```

Úsalo cuando:

- cambiaste `schema.mysql.ts` o `schema.ts`
- quieres versionar ese cambio en SQL
- todavía no quieres tocar la base

Qué hace:

- compara el schema actual contra el historial de Drizzle
- crea un nuevo archivo SQL

No hace:

- no modifica la base

### Aplicar migraciones

```bash
npm run db:migrate:mysql
npm run db:migrate
```

Úsalo cuando:

- ya existe una migración generada
- quieres aplicar el historial pendiente a la base
- quieres un flujo estable y repetible

Qué hace:

- ejecuta los `.sql` pendientes
- registra el avance en `__drizzle_migrations`

Este es el flujo recomendado para el equipo.

### Push directo

```bash
npm run db:push:mysql
npm run db:push
```

Úsalo solo cuando:

- la base es descartable
- estás explorando rápido
- no te importa no dejar historial formal

No lo uses como flujo normal.

En MySQL puede fallar con tablas que tienen:

- primary keys compuestas
- foreign keys
- índices que MySQL no deja rearmar automáticamente

En este proyecto, `push` debe considerarse una herramienta de emergencia o prototipo, no la principal.

### Abrir Studio

```bash
npm run db:studio:mysql
npm run db:studio
```

Úsalo cuando:

- quieres inspeccionar tablas
- quieres revisar datos
- quieres validar visualmente relaciones o filas

No reemplaza migraciones.

### Seeder oficial

```bash
npm run db:seed:local
npm run db:seed:mysql
npm run db:seed:pg
npm run db:seed
```

Úsalo cuando:

- ya aplicaste las migraciones
- quieres datos mínimos de arranque

Qué hace:

- inserta roles
- módulos
- permisos
- categorías
- marcas
- proveedores
- usuarios de desarrollo

El seeder es **idempotente**. Puedes correrlo varias veces sin duplicar registros clave.

Notas:

- `db:seed:local` y `db:seed:mysql` hacen lo mismo: seed sobre MySQL local
- `db:seed` y `db:seed:pg` hacen lo mismo: seed sobre PostgreSQL
- si corres `db:seed` sin tener `DATABASE_URL` de PostgreSQL en `.env`, va a fallar

## Flujo recomendado de trabajo

### Si cambias estructura

1. Edita el schema correcto:
   - local: `lib/db/schema.mysql.ts`
   - prod: `lib/db/schema.ts`
2. Genera la migración:
   - `npm run db:generate:mysql`
   - `npm run db:generate`
3. Revisa el SQL generado.
4. Aplícala:
   - `npm run db:migrate:mysql`
   - `npm run db:migrate`

### Si solo quieres poblar datos

1. `npm run db:migrate:mysql`
2. `npm run db:seed:local`

o en PostgreSQL:

1. `npm run db:migrate`
2. `npm run db:seed`

## Reiniciar desde cero

### MySQL local

Usa este flujo si quieres reconstruir todo limpio desde el baseline actual.

1. Borra y recrea la base:

```sql
DROP DATABASE IF EXISTS elchinoamericano;
CREATE DATABASE elchinoamericano
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

2. Aplica migraciones:

```bash
npm run db:migrate:mysql
```

3. Carga datos base:

```bash
npm run db:seed:local
```

### PostgreSQL / Supabase

Si es un proyecto nuevo o una base limpia:

1. Configura `DATABASE_URL` en `.env`
2. Aplica migraciones:

```bash
npm run db:migrate
```

3. Carga datos base:

```bash
npm run db:seed
```

## Seeds SQL legados

Estos archivos todavía existen:

- `supabase/migrations/002_seed.sql`
- `supabase/migrations/003_vehicles_extended.sql`
- `supabase/migrations/004_users_dev.sql`
- `supabase/migrations/005_suppliers_seed.sql`

Sirven como referencia o carga manual adicional.

Pero el flujo oficial del proyecto ahora es:

- migraciones con Drizzle
- datos base con `lib/db/seed.ts`

## Qué se eliminó en la reinicialización

Se eliminaron del flujo activo:

- `001_schema.sql`
- `006_add_timestamps_publicids.sql`
- `007_vehicle_brands_web_visibility.sql`
- historial viejo de `drizzle-mysql/`
- historial viejo de `drizzle-pg/`

La razón es simple:

- esos cambios ya están absorbidos por la migración base nueva
- ya no hace falta reaplicarlos por separado

## Preguntas rápidas

### ¿Cuál comando uso normalmente?

Usa:

```bash
npm run db:generate:mysql
npm run db:migrate:mysql
```

para local, y:

```bash
npm run db:generate
npm run db:migrate
```

para PostgreSQL.

### ¿Cuál debería evitar?

Evita `db:push:mysql` como flujo normal.

### ¿Cómo sé si un cambio fue de estructura o solo de datos?

- estructura: tablas, columnas, constraints, índices, triggers
- datos: inserts, catálogos, usuarios, marcas, proveedores

### ¿Los triggers de auditoría salen del schema TypeScript?

No. Por eso viven en `0001_audit_triggers.sql` y no dentro de `0000_initial_schema.sql`.

### ¿Puedo regenerar todo otra vez en el futuro?

Sí, pero solo cuando de verdad quieras resetear el historial.
No debe hacerse como rutina normal del proyecto.
