import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { parseImagesFormData } from '@/app/admin/products/_components/parseImagesFormData'
import { getCategories } from '@/lib/db/categories'
import {
  getProductById,
  setAlternateCodes,
  setCompatibilities,
  setImages,
  setSpecs,
  updateProduct,
} from '@/lib/db/products'
import { getPartBrands } from '@/lib/db/part-brands'
import { getSuppliers } from '@/lib/db/suppliers'
import { logger } from '@/lib/logger'
import { buildProductPath, buildSlugWithSku } from '@/lib/product-slugs'
import { routes } from '@/lib/routes'
import { ProductForm } from '@/modules/admin/products/components/ProductForm'
import { parseIndexedFormData, parseProductFormData } from '@/modules/admin/products/form-schema'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'

async function save(productId: number, _: ActionState, formData: FormData) {
  'use server'

  const payload = await getJwtPayload()
  if (!payload) redirect(routes.login)

  try {
    const currentProduct = await getProductById(productId)
    if (!currentProduct) {
      return errorResult('No se encontró el producto a editar.')
    }

    const parsed = parseProductFormData(formData, { isActive: true })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const {
      title,
      shortTitle,
      sku,
      replacementCode,
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
      shortDescription,
      description,
      slug,
      metaTitle,
      metaDescription,
      isFeatured,
      isActive,
    } = parsed.data
    const normalizedSlug = buildSlugWithSku(slug || title, sku)
    const previousPublicPath = buildProductPath(currentProduct)
    const nextPublicPath = buildProductPath({
      code: currentProduct.code,
      slug: normalizedSlug,
    })

    await updateProduct(productId, {
      title,
      shortTitle,
      sku,
      replacementCode,
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
    await setImages(productId, finalImages)

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
      setSpecs(productId, specs),
      setAlternateCodes(productId, codes),
      setCompatibilities(productId, compat),
    ])

    logger.info({ productId, title }, 'Product updated')
    revalidatePath(routes.admin.products.index)
    revalidatePath(routes.admin.inventory.index)
    revalidatePath('/')
    revalidatePath('/catalogo')
    revalidatePath(previousPublicPath)
    revalidatePath(nextPublicPath)
  } catch (error) {
    logger.error({ error }, 'Error updating product')
    return errorResult(error instanceof Error ? error.message : 'Error al guardar el producto')
  }

  return successResult('Producto guardado', undefined, { redirectTo: routes.admin.products.index })
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const payload = await getJwtPayload()
  if (!payload) redirect(routes.login)

  const { id } = await params
  const productId = Number(id)

  const [product, categories, partBrands, suppliers] = await Promise.all([
    getProductById(productId),
    getCategories(),
    getPartBrands(),
    getSuppliers(),
  ])

  if (!product) notFound()

  const saveWithId = save.bind(null, product.id)

  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.products.index}
        backLabel="Volver a productos"
        title="Editar producto"
        description="Actualiza la ficha técnica, compatibilidades e imagen principal del producto."
      />

      {product.code ? (
        <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <span className="font-mono text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded px-2 py-1">
            {product.code}
          </span>
          <span className="text-xs text-slate-400">
            URL: <span className="font-mono text-slate-600">{buildProductPath({ code: product.code, slug: product.slug })}</span>
          </span>
        </div>
      ) : null}

      <ProductForm
            action={saveWithId}
            mode="edit"
            categories={categories}
            partBrands={partBrands}
            suppliers={suppliers}
            defaults={{
              title: product.title,
              shortTitle: product.shortTitle ?? undefined,
              sku: product.sku ?? undefined,
              replacementCode: product.replacementCode ?? undefined,
              type: product.type as 'original' | 'oem' | 'aftermarket',
              condition: (product.condition ?? 'new') as 'new' | 'used' | 'refurbished',
              categoryId: product.categoryId,
              partBrandId: product.partBrandId,
              supplierId: product.supplierId,
              price: product.price,
              costPrice: product.costPrice,
              discountPct: product.discountPct,
              weightKg: product.weightKg,
              minStockAlert: product.minStockAlert,
              stock: product.stock,
              shortDescription: product.shortDescription ?? undefined,
              description: product.description ?? undefined,
              slug: product.slug ?? undefined,
              metaTitle: product.metaTitle ?? undefined,
              metaDescription: product.metaDescription ?? undefined,
              isFeatured: product.isFeatured ?? undefined,
              isActive: product.isActive ?? undefined,
              images: (product.images ?? []).map((img, i) => ({
                url: img.url,
                cloudinaryPublicId: img.cloudinaryPublicId ?? null,
                isPrimary: img.isPrimary ?? (i === 0),
                sortOrder: img.sortOrder ?? i,
              })),
              specs: product.specs?.map((spec) => ({ label: spec.label, value: spec.value })) ?? [],
              alternateCodes: product.alternateCodes?.map((code) => ({
                code: code.code,
                source: code.source ?? null,
              })) ?? [],
              compatibilities: product.compatibilities
                ?.filter((compatibility) => compatibility.vehicleModelId != null)
                .map((compatibility) => ({
                  vehicleModelId: compatibility.vehicleModelId as number,
                  yearStart: compatibility.yearStart ?? null,
                  yearEnd: compatibility.yearEnd ?? null,
                })) ?? [],
              code: product.code,
            }}
          />
    </div>
  )
}
