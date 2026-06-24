import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import { getProductById, updateProduct, setSpecs, setAlternateCodes, setCompatibilities, setImages } from '@/lib/db/products'
import { getCategories } from '@/lib/db/categories'
import { getPartBrands } from '@/lib/db/part-brands'
import { getSuppliers } from '@/lib/db/suppliers'
import { getVehicleBrandsWithModels } from '@/lib/db/vehicle-brands'
import { handleImageReplace } from '@/lib/cloudinary'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { ImageUploadField } from '@/app/admin/_components/ImageUploadField'
import { DynamicRows } from '../_components/DynamicRows'
import { CompatSection } from '../_components/CompatSection'

function parseIndexed(fd: FormData, prefix: string, keys: string[]) {
  const rows: Record<string, string>[] = []
  let i = 0
  while (fd.has(`${prefix}[${i}][${keys[0]}]`)) {
    rows.push(Object.fromEntries(keys.map(k => [k, String(fd.get(`${prefix}[${i}][${k}]`) ?? '')])))
    i++
  }
  return rows
}

async function save(productId: number, formData: FormData) {
  'use server'
  const payload = await getJwtPayload()
  if (!payload) redirect('/login')

  try {
    const title = String(formData.get('title') ?? '').trim()
    const price = String(formData.get('price') ?? '').trim()
    const type  = String(formData.get('type') ?? '').trim()
    const slug  = String(formData.get('slug') ?? '').trim()

    await updateProduct(productId, {
      title,
      shortTitle:       String(formData.get('shortTitle') ?? '').trim() || undefined,
      sku:              String(formData.get('sku') ?? '').trim() || undefined,
      slug:             slug || undefined,
      price,
      costPrice:        String(formData.get('costPrice') ?? '').trim() || undefined,
      discountPct:      String(formData.get('discountPct') ?? '').trim() || undefined,
      type,
      condition:        String(formData.get('condition') ?? 'new'),
      weightKg:         String(formData.get('weightKg') ?? '').trim() || undefined,
      categoryId:       Number(formData.get('categoryId')) || undefined,
      partBrandId:      Number(formData.get('partBrandId')) || undefined,
      supplierId:       Number(formData.get('supplierId')) || undefined,
      minStockAlert:    Number(formData.get('minStockAlert')) || 5,
      description:      String(formData.get('description') ?? '').trim() || undefined,
      shortDescription: String(formData.get('shortDescription') ?? '').trim() || undefined,
      metaTitle:        String(formData.get('metaTitle') ?? '').trim() || undefined,
      metaDescription:  String(formData.get('metaDescription') ?? '').trim() || undefined,
      isFeatured:       formData.get('isFeatured') === 'on',
      isActive:         formData.get('isActive') !== 'off',
    })

    // Imagen principal
    const imageFile       = formData.get('image') as File | null
    const imageRemoved    = formData.get('image_removed') === '1'
    const currentUrl      = String(formData.get('image_current_url') ?? '') || null
    const currentPublicId = String(formData.get('image_public_id') ?? '') || null

    const { url, publicId } = await handleImageReplace(
      imageFile && imageFile.size > 0 ? imageFile : null,
      imageRemoved,
      currentPublicId,
      currentUrl,
    )
    await setImages(productId, url
      ? [{ url, cloudinaryPublicId: publicId, isPrimary: true, sortOrder: 0 }]
      : []
    )

    // Relaciones
    const specs  = parseIndexed(formData, 'specs', ['label', 'value']).filter(r => r.label && r.value)
    const codes  = parseIndexed(formData, 'codes', ['code', 'source']).filter(r => r.code)
    const compat = parseIndexed(formData, 'compat', ['modelId', 'yearStart', 'yearEnd'])
      .filter(r => r.modelId)
      .map(r => ({
        vehicleModelId: Number(r.modelId),
        yearStart: r.yearStart ? Number(r.yearStart) : undefined,
        yearEnd:   r.yearEnd   ? Number(r.yearEnd)   : undefined,
      }))

    await Promise.all([
      setSpecs(productId, specs as { label: string; value: string }[]),
      setAlternateCodes(productId, codes as { code: string; source?: string }[]),
      setCompatibilities(productId, compat),
    ])

    logger.info({ productId, title }, 'Product updated')
    revalidatePath('/admin/products')
    revalidatePath('/admin/inventory')
  } catch (err) {
    logger.error({ err }, 'Error updating product')
    redirect('/admin/products?error=' + encodeURIComponent('Error al guardar el producto'))
  }
  redirect('/admin/products?success=' + encodeURIComponent('Producto guardado'))
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const payload = await getJwtPayload()
  if (!payload) redirect('/login')

  const { id } = await params
  const [product, categories, partBrands, suppliers, brands] = await Promise.all([
    getProductById(Number(id)),
    getCategories(),
    getPartBrands(),
    getSuppliers(),
    getVehicleBrandsWithModels(),
  ])

  if (!product) notFound()

  const saveWithId = save.bind(null, product.id)
  const primaryImage = product.images?.find(img => img.isPrimary) ?? product.images?.[0] ?? null

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a productos
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Editar producto</h1>
          {product.code && (
            <span className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{product.code}</span>
          )}
        </div>
      </div>

      <form action={saveWithId} className="space-y-6 max-w-4xl">

        {/* ── Básico ──────────────────────────────────── */}
        <Section title="Información básica">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Título <Required /></Label>
              <input name="title" required defaultValue={product.title} className={inputCls} />
            </div>
            <div>
              <Label>Título corto</Label>
              <input name="shortTitle" defaultValue={product.shortTitle ?? ''} className={inputCls} />
            </div>
            <div>
              <Label>SKU</Label>
              <input name="sku" defaultValue={product.sku ?? ''} className={inputCls} />
            </div>
            <div>
              <Label>Tipo <Required /></Label>
              <select name="type" required defaultValue={product.type} className={selectCls}>
                <option value="original">Original</option>
                <option value="oem">OEM</option>
                <option value="aftermarket">Alterno / Aftermarket</option>
              </select>
            </div>
            <div>
              <Label>Condición</Label>
              <select name="condition" defaultValue={product.condition ?? 'new'} className={selectCls}>
                <option value="new">Nuevo</option>
                <option value="used">Usado</option>
                <option value="refurbished">Reacondicionado</option>
              </select>
            </div>
            <div>
              <Label>Categoría</Label>
              <select name="categoryId" defaultValue={product.categoryId ?? ''} className={selectCls}>
                <option value="">Sin categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Marca de repuesto</Label>
              <select name="partBrandId" defaultValue={product.partBrandId ?? ''} className={selectCls}>
                <option value="">Sin marca</option>
                {partBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Proveedor</Label>
              <select name="supplierId" defaultValue={product.supplierId ?? ''} className={selectCls}>
                <option value="">Sin proveedor</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-6 pt-5">
              <CheckField name="isFeatured" label="Destacado" defaultChecked={product.isFeatured ?? false} />
              <CheckField name="isActive" label="Activo" defaultChecked={product.isActive ?? true} />
            </div>
          </div>
        </Section>

        {/* ── Precio ──────────────────────────────────── */}
        <Section title="Precio y stock">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Precio PVP <Required /></Label>
              <input name="price" type="number" step="0.01" min="0" required defaultValue={product.price} className={inputCls} />
            </div>
            <div>
              <Label>Costo</Label>
              <input name="costPrice" type="number" step="0.01" min="0" defaultValue={product.costPrice ?? ''} className={inputCls} />
            </div>
            <div>
              <Label>Descuento %</Label>
              <input name="discountPct" type="number" step="0.01" min="0" max="100" defaultValue={product.discountPct ?? ''} className={inputCls} />
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <input name="weightKg" type="number" step="0.001" min="0" defaultValue={product.weightKg ?? ''} className={inputCls} />
            </div>
            <div>
              <Label>Stock mínimo alerta</Label>
              <input name="minStockAlert" type="number" min="0" defaultValue={product.minStockAlert ?? 5} className={inputCls} />
            </div>
            <div className="flex items-end pb-2">
              <p className="text-sm text-gray-500">
                Stock actual: <span className="font-semibold text-[#0d1f3c]">{product.stock}</span>
                <span className="text-xs text-gray-400 ml-1">— ajustar en Inventario</span>
              </p>
            </div>
          </div>
        </Section>

        {/* ── Imagen ──────────────────────────────────── */}
        <Section title="Imagen principal">
          <ImageUploadField
            name="image"
            label="Imagen del producto"
            currentUrl={primaryImage?.url ?? null}
            currentPublicId={primaryImage?.cloudinaryPublicId ?? null}
          />
        </Section>

        {/* ── Descripción ─────────────────────────────── */}
        <Section title="Descripción y SEO">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Descripción corta</Label>
              <input name="shortDescription" defaultValue={product.shortDescription ?? ''} className={inputCls} />
            </div>
            <div>
              <Label>Descripción</Label>
              <textarea name="description" rows={4} defaultValue={product.description ?? ''} className={inputCls + ' resize-y'} />
            </div>
            <div>
              <Label>Slug</Label>
              <input name="slug" defaultValue={product.slug} className={inputCls} />
            </div>
            <div>
              <Label>Meta título</Label>
              <input name="metaTitle" defaultValue={product.metaTitle ?? ''} className={inputCls} />
            </div>
            <div>
              <Label>Meta descripción</Label>
              <input name="metaDescription" defaultValue={product.metaDescription ?? ''} className={inputCls} />
            </div>
          </div>
        </Section>

        {/* ── Especificaciones ─────────────────────────── */}
        <Section title="Especificaciones técnicas">
          <DynamicRows
            name="specs"
            columns={[
              { key: 'label', label: 'Atributo', placeholder: 'ej: Material' },
              { key: 'value', label: 'Valor',     placeholder: 'ej: Aluminio' },
            ]}
            initialRows={product.specs?.map(s => ({ label: s.label, value: s.value })) ?? []}
            addLabel="Agregar especificación"
          />
        </Section>

        {/* ── Códigos alternos ─────────────────────────── */}
        <Section title="Códigos alternos">
          <DynamicRows
            name="codes"
            columns={[
              { key: 'code',   label: 'Código',   placeholder: 'ej: 7M0121004' },
              { key: 'source', label: 'Fuente',    placeholder: 'ej: Toyota OEM' },
            ]}
            initialRows={product.alternateCodes?.map(c => ({ code: c.code, source: c.source ?? '' })) ?? []}
            addLabel="Agregar código"
          />
        </Section>

        {/* ── Compatibilidades ─────────────────────────── */}
        <Section title="Compatibilidad con vehículos">
          <CompatSection
            brands={brands as { id: number; name: string; models: { id: number; name: string }[] }[]}
            initialCompat={product.compatibilities?.map(c => ({
              vehicleModelId: c.vehicleModelId,
              yearStart: c.yearStart ?? null,
              yearEnd:   c.yearEnd   ?? null,
            })) ?? []}
          />
        </Section>

        {/* ── Submit ──────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <SubmitButton
            pendingText="Guardando..."
            className="px-6 py-2.5 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium disabled:opacity-60"
          >
            Guardar cambios
          </SubmitButton>
          <Link href="/admin/products" className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
        </div>

      </form>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent'
const selectCls = inputCls + ' bg-white'

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>
}

function Required() {
  return <span className="text-[#e03030]"> *</span>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-50">
        <h2 className="text-sm font-semibold text-[#0d1f3c]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function CheckField({ name, label, defaultChecked = false }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="w-4 h-4 rounded border-gray-300 text-[#0d1f3c] focus:ring-[#0d1f3c]" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}
