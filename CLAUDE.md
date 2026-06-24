# El Chino Americano — Project Guide

## Reference Docs

- [docs/admin-architecture.md](/Users/angelloordonez/Documents/Blubear/projects/elchinoamericano-web/docs/admin-architecture.md)
- [docs/catalog-architecture.md](/Users/angelloordonez/Documents/Blubear/projects/elchinoamericano-web/docs/catalog-architecture.md)
- [docs/seo-architecture.md](/Users/angelloordonez/Documents/Blubear/projects/elchinoamericano-web/docs/seo-architecture.md)

## Core Rules

- Use the current `app/` App Router architecture. Do not design against the old `src/` layout.
- For React and Next.js work, use the `vercel-react-best-practices` skill as the default reference.
- Prefer Server Components by default.
- Move only interactive UI into Client Components.
- Keep route metadata, canonical URLs, structured data, and social-sharing metadata in server pages whenever possible.
- Public customer-facing pages must be SEO-friendly.
- Admin pages do not need SEO, AEO, or GEO optimization.

## Next.js Rule

- This project runs on a newer Next.js version with breaking changes.
- Before changing App Router behavior, metadata, file conventions, or rendering strategy, read the relevant guide in `node_modules/next/dist/docs/`.

## Current Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React

## Current App Structure

```text
app/
  layout.tsx
  page.tsx
  catalogo/
    page.tsx
    CatalogoClient.tsx
    [id]/page.tsx
  contacto/
    page.tsx
    ContactoForm.tsx
  login/
    page.tsx
    LoginForm.tsx
  admin/
    ...

components/
context/
data/
docs/
lib/
  catalog.ts
  seo.ts
modules/
  admin/
types/
```

## Public Pages

Public customer-facing routes include:

- `/`
- `/catalogo`
- `/catalogo/[id]`
- `/contacto`

Rules:

- These routes should remain server-first whenever practical.
- They must be SEO-friendly.
- Product pages should include canonical URLs, Open Graph, Twitter metadata, and JSON-LD.
- Product sharing should use the primary product image when available, otherwise a stable fallback from `public/`.

## Catalog Rules

- `app/catalogo/page.tsx`
  Server-first catalog entry.
  May use shareable query params for filters and pagination.

- `app/catalogo/CatalogoClient.tsx`
  Interactive layer only.
  Do not move metadata or SEO responsibilities here.

- `app/catalogo/[id]/page.tsx`
  Product detail page.
  Keep optimized for SEO, AEO, GEO, and social sharing.
  Prefer SSG via `generateStaticParams()` and metadata on the server.

- `lib/catalog.ts`
  Shared parsing and URL-building logic for catalog filters.

- `lib/seo.ts`
  Shared helpers for canonical URLs, titles, descriptions, and social image fallbacks.

## Admin Rules

- Treat `app/admin/**` as route layer only.
- Keep admin domain logic in `modules/admin/**`.
- Keep infrastructure concerns in `lib/**`.
- Admin UX does not require SEO, AEO, or GEO work.

## Brand Rules

- Primary palette:
  - `navy`
  - `brand`
  - `wa`
- Keep the existing visual identity consistent.
- Avoid introducing unrelated palette directions or generic redesign drift.
