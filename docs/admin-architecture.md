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
