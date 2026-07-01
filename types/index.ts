// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export type ProductType = 'original' | 'oem' | 'aftermarket'
export type ProductCondition = 'new' | 'used' | 'refurbished'
export type VehicleOrigin = 'chinese' | 'american' | 'european' | 'japanese' | 'korean'
export type StockMovementType = 'purchase' | 'sale' | 'adjustment' | 'return'
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

// ─────────────────────────────────────────
// VEHICLES
// ─────────────────────────────────────────

export interface VehicleBrand {
  id: number
  name: string
  origin: VehicleOrigin
  logo_url?: string
  sort_order: number
  is_active: boolean
  is_visible_on_web?: boolean
}

export interface VehicleModel {
  id: number
  brand_id: number
  brand?: VehicleBrand
  name: string
  displacement?: string
  fuel_type?: string
  drive_type?: string
  transmission?: string
  body_type?: string
  year_start?: number
  year_end?: number | null  // null = still in production
  is_active: boolean
}

// ─────────────────────────────────────────
// CATALOG STRUCTURE
// ─────────────────────────────────────────

export interface Category {
  id: number
  parent_id?: number | null
  key: string
  name: string
  description?: string
  image_url?: string
  sort_order: number
  is_active: boolean
}

export interface PartBrand {
  id: number
  name: string
  logo_url?: string
  origin_country?: string
  is_active: boolean
}

export interface Supplier {
  id: number
  name: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  is_active: boolean
}

// ─────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────

export interface ProductImage {
  id: number
  product_id: number
  url: string
  cloudinary_public_id?: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
}

export interface ProductSpec {
  id?: number
  product_id?: number
  label: string
  value: string
  sort_order?: number
}

export interface ProductAlternateCode {
  id: number
  product_id: number
  code: string
  source?: string
}

export interface ProductCompatibility {
  product_id: number
  vehicle_model_id: number
  model?: VehicleModel
  notes?: string
}

export interface Product {
  id: number
  code: string
  sku?: string
  title: string
  short_title?: string
  description?: string
  short_description?: string
  price: number
  cost_price?: number           // internal only — never render publicly
  discount_pct?: number         // 0–100
  discount_until?: string | null
  offer_price?: number          // computed at app layer
  stock: number
  min_stock_alert?: number
  category_id?: number
  category?: Category
  part_brand_id?: number
  part_brand?: PartBrand
  supplier_id?: number
  supplier?: Supplier
  type: ProductType
  condition?: ProductCondition
  weight_kg?: number
  slug: string
  meta_title?: string
  meta_description?: string
  is_featured: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
  images?: ProductImage[]
  specs?: ProductSpec[]
  alternate_codes?: ProductAlternateCode[]
  equivalencies?: Product[]
  compatibilities?: ProductCompatibility[]
}

// ─────────────────────────────────────────
// CART
// ─────────────────────────────────────────

export interface CartItem {
  id: number
  code: string
  title: string
  short_title?: string
  price: number
  offer_price?: number
  slug: string
  primary_image?: string    // url of the primary image
  qty: number
}

// ─────────────────────────────────────────
// AUTH & ADMIN
// ─────────────────────────────────────────

export interface Role {
  id: number
  name: string
}

export interface ModulePermissions {
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

export type PermissionsMap = Record<string, ModulePermissions>

export interface AdminUser {
  id: string
  email: string
  full_name?: string
  role_id: number
  role?: Role
  is_active: boolean
  last_login_at?: string
  created_at: string
}

// JWT payload stored in the httpOnly cookie
export interface JWTPayload {
  userId: string
  email: string
  role: string
  permissions: PermissionsMap
}

// ─────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────

export interface StockMovement {
  id: number
  product_id: number
  quantity: number
  movement_type: StockMovementType
  reason?: string
  user_id?: string
  created_at: string
}
