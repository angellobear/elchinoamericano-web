# Catalog Architecture

## Objective

Define the current and future architecture for the public catalog so it stays:

- shareable
- server-first
- SEO-friendly
- compatible with SSG where it adds value

## Current Architecture

### Main routes

- `/catalogo`
- `/catalogo/[id]`

### Current file ownership

- `app/catalogo/page.tsx`
  Server-first catalog entry page.
  Owns metadata and high-level catalog JSON-LD.

- `app/catalogo/CatalogoClient.tsx`
  Interactive client layer for filters, search, chip removal, and pagination behavior.

- `app/catalogo/[id]/page.tsx`
  Product detail page.
  Owns product metadata, canonical, social-sharing metadata, and structured data.

- `lib/catalog.ts`
  Shared parsing and URL-building helpers for the catalog.

- `lib/seo.ts`
  Shared SEO helpers for titles, descriptions, canonical URLs, and social image fallbacks.

## Implemented Decisions

### 1. Catalog entry stays server-first

`/catalogo` should stay as the general entry to the catalog.

Why:

- It can ship metadata and structured data from the server.
- It keeps the page ready for future SEO upgrades.
- It still supports shareable query params for real user flows.

### 2. Filters use query params

Current filter state can live in query params such as:

- `q`
- `precio`
- `categoria`
- `marca`
- `pagina`

Why:

- URLs can be shared easily.
- The filter state is stable and inspectable.
- We avoid trying to statically generate an unbounded number of combinations.

### 3. Product detail is the main SEO asset

`/catalogo/[id]` is the strongest catalog page for:

- SEO
- AEO
- GEO
- social sharing

Current direction:

- use `generateStaticParams()`
- use server metadata
- use JSON-LD
- use product image for sharing when available
- fallback to a stable asset in `public/` when not

## Sharing Rules

### Catalog listing

`/catalogo` supports shareable query strings for:

- filtered navigation
- quick user sharing
- commercial support flows

Examples:

- `/catalogo?q=filtro+aceite`
- `/catalogo?marca=chery`
- `/catalogo?categoria=frenos&precio=20-50`

### Product detail

`/catalogo/[id]` must remain the preferred share URL for products.

Rules:

- canonical must point to the product URL
- Open Graph must use product image if available
- Twitter metadata must use large image mode
- fallback image must exist in `public/`

## Rendering Strategy

### `/catalogo`

- server-first page
- interactive filtering in client component
- query params for shareability
- do not try to pre-generate every filter combination

### `/catalogo/[id]`

- strong SSG candidate
- server metadata
- product structured data
- social-sharing ready

## Structured Data Direction

### Catalog page

Use collection-oriented structured data such as:

- `CollectionPage`
- `ItemList`

### Product page

Use product-oriented structured data such as:

- `Product`
- `BreadcrumbList`
- `FAQPage`

## Future Expansion

If we want stronger taxonomy SEO later, the preferred route structure is:

- `/catalogo/categoria/[categoria]`
- `/catalogo/marca/[marca]`

These should be treated as stable landing pages, not as arbitrary filter combinations.

## Explicit Non-Goals

Do not:

- pre-generate every search/filter combination
- move SEO responsibilities into `CatalogoClient`
- make product detail depend on client-only rendering for core content

## Next Steps

### Phase 1

- Keep current catalog architecture stable.
- Continue improving metadata and structured data on public routes.

### Phase 2

- Add taxonomy routes for category and brand.
- Add route-specific metadata and editorial SEO copy.

### Phase 3

- Refine canonical rules for filtered pages.
- Decide which filtered states should be indexable.
