# Catalog Architecture Ideas

Documento de referencia para una futura implementación del catálogo con mejor SEO, URLs compartibles y pre-renderizado estratégico.

## Objetivos

- Mantener URLs fáciles de compartir para filtros y productos.
- Aprovechar renderizado estático donde sí aporta valor.
- Evitar generar estáticamente combinaciones infinitas de filtros.
- Separar claramente páginas SEO de navegación exploratoria.

## Estado actual

- La ficha de producto en `app/catalogo/[id]/page.tsx` ya es una buena candidata a SSG.
- El listado de `app/catalogo/page.tsx` usa filtros por query string, útil para compartir.
- Los filtros actuales viven en parámetros como `q`, `precio`, `categoria`, `marca` y `pagina`.

## Dirección recomendada

### 1. Mantener producto como página estática

Ruta:

- `/catalogo/[id]`

Idea:

- Seguir usando `generateStaticParams()`.
- Mantener `generateMetadata()` por producto.
- Agregar Open Graph más fuerte en una etapa posterior.

Beneficio:

- Excelente para SEO.
- Excelente para compartir.
- Carga rápida y HTML pre-renderizado.

### 2. Mantener `/catalogo` como entrada general

Ruta:

- `/catalogo`

Idea:

- Usarla como página principal del catálogo.
- Puede renderizar una selección general, destacados o un listado inicial.
- Los filtros complejos pueden seguir viviendo en query params.

Ejemplos:

- `/catalogo?q=filtro+aceite`
- `/catalogo?marca=chery`
- `/catalogo?categoria=frenos&precio=20-50`

Beneficio:

- Muy buena UX.
- URLs fáciles de compartir.
- No obliga a generar miles de páginas estáticas.

### 3. Crear rutas SEO dedicadas para taxonomías

Rutas propuestas:

- `/catalogo/categoria/[categoria]`
- `/catalogo/marca/[marca]`

Idea:

- Estas rutas representarían landing pages más estables.
- Sí conviene evaluarlas para SSG o ISR.
- Desde ahí se pueden aplicar filtros adicionales por query string si hace falta.

Ejemplos:

- `/catalogo/categoria/frenos`
- `/catalogo/marca/chery`
- `/catalogo/marca/chery?precio=20-50`

Beneficio:

- Mejor posicionamiento por intención de búsqueda.
- Arquitectura más clara para SEO.
- Permite contenido editorial adicional por categoría o marca.

### 4. No pre-generar combinaciones de filtros

No recomendado:

- Generar estáticamente todas las combinaciones de búsqueda, precio, marca, categoría y paginación.

Motivo:

- El espacio de combinaciones crece demasiado.
- Mucha URL tendría poco valor SEO.
- Aumenta complejidad sin beneficio claro.

## Arquitectura futura sugerida

### Nivel 1: páginas SEO fuertes

- `/catalogo`
- `/catalogo/categoria/[categoria]`
- `/catalogo/marca/[marca]`
- `/catalogo/[id]`

### Nivel 2: refinamientos de navegación

- Query params para filtros secundarios.
- Query params para búsqueda interna.
- Query params para paginación.

## Estrategia de renderizado sugerida

### Producto

- SSG.

### Categoría y marca

- SSG o ISR, dependiendo de la fuente real de datos.

### Catálogo general con búsqueda y filtros

- Página base estable.
- Query params compartibles.
- Sin intento de pre-generar todas las variantes.

## Ideas adicionales para una segunda fase

- Agregar breadcrumbs específicos por marca y categoría.
- Crear copy SEO por categoría.
- Crear copy SEO por marca.
- Definir canonical para evitar duplicados por filtros.
- Decidir qué combinaciones deben ser `index` y cuáles `noindex`.
- Agregar `opengraph-image` por producto o por secciones del catálogo.

## Propuesta de implementación por fases

### Fase 1

- Mantener detalle de producto estático.
- Mantener `/catalogo` como página compartible con query params.

### Fase 2

- Crear rutas `/catalogo/categoria/[categoria]`.
- Crear rutas `/catalogo/marca/[marca]`.
- Agregar metadata específica por taxonomía.

### Fase 3

- Revisar canónicos.
- Revisar indexabilidad de combinaciones con filtros.
- Añadir contenido SEO adicional.

## Decisiones abiertas

- Si `id` debe seguir siendo slug de producto o conviene renombrarlo a `slug`.
- Si categoría y marca vivirán con datos mock o con fuente persistente.
- Si la paginación debe permanecer en query params o moverse a segmentos.
- Si algunas páginas filtradas específicas merecen indexación.
