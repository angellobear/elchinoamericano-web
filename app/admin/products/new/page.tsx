import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { parseImagesFormData } from '@/app/admin/products/_components/parseImagesFormData'
import {
  createProduct,
  setAlternateCodes,
  setCompatibilities,
  setImages,
  setSpecs,
  updateStock,
} from '@/lib/db/products'
import { getCategories } from '@/lib/db/categories'
import { getPartBrands } from '@/lib/db/part-brands'
import { getSuppliers } from '@/lib/db/suppliers'
import { getVehicleBrandsWithModels } from '@/lib/db/vehicle-brands'
import { logger } from '@/lib/logger'
import { buildProductPath, buildProductSlugBase } from '@/lib/product-slugs'
import { routes } from '@/lib/routes'
import { ProductForm } from '@/modules/admin/products/components/ProductForm'
import { parseIndexedFormData, parseProductFormData } from '@/modules/admin/products/form-schema'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'

async function create(_: ActionState, formData: FormData) {
  'use server'

  const payload = await getJwtPayload()
  if (!payload) redirect(routes.login)

  try {
    const parsed = parseProductFormData(formData, { isActive: true, stockInitial: 0 })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const {
      title,
      shortTitle,
      sku,
      type,
      condition,
      categoryId,
      partBrandId,
      supplierId,
      price,
      costPrice,
      discountPct,
      weightKg,
      minStockAlert,
      stockInitial,
      shortDescription,
      description,
      slug,
      metaTitle,
      metaDescription,
      isFeatured,
      isActive,
    } = parsed.data
    const normalizedSlug = buildProductSlugBase(slug || title)

    const { id, code } = await createProduct({
      title,
      shortTitle,
      sku,
      slug: normalizedSlug,
      price,
      costPrice,
      discountPct,
      type,
      condition,
      weightKg,
      categoryId,
      partBrandId,
      supplierId,
      minStockAlert,
      description,
      shortDescription,
      metaTitle,
      metaDescription,
      isFeatured,
      isActive,
    })

    const { finalImages } = await parseImagesFormData(formData)
    if (finalImages.length) await setImages(id, finalImages)

    const specs = parseIndexedFormData(formData, 'specs', ['label', 'value'])
      .flatMap((row) => (row.label && row.value ? [{ label: row.label, value: row.value }] : []))
    const codes = parseIndexedFormData(formData, 'codes', ['code', 'source'])
      .flatMap((row) => (row.code ? [{ code: row.code, source: row.source || undefined }] : []))
    const compat = parseIndexedFormData(formData, 'compat', ['modelId', 'yearStart', 'yearEnd'])
      .filter((row) => row.modelId)
      .map((row) => ({
        vehicleModelId: Number(row.modelId),
        yearStart: row.yearStart ? Number(row.yearStart) : undefined,
        yearEnd: row.yearEnd ? Number(row.yearEnd) : undefined,
      }))

    await Promise.all([
      setSpecs(id, specs),
      setAlternateCodes(id, codes),
      setCompatibilities(id, compat),
    ])

    if ((stockInitial ?? 0) > 0) {
      await updateStock(id, stockInitial ?? 0, payload.userId, 'Stock inicial')
    }

    logger.info({ id, title }, 'Product created')
    revalidatePath(routes.admin.products.index)
    revalidatePath(routes.admin.inventory.index)
    revalidatePath('/')
    revalidatePath('/catalogo')
    revalidatePath(buildProductPath({ code, slug: normalizedSlug }))
  } catch (error) {
    logger.error({ error }, 'Error creating product')
    return errorResult(error instanceof Error ? error.message : 'Error al crear el producto')
  }

  return successResult('Producto creado', undefined, { redirectTo: routes.admin.products.index })
}

export default async function NewProductPage() {
  const payload = await getJwtPayload()
  if (!payload) redirect(routes.login)

  const [categories, partBrands, suppliers, brands] = await Promise.all([
    getCategories(),
    getPartBrands(),
    getSuppliers(),
    getVehicleBrandsWithModels(),
  ])

  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.products.index}
        backLabel="Volver a productos"
        title="Nuevo producto"
        description="Crea un producto con precio, stock, compatibilidades e imagen principal."
      />

      <ProductForm
        action={create}
        mode="create"
        categories={categories}
        partBrands={partBrands}
        suppliers={suppliers}
        brands={brands}
        defaults={{ isActive: true, stockInitial: 1 }}
      />
    </div>
  )
}
