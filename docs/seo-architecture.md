# SEO Architecture

## Scope

This document applies only to public customer-facing pages.

Public pages currently include:

- `/`
- `/catalogo`
- `/catalogo/[id]`
- `/contacto`

It does not apply to:

- `app/admin/**`
- internal admin tooling
- internal auth screens used only for operations

## Core Rule

Public pages must be SEO-friendly.

That includes:

- classic SEO
- AEO
- GEO
- social-sharing readiness

## Public vs Admin

### Public routes

Must prioritize:

- server-rendered metadata
- canonical URLs
- structured data
- meaningful headings and semantic content
- shareable previews

### Admin routes

Do not need:

- indexability
- Open Graph optimization
- Twitter cards
- AEO/GEO-oriented copy

## Rendering Rules

- Prefer Server Components by default for public routes.
- Keep metadata generation on the server.
- Keep core public content renderable without relying on client-only logic.
- Use Client Components only for interaction.

## Metadata Rules

Every important public page should define, when relevant:

- `title`
- `description`
- `alternates.canonical`
- `openGraph`
- `twitter`

Recommended behavior:

- use `summary_large_image` for shareable pages when an image exists
- keep canonical URLs stable
- avoid duplicate metadata ownership in client components

## Social Sharing Rules

### Product detail pages

Product pages are the most important share targets.

They should:

- use the primary or first product image for Open Graph and Twitter
- fall back to a stable asset in `public/` when no product image exists
- expose a stable canonical product URL

### Catalog listing pages

Catalog listing pages can use a stable default social image if they do not have a route-specific preview image.

## Structured Data Rules

### Catalog page

Prefer:

- `CollectionPage`
- `ItemList`

### Product page

Prefer:

- `Product`
- `BreadcrumbList`
- `FAQPage`

### Contact page

Can later support:

- `ContactPage`
- `Organization`
- `LocalBusiness`

if the business data becomes stable enough.

## AEO and GEO Rules

For public pages, content should be understandable by search engines and answer engines.

That means:

- clear entity naming
- explicit product compatibility language
- explicit product type language
- clear geographic service context when relevant
- concise, factual descriptions

For Ecuador-facing commerce pages, mention service context when true, such as:

- Ecuador
- cities served
- WhatsApp contact flow
- delivery or shipping coverage

## Current Helpers

- `lib/seo.ts`
  Shared helper layer for:
  - canonical URL building
  - social image fallback
  - product SEO titles
  - product SEO descriptions

## Current Implemented Direction

### `app/layout.tsx`

- global `metadataBase`

### `app/catalogo/page.tsx`

- server metadata
- Open Graph default image
- catalog JSON-LD

### `app/catalogo/[id]/page.tsx`

- product metadata
- canonical URL
- product image sharing
- fallback image from `public/`
- product, breadcrumb, and FAQ JSON-LD

### `app/contacto/page.tsx`

- server metadata
- public-facing route, so it should remain SEO-friendly

## Non-Goals

Do not:

- optimize admin routes for SEO
- move public metadata logic into client components
- rely on query-param combinations as the primary SEO surface

## Future Direction

### Phase 1

- keep current metadata and structured data stable
- maintain strong product sharing behavior

### Phase 2

- add taxonomy routes for category and brand
- add route-specific SEO copy and metadata

### Phase 3

- define index vs noindex policy for filtered catalog states
- add richer organization or local business structured data if needed
