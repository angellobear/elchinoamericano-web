# Guia de Base de Datos

## Resumen

El proyecto ahora usa una sola base de datos: `MySQL`.

- Un solo schema: `lib/db/schema.ts`
- Un solo config de Drizzle: `drizzle.config.ts`
- Un solo historial de migraciones: `supabase/migrations/drizzle-mysql/`
- Un solo cliente runtime: `lib/db/client.ts`

La idea es simple:

- local y servidor usan `MySQL`
- lo que cambia entre ambientes es solo `DATABASE_URL`
- el codigo ya no tiene ramas para PostgreSQL

## Archivos clave

```text
lib/db/
├── schema.ts
├── client.ts
├── seed.ts
├── config-env.ts
└── scripts/

drizzle.config.ts
supabase/migrations/drizzle-mysql/
```

## Variables de entorno

En local, Drizzle carga `.env.local`.

```env
DATABASE_URL=mysql://root:password@localhost:3306/elchinoamericano
```

En servidor, la app runtime usa `process.env.DATABASE_URL` del hosting.

## Version soportada

La base oficial del proyecto es:

- `MySQL 8.0+`

No se soporta:

- `MySQL 5.7`
- `MariaDB`

La app ahora valida eso al conectar y falla rapido si el servidor no cumple.

## Comandos

### Generar migracion

```bash
npm run db:generate
```

Usalo cuando cambias `lib/db/schema.ts` y quieres crear el SQL del cambio.

### Aplicar migraciones

```bash
npm run db:migrate
```

Usalo cuando ya existe una migracion nueva y quieres aplicarla a la base.

### Push directo

```bash
npm run db:push
```

Usalo solo para pruebas rapidas o bases descartables. El flujo recomendado sigue siendo:

1. cambiar schema
2. generar migracion
3. revisar SQL
4. correr migrate

### Studio

```bash
npm run db:studio
```

Sirve para inspeccionar tablas y datos.

### Seed

```bash
npm run db:seed
```

Carga datos base e intenta ser idempotente.

Aliases disponibles:

```bash
npm run db:generate:mysql
npm run db:migrate:mysql
npm run db:push:mysql
npm run db:studio:mysql
npm run db:seed:mysql
```

Todos hacen exactamente lo mismo que los comandos base.

## Flujo recomendado

### Si cambias estructura

1. Edita `lib/db/schema.ts`
2. Ejecuta `npm run db:generate`
3. Revisa el SQL generado
4. Ejecuta `npm run db:migrate`

### Si reinicias la base local

1. recrea la base MySQL vacia
2. ejecuta `npm run db:migrate`
3. ejecuta `npm run db:seed`

## Auditoria

La auditoria ya no usa triggers ni funciones SQL.

- la escritura principal ocurre primero
- despues se intenta registrar en `audit_log`
- si el log falla, la operacion principal no falla

Archivo principal:

```text
lib/audit.ts
```

## Nota importante sobre versiones de MySQL

Aunque ahora solo usamos MySQL, la version sigue importando.

- este proyecto ya no apunta al minimo comun denominador
- el target oficial es `MySQL 8.0+`
- podemos usar queries y comportamiento alineados con ese contrato
- si un hosting solo ofrece `5.7`, ese hosting no es compatible con el proyecto
