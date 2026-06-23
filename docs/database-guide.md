# Guía de Base de Datos — El Chino Americano

## Índice

1. [Cómo funciona el sistema](#cómo-funciona-el-sistema)
2. [Ambiente Local — MySQL](#ambiente-local--mysql)
3. [Producción — Supabase (PostgreSQL)](#producción--supabase-postgresql)
4. [Cómo funcionan las migraciones](#cómo-funcionan-las-migraciones)
5. [Agregar una tabla nueva](#agregar-una-tabla-nueva)
6. [Agregar una columna a una tabla existente](#agregar-una-columna-a-una-tabla-existente)
7. [Drizzle Studio — GUI visual de la DB](#drizzle-studio--gui-visual-de-la-db)
8. [Comandos de referencia rápida](#comandos-de-referencia-rápida)
9. [Preguntas frecuentes](#preguntas-frecuentes)

---

## Cómo funciona el sistema

El proyecto usa **Drizzle ORM** como capa de acceso a la base de datos. Drizzle permite:

- Definir el schema de la DB en TypeScript (un solo archivo por dialecto)
- Generar automáticamente el SQL de migraciones para cada motor (MySQL o PostgreSQL)
- Ejecutar queries con autocompletado y tipos — sin escribir SQL a mano
- Conectar a cualquier motor solo cambiando la variable `DATABASE_URL`

### Archivos clave

```
lib/db/
├── schema.ts         ← Schema PostgreSQL (producción / Supabase)
├── schema.mysql.ts   ← Schema MySQL (desarrollo local)
└── client.ts         ← Exporta `getDb()` — se conecta según APP_ENV

drizzle.config.ts         ← Config drizzle-kit para PostgreSQL
drizzle.mysql.config.ts   ← Config drizzle-kit para MySQL

.env.local   ← Variables de desarrollo (APP_ENV=local, DATABASE_URL=mysql://...)
.env         ← Variables de producción (APP_ENV=prod, DATABASE_URL=postgresql://...)
```

### Cómo se selecciona la DB

```
APP_ENV=local  →  usa mysql2  →  DATABASE_URL=mysql://...
APP_ENV=prod   →  usa postgres  →  DATABASE_URL=postgresql://...
```

---

## Ambiente Local — MySQL

### Requisitos

- Docker corriendo con una imagen de MySQL 8.0+
- Node.js 18+

### Paso 1 — Crear la base de datos

Conéctate a tu contenedor MySQL:

```bash
# Reemplaza <nombre-contenedor> con el nombre real de tu contenedor
docker exec -it <nombre-contenedor> mysql -u root -p
```

Dentro de MySQL, crea la base de datos:

```sql
CREATE DATABASE elchinoamericano
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Verifica que se creó
SHOW DATABASES;

EXIT;
```

### Paso 2 — Configurar `.env.local`

Edita el archivo `.env.local` en la raíz del proyecto:

```env
APP_ENV=local

# Ajusta usuario y password según tu contenedor
DATABASE_URL=mysql://root:TU_PASSWORD@localhost:3306/elchinoamericano
```

> **Nota:** Si tu contenedor MySQL expone un puerto distinto al 3306, cámbialo aquí.

### Paso 3 — Crear las tablas (migración inicial)

```bash
# Opción A — Push directo (más rápido, no guarda historial SQL)
npm run db:push:mysql

# Opción B — Generar SQL + aplicar (recomendado)
npm run db:generate:mysql   # crea archivos SQL en supabase/migrations/drizzle-mysql/
npm run db:migrate:mysql    # aplica las migraciones pendientes
```

Verás una salida similar a:

```
✓ Created table `roles`
✓ Created table `modules`
✓ Created table `role_permissions`
✓ Created table `users`
... (todas las tablas)
Migration applied successfully
```

### Paso 4 — Cargar los datos de prueba (seeds)

Los seeds son archivos SQL en `supabase/migrations/`. Córrelos en orden:

```bash
# Ajusta <contenedor> y <password>
docker exec -i <contenedor> mysql -u root -p<password> elchinoamericano \
  < supabase/migrations/002_seed.sql

docker exec -i <contenedor> mysql -u root -p<password> elchinoamericano \
  < supabase/migrations/003_vehicles_extended.sql

docker exec -i <contenedor> mysql -u root -p<password> elchinoamericano \
  < supabase/migrations/004_users_dev.sql

docker exec -i <contenedor> mysql -u root -p<password> elchinoamericano \
  < supabase/migrations/005_suppliers_seed.sql
```

> El archivo `001_schema.sql` NO se corre en MySQL porque Drizzle ya creó las tablas en el paso 3. Ese archivo es la referencia original de PostgreSQL.

### Paso 5 — Levantar la app

```bash
npm run dev
```

La app corre en `http://localhost:3000`. El panel admin en `http://localhost:3000/admin`.

---

## Producción — Supabase (PostgreSQL)

### Paso 1 — Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New Project**
2. Elegir nombre, password (guárdalo bien) y región más cercana (US East o São Paulo)
3. Esperar ~2 minutos a que el proyecto se inicialice

### Paso 2 — Obtener las credenciales

En el dashboard de Supabase:

**Para el ORM (conexión directa a PostgreSQL):**
- `Settings` → `Database` → `Connection string` → pestaña `URI`
- Copia la URL, se ve así: `postgresql://postgres:[TU-PASSWORD]@db.[REF].supabase.co:5432/postgres`
- Esta va en `DATABASE_URL`

**Para el cliente JS (auth, storage):**
- `Settings` → `API`
- Copia `Project URL` → va en `NEXT_PUBLIC_SUPABASE_URL`
- Copia `anon public` → va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copia `service_role secret` → va en `SUPABASE_SERVICE_KEY`

### Paso 3 — Configurar `.env`

Edita el archivo `.env` en la raíz del proyecto:

```env
APP_ENV=prod

DATABASE_URL=postgresql://postgres:TU-PASSWORD@db.TU-REF.supabase.co:5432/postgres

NEXT_PUBLIC_SUPABASE_URL=https://TU-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

JWT_SECRET=genera-con-openssl-rand-base64-48
JWT_EXPIRES_IN=8h

CLOUDINARY_CLOUD_NAME=tu-cloud
CLOUDINARY_API_KEY=tu-key
CLOUDINARY_API_SECRET=tu-secret
```

Para generar el `JWT_SECRET`:

```bash
openssl rand -base64 48
```

### Paso 4 — Crear las tablas en Supabase

```bash
# Con DATABASE_URL apuntando a Supabase:
npm run db:push        # push directo
# O con migraciones:
npm run db:generate    # genera SQL
npm run db:migrate     # aplica
```

### Paso 5 — Cargar los seeds en Supabase

Desde el dashboard de Supabase → `SQL Editor`, pega y ejecuta en orden:

1. `supabase/migrations/002_seed.sql`
2. `supabase/migrations/003_vehicles_extended.sql`
3. `supabase/migrations/004_users_dev.sql` ← cambiar passwords antes de prod
4. `supabase/migrations/005_suppliers_seed.sql`

O con la CLI de Supabase (si la tienes instalada):

```bash
supabase db push
```

---

## Cómo funcionan las migraciones

Las migraciones son la forma de **versionar los cambios en la estructura** de la base de datos. Similar a los commits de git pero para la DB.

### Flujo de trabajo

```
1. Cambias el schema en TypeScript (schema.ts o schema.mysql.ts)
      ↓
2. Drizzle detecta la diferencia con la DB actual
      ↓
3. Genera un archivo SQL con los cambios (ALTER TABLE, CREATE TABLE, etc.)
      ↓
4. Aplicas ese SQL a la DB
```

### Ejemplo concreto

Supón que agregas la columna `views` a productos (paso a paso en la siguiente sección).

Después de cambiar el schema y correr `db:generate`, Drizzle crea un archivo como:

```
supabase/migrations/drizzle-mysql/
└── 0001_add_views_to_products.sql
```

Con contenido generado automáticamente:

```sql
ALTER TABLE `products` ADD `views` int NOT NULL DEFAULT 0;
```

Cuando corres `db:migrate`, ese archivo se aplica y se registra en una tabla interna `__drizzle_migrations` para no volver a aplicarlo.

### Push vs Migrate

| `db:push` | `db:migrate` |
|-----------|-------------|
| Aplica cambios directamente sin guardar archivos SQL | Genera archivos SQL y los aplica |
| Ideal para desarrollo rápido | Ideal para producción y equipo |
| No hay historial de cambios | Historial completo en `drizzle-mysql/` o `drizzle-pg/` |
| Puede perder datos en cambios destructivos | Más seguro, pide confirmación |

**Regla práctica:**
- **Local:** usa `db:push` cuando estás explorando. Usa `db:migrate` cuando el cambio está definido.
- **Producción (Supabase):** siempre usa `db:migrate` para tener historial.

---

## Agregar una tabla nueva

Ejemplo: agregar una tabla `promotions` para manejar banners de ofertas.

### Paso 1 — Agregar la tabla al schema TypeScript

Abre `lib/db/schema.ts` (PostgreSQL) y agrega al final (antes de los types inferidos):

```typescript
export const promotions = pgTable('promotions', {
  id:          serial('id').primaryKey(),
  title:       varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  imageUrl:    varchar('image_url', { length: 500 }),
  validFrom:   timestamp('valid_from').notNull(),
  validUntil:  timestamp('valid_until'),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at').defaultNow(),
})
```

Haz lo mismo en `lib/db/schema.mysql.ts` pero con `mysqlTable` e `int` en lugar de `serial` e `integer`:

```typescript
export const promotions = mysqlTable('promotions', {
  id:          int('id').autoincrement().primaryKey(),
  title:       varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  imageUrl:    varchar('image_url', { length: 500 }),
  validFrom:   timestamp('valid_from').notNull(),
  validUntil:  timestamp('valid_until'),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at').defaultNow(),
})
```

### Paso 2 — Generar y aplicar la migración

```bash
# Para MySQL local:
npm run db:generate:mysql   # genera el SQL
npm run db:migrate:mysql    # aplica el SQL

# Para PostgreSQL (Supabase):
npm run db:generate         # genera el SQL
npm run db:migrate          # aplica el SQL
```

Drizzle crea el archivo SQL automáticamente. No escribes SQL a mano.

### Paso 3 — Agregar el tipo inferido (opcional pero recomendado)

Al final de `lib/db/schema.ts`:

```typescript
export type Promotion    = InferSelectModel<typeof promotions>
export type NewPromotion = InferInsertModel<typeof promotions>
```

### Paso 4 — Usar la tabla en código

```typescript
import { db } from '@/lib/db/client'
import { promotions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Listar promociones activas
const activePromos = await (await db()).query.promotions.findMany({
  where: eq(promotions.isActive, true),
})

// Crear una promoción
await (await db()).insert(promotions).values({
  title:     'Oferta de verano',
  validFrom: new Date(),
  validUntil: new Date('2025-12-31'),
})
```

---

## Agregar una columna a una tabla existente

Ejemplo: agregar `view_count` a la tabla `products`.

### Paso 1 — Agregar la columna en el schema

En `lib/db/schema.ts`:

```typescript
export const products = pgTable('products', {
  // ... columnas existentes ...
  viewCount: integer('view_count').notNull().default(0),   // ← agregar aquí
  isActive:  boolean('is_active').default(true),
  // ...
})
```

En `lib/db/schema.mysql.ts`:

```typescript
export const products = mysqlTable('products', {
  // ... columnas existentes ...
  viewCount: int('view_count').notNull().default(0),   // ← agregar aquí
  isActive:  boolean('is_active').default(true),
  // ...
})
```

### Paso 2 — Generar y aplicar

```bash
npm run db:generate:mysql && npm run db:migrate:mysql
# O para prod:
npm run db:generate && npm run db:migrate
```

Drizzle genera:

```sql
ALTER TABLE `products` ADD `view_count` int NOT NULL DEFAULT 0;
```

Y lo aplica automáticamente. Las filas existentes quedan con el valor `0` por defecto.

---

## Drizzle Studio — GUI visual de la DB

Drizzle Studio es una interfaz web que te permite:

- **Ver todas las tablas** y sus datos
- **Filtrar, buscar y paginar** registros
- **Editar registros** directamente (útil para corregir datos en dev)
- **Insertar y eliminar** filas sin escribir SQL
- **Ver las relaciones** entre tablas

### Cómo abrirlo

```bash
# Para MySQL local:
npm run db:studio:mysql

# Para PostgreSQL:
npm run db:studio
```

Se abre automáticamente en el navegador en `https://local.drizzle.studio`.

### Cuándo usarlo

- **Verificar que los seeds se aplicaron bien** — ver si hay datos en las tablas
- **Revisar datos de prueba** durante desarrollo
- **Corregir un campo mal puesto** sin entrar al cliente MySQL/psql
- **Entender la estructura** de la DB visualmente antes de escribir código

> ⚠️ No uses Drizzle Studio en producción para editar datos críticos. Úsalo solo en desarrollo o para consultas de solo lectura en prod.

---

## Comandos de referencia rápida

### MySQL local

```bash
npm run db:push:mysql        # aplica schema directamente (sin archivos SQL)
npm run db:generate:mysql    # genera archivos SQL de migración
npm run db:migrate:mysql     # aplica migraciones pendientes
npm run db:studio:mysql      # abre GUI en el browser
```

### PostgreSQL / Supabase

```bash
npm run db:push              # aplica schema directamente
npm run db:generate          # genera archivos SQL de migración
npm run db:migrate           # aplica migraciones pendientes
npm run db:studio            # abre GUI en el browser
```

### Equivalencia con Laravel

| Laravel (`php artisan`) | Drizzle MySQL local | Drizzle PostgreSQL |
|---|---|---|
| `migrate` | `db:migrate:mysql` | `db:migrate` |
| `migrate:fresh` | `db:push:mysql` | `db:push` |
| `make:migration` | editas `schema.mysql.ts` | editas `schema.ts` |
| `migrate:rollback` | no disponible\* | no disponible\* |
| `db:seed` | corres el `.sql` manualmente | SQL Editor en Supabase |
| `migrate:status` | `db:studio:mysql` | `db:studio` |

> \* Drizzle no tiene rollback automático. Para revertir: edita el schema y genera una nueva migración que deshaga el cambio (igual que en la práctica real con Laravel en producción).

---

## Preguntas frecuentes

**¿Por qué hay dos schemas (`schema.ts` y `schema.mysql.ts`)?**

Porque PostgreSQL y MySQL tienen diferentes tipos de columnas en algunos casos. Drizzle necesita un schema específico por dialecto. Los dos archivos son casi idénticos; la diferencia principal es `pgTable` + `serial` + `integer` (PG) vs `mysqlTable` + `int().autoincrement()` + `int` (MySQL).

**¿Qué pasa si cambio el schema pero no genero migración?**

La DB no cambia. El código TypeScript asume que la columna existe, pero la DB no la tiene → error en runtime. Siempre genera y aplica la migración después de cambiar el schema.

**¿Puedo usar Drizzle Studio con Supabase?**

Sí. Pon `DATABASE_URL` de Supabase en tu `.env` y corre `npm run db:studio`. Recuerda no editar datos críticos de producción desde ahí.

**¿Los seeds se vuelven a correr con cada migración?**

No. Las migraciones solo modifican la estructura (tablas/columnas). Los seeds son archivos SQL que corres manualmente una sola vez. Drizzle registra qué migraciones ya se aplicaron en la tabla `__drizzle_migrations`.

**¿Cómo conecto a la DB desde el código de la app?**

```typescript
import { getDb } from '@/lib/db/client'
import { products } from '@/lib/db/schema'

// En un Server Component o Server Action:
const db = await getDb()
const items = await db.select().from(products).where(...)
```

**¿El `APP_ENV` del `.env.local` sobreescribe al `.env`?**

Sí. Next.js carga los archivos en este orden de prioridad:
1. `.env.local` (máxima prioridad, ignorado en producción)
2. `.env.development` / `.env.production`
3. `.env` (mínima prioridad)

En desarrollo, `.env.local` siempre gana. En el servidor de producción, `.env.local` no existe, así que usa `.env`.
