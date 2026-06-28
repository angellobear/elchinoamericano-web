'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { ProductImagesSection } from '@/app/admin/products/_components/ProductImagesSection'
import { routes } from '@/lib/routes'
import { DynamicRows } from '@/app/admin/products/_components/DynamicRows'
import { CompatSection } from '@/app/admin/products/_components/CompatSection'
import { buildProductSlugBase } from '@/lib/product-slugs'
import { ValidatedForm } from '@/modules/admin/shared/components/ValidatedForm'
import type { ActionFormHandler } from '@/modules/admin/shared/types/action-result'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { parseProductFormData } from '@/modules/admin/products/form-schema'

interface SelectOption {
  id: number
  name: string
}

interface ProductBrandOption {
  id: number
  name: string
  models: { id: number; name: string }[]
}

function buildSlugPreview(code?: string | null, slug?: string | null) {
  const normalizedCode = code?.trim().toLowerCase() || 'ca-0000'
  const normalizedSlug = buildProductSlugBase(slug?.trim() || 'slug-del-producto')
  return `/catalogo/${normalizedCode}-${normalizedSlug}`
}

interface ProductFormProps {
  action: ActionFormHandler
  mode: 'create' | 'edit'
  categories: SelectOption[]
  partBrands: SelectOption[]
  suppliers: SelectOption[]
  brands: ProductBrandOption[]
  defaults?: {
    title?: string
    shortTitle?: string
    sku?: string
    type?: 'original' | 'oem' | 'aftermarket'
    condition?: 'new' | 'used' | 'refurbished'
    categoryId?: number | null
    partBrandId?: number | null
    supplierId?: number | null
    price?: string | number
    costPrice?: string | number | null
    discountPct?: string | number | null
    weightKg?: string | number | null
    minStockAlert?: number | null
    stockInitial?: number
    stock?: number
    shortDescription?: string | null
    description?: string | null
    slug?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    isFeatured?: boolean
    isActive?: boolean
    images?: { url: string; cloudinaryPublicId?: string | null; isPrimary: boolean; sortOrder: number }[]
    specs?: { label: string; value: string }[]
    alternateCodes?: { code: string; source?: string | null }[]
    compatibilities?: { vehicleModelId: number; yearStart?: number | null; yearEnd?: number | null }[]
    code?: string | null
  }
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy/25 focus:border-navy transition-colors duration-150'
const selectCls = `${inputCls} bg-white`

export function ProductForm({
  action,
  mode,
  categories,
  partBrands,
  suppliers,
  brands,
  defaults,
}: ProductFormProps) {
  return (
    <ValidatedForm
      action={action}
      className="space-y-6 max-w-4xl"
      validate={(formData) => {
        const parsed = parseProductFormData(formData, {
          isActive: defaults?.isActive ?? true,
          stockInitial: defaults?.stockInitial ?? 0,
        })
        if (parsed.success) return null
        return getZodErrorMessage(parsed.error)
      }}
    >
      <Section title="Información básica">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Título <Required /></Label>
            <input name="title" required defaultValue={defaults?.title ?? ''} placeholder="ej: Bomba de agua original" className={inputCls} />
          </div>
          <div>
            <Label>Título corto</Label>
            <input name="shortTitle" defaultValue={defaults?.shortTitle ?? ''} placeholder="ej: Bomba de agua" className={inputCls} />
          </div>
          <div>
            <Label>SKU</Label>
            <input name="sku" defaultValue={defaults?.sku ?? ''} placeholder="ej: BWP-001" className={inputCls} />
          </div>
          <div>
            <Label>Tipo <Required /></Label>
            <select name="type" required defaultValue={defaults?.type ?? ''} className={selectCls}>
              <option value="" disabled>Seleccionar...</option>
              <option value="original">Original</option>
              <option value="oem">OEM</option>
              <option value="aftermarket">Alterno / Aftermarket</option>
            </select>
          </div>
          <div>
            <Label>Condición</Label>
            <select name="condition" defaultValue={defaults?.condition ?? 'new'} className={selectCls}>
              <option value="new">Nuevo</option>
              <option value="used">Usado</option>
              <option value="refurbished">Reacondicionado</option>
            </select>
          </div>
          <div>
            <Label>Categoría</Label>
            <select name="categoryId" defaultValue={defaults?.categoryId ?? ''} className={selectCls}>
              <option value="">Sin categoría</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Marca de repuesto</Label>
            <select name="partBrandId" defaultValue={defaults?.partBrandId ?? ''} className={selectCls}>
              <option value="">Sin marca</option>
              {partBrands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Proveedor</Label>
            <select name="supplierId" defaultValue={defaults?.supplierId ?? ''} className={selectCls}>
              <option value="">Sin proveedor</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-6 pt-5">
            <CheckField name="isFeatured" label="Destacado" defaultChecked={defaults?.isFeatured ?? false} />
            <CheckField name="isActive" label="Activo" defaultChecked={defaults?.isActive ?? true} />
          </div>
        </div>
      </Section>

      <Section title="Precio y stock">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Precio PVP <Required /></Label>
            <input name="price" type="number" step="0.01" min="0" required defaultValue={defaults?.price ?? ''} placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <Label>Costo</Label>
            <input name="costPrice" type="number" step="0.01" min="0" defaultValue={defaults?.costPrice ?? ''} placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <Label>Descuento %</Label>
            <input name="discountPct" type="number" step="0.01" min="0" max="100" defaultValue={defaults?.discountPct ?? ''} placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <Label>Peso (kg)</Label>
            <input name="weightKg" type="number" step="0.001" min="0" defaultValue={defaults?.weightKg ?? ''} placeholder="0.000" className={inputCls} />
          </div>
          <div>
            <Label>Stock mínimo alerta</Label>
            <input name="minStockAlert" type="number" min="0" defaultValue={defaults?.minStockAlert ?? 5} className={inputCls} />
          </div>
          {mode === 'create' ? (
            <div>
              <Label>Stock inicial</Label>
              <input name="stockInitial" type="number" min="0" defaultValue={defaults?.stockInitial ?? 0} className={inputCls} />
              <p className="text-xs text-slate-400 mt-1">Se registra como movimiento de compra</p>
            </div>
          ) : (
            <div className="flex items-end pb-2">
              <p className="text-sm text-slate-500">
                Stock actual: <span className="font-semibold text-navy">{defaults?.stock ?? 0}</span>
                <span className="text-xs text-slate-400 ml-1">— ajustar en Inventario</span>
              </p>
            </div>
          )}
        </div>
      </Section>

      <Section title="Imágenes del producto">
        <ProductImagesSection existingImages={defaults?.images ?? []} />
      </Section>

      <Section title="Descripción">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Descripción corta</Label>
            <input name="shortDescription" defaultValue={defaults?.shortDescription ?? ''} placeholder="Resumen en una línea para catálogo y SEO" className={inputCls} />
          </div>
          <div>
            <Label>Descripción completa</Label>
            <textarea name="description" rows={4} defaultValue={defaults?.description ?? ''} placeholder="Descripción detallada del producto, materiales, aplicaciones..." className={`${inputCls} resize-y`} />
          </div>
        </div>
      </Section>

      <Section title="SEO" hint="Si dejas en blanco, se genera automáticamente del título y marca del producto.">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Meta título</Label>
            <input
              name="metaTitle"
              defaultValue={defaults?.metaTitle ?? ''}
              placeholder={defaults?.title ? `${defaults.title}${defaults.code ? ` ${defaults.code}` : ''} | El Chino Americano` : 'Auto-generado del título del producto'}
              className={inputCls}
            />
            <p className="text-xs text-slate-400 mt-1">Máximo 60 caracteres. Se muestra en Google y resultados de búsqueda.</p>
          </div>
          <div>
            <Label>Meta descripción</Label>
            <textarea
              name="metaDescription"
              rows={2}
              defaultValue={defaults?.metaDescription ?? ''}
              placeholder="Auto-generada del título, marca y precio si se deja en blanco"
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-slate-400 mt-1">Máximo 160 caracteres. Aparece debajo del título en Google.</p>
          </div>
          <div>
            <Label>Slug URL</Label>
            <input name="slug" defaultValue={defaults?.slug ?? ''} placeholder="auto-generado-del-titulo" className={inputCls} />
            {defaults?.code && (
              <p className="text-xs text-slate-400 mt-1 font-mono">
                URL: {buildSlugPreview(defaults.code, defaults.slug)}
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section title="Especificaciones técnicas">
        <DynamicRows
          name="specs"
          columns={[
            { key: 'label', label: 'Atributo', placeholder: 'ej: Material' },
            { key: 'value', label: 'Valor', placeholder: 'ej: Aluminio' },
          ]}
          initialRows={defaults?.specs ?? []}
          addLabel="Agregar especificación"
        />
      </Section>

      <Section title="Códigos alternos" hidden>
        <DynamicRows
          name="codes"
          columns={[
            { key: 'code', label: 'Código', placeholder: 'ej: 7M0121004' },
            { key: 'source', label: 'Fuente', placeholder: 'ej: Toyota OEM' },
          ]}
          initialRows={defaults?.alternateCodes?.map((code) => ({ code: code.code, source: code.source ?? '' })) ?? []}
          addLabel="Agregar código"
        />
      </Section>

      <Section title="Compatibilidad con vehículos">
        <CompatSection brands={brands} initialCompat={defaults?.compatibilities ?? []} />
      </Section>

      <div className="flex gap-3 pt-2">
        <SubmitButton
          pendingText={mode === 'create' ? 'Creando...' : 'Guardando...'}
          className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
        </SubmitButton>
        <Link href={routes.admin.products.index} className="px-6 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Cancelar
        </Link>
      </div>
    </ValidatedForm>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{children}</label>
}

function Required() {
  return <span className="text-brand"> *</span>
}

function Section({ title, hint, hidden, children }: { title: string; hint?: string; hidden?: boolean; children: ReactNode }) {
  if (hidden) return null
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <h2 className="text-xs font-bold text-navy uppercase tracking-wider">{title}</h2>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function CheckField({ name, label, defaultChecked = false }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="w-4 h-4 rounded border-slate-300 text-navy focus:ring-navy/30 focus:ring-2" />
      <span className="text-sm text-slate-700 select-none">{label}</span>
    </label>
  )
}
