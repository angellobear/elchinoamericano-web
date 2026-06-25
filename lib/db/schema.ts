import {
  pgTable, serial, varchar, text, boolean, timestamp,
  integer, numeric, char, primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── AUTH & ROLES ────────────────────────────────────────────────────────────

export const roles = pgTable('roles', {
  id:        serial('id').primaryKey(),
  name:      varchar('name', { length: 50 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const modules = pgTable('modules', {
  id:    serial('id').primaryKey(),
  key:   varchar('key', { length: 50 }).unique().notNull(),
  label: varchar('label', { length: 100 }).notNull(),
})

export const rolePermissions = pgTable('role_permissions', {
  roleId:    integer('role_id').references(() => roles.id,   { onDelete: 'cascade' }),
  moduleId:  integer('module_id').references(() => modules.id, { onDelete: 'cascade' }),
  canView:   boolean('can_view').default(false),
  canCreate: boolean('can_create').default(false),
  canEdit:   boolean('can_edit').default(false),
  canDelete: boolean('can_delete').default(false),
}, t => ({ pk: primaryKey({ columns: [t.roleId, t.moduleId] }) }))

export const users = pgTable('users', {
  id:           char('id', { length: 36 }).primaryKey(),
  email:        varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName:     varchar('full_name', { length: 100 }),
  roleId:       integer('role_id').references(() => roles.id),
  isActive:     boolean('is_active').default(true),
  lastLoginAt:  timestamp('last_login_at'),
  createdAt:    timestamp('created_at').defaultNow(),
  updatedAt:    timestamp('updated_at').defaultNow(),
})

// ─── VEHICLES ────────────────────────────────────────────────────────────────

export const vehicleBrands = pgTable('vehicle_brands', {
  id:            serial('id').primaryKey(),
  name:          varchar('name', { length: 100 }).notNull(),
  origin:        varchar('origin', { length: 20 }).notNull(),
  logoUrl:       varchar('logo_url', { length: 500 }),
  logoPublicId:  varchar('logo_public_id', { length: 200 }),
  sortOrder:     integer('sort_order').default(0),
  isActive:      boolean('is_active').default(true),
  isVisibleOnWeb: boolean('is_visible_on_web').default(false),
  createdAt:     timestamp('created_at').defaultNow(),
  updatedAt:     timestamp('updated_at').defaultNow(),
})

export const vehicleModels = pgTable('vehicle_models', {
  id:           serial('id').primaryKey(),
  brandId:      integer('brand_id').references(() => vehicleBrands.id, { onDelete: 'cascade' }),
  name:         varchar('name', { length: 150 }).notNull(),
  displacement: varchar('displacement', { length: 20 }),
  fuelType:     varchar('fuel_type', { length: 20 }),
  transmission: varchar('transmission', { length: 20 }),
  bodyType:     varchar('body_type', { length: 30 }),
  isActive:     boolean('is_active').default(true),
  createdAt:    timestamp('created_at').defaultNow(),
  updatedAt:    timestamp('updated_at').defaultNow(),
})

// ─── CATALOG ─────────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id:             serial('id').primaryKey(),
  parentId:       integer('parent_id'),
  key:            varchar('key', { length: 50 }).unique().notNull(),
  name:           varchar('name', { length: 100 }).notNull(),
  description:    text('description'),
  imageUrl:       varchar('image_url', { length: 500 }),
  imagePublicId:  varchar('image_public_id', { length: 200 }),
  sortOrder:      integer('sort_order').default(0),
  isActive:       boolean('is_active').default(true),
  createdAt:      timestamp('created_at').defaultNow(),
  updatedAt:      timestamp('updated_at').defaultNow(),
})

export const partBrands = pgTable('part_brands', {
  id:            serial('id').primaryKey(),
  name:          varchar('name', { length: 100 }).notNull(),
  logoUrl:       varchar('logo_url', { length: 500 }),
  logoPublicId:  varchar('logo_public_id', { length: 200 }),
  originCountry: varchar('origin_country', { length: 100 }),
  isActive:      boolean('is_active').default(true),
  createdAt:     timestamp('created_at').defaultNow(),
  updatedAt:     timestamp('updated_at').defaultNow(),
})

export const suppliers = pgTable('suppliers', {
  id:          serial('id').primaryKey(),
  name:        varchar('name', { length: 200 }).notNull(),
  contactName: varchar('contact_name', { length: 100 }),
  email:       varchar('email', { length: 255 }),
  phone:       varchar('phone', { length: 30 }),
  address:     text('address'),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
})

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id:               serial('id').primaryKey(),
  code:             varchar('code', { length: 20 }).unique(),
  sku:              varchar('sku', { length: 100 }),
  title:            varchar('title', { length: 255 }).notNull(),
  shortTitle:       varchar('short_title', { length: 100 }),
  description:      text('description'),
  shortDescription: varchar('short_description', { length: 500 }),
  price:            numeric('price', { precision: 10, scale: 2 }).notNull(),
  costPrice:        numeric('cost_price', { precision: 10, scale: 2 }),
  discountPct:      numeric('discount_pct', { precision: 5, scale: 2 }),
  discountUntil:    timestamp('discount_until'),
  stock:            integer('stock').notNull().default(0),
  minStockAlert:    integer('min_stock_alert').default(5),
  categoryId:       integer('category_id').references(() => categories.id),
  partBrandId:      integer('part_brand_id').references(() => partBrands.id),
  supplierId:       integer('supplier_id').references(() => suppliers.id),
  type:             varchar('type', { length: 20 }).notNull(),
  condition:        varchar('condition', { length: 20 }).default('new'),
  weightKg:         numeric('weight_kg', { precision: 8, scale: 3 }),
  slug:             varchar('slug', { length: 255 }).unique().notNull(),
  metaTitle:        varchar('meta_title', { length: 255 }),
  metaDescription:  varchar('meta_description', { length: 500 }),
  isFeatured:       boolean('is_featured').default(false),
  isActive:         boolean('is_active').default(true),
  createdAt:        timestamp('created_at').defaultNow(),
  updatedAt:        timestamp('updated_at').defaultNow(),
})

export const productImages = pgTable('product_images', {
  id:                  serial('id').primaryKey(),
  productId:           integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  url:                 varchar('url', { length: 500 }).notNull(),
  cloudinaryPublicId:  varchar('cloudinary_public_id', { length: 200 }),
  altText:             varchar('alt_text', { length: 255 }),
  isPrimary:           boolean('is_primary').default(false),
  sortOrder:           integer('sort_order').default(0),
  createdAt:           timestamp('created_at').defaultNow(),
})

export const productSpecs = pgTable('product_specs', {
  id:        serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  label:     varchar('label', { length: 100 }).notNull(),
  value:     varchar('value', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').default(0),
})

export const productAlternateCodes = pgTable('product_alternate_codes', {
  id:        serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  code:      varchar('code', { length: 100 }).notNull(),
  source:    varchar('source', { length: 200 }),
})

export const productEquivalencies = pgTable('product_equivalencies', {
  productId:    integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  equivalentId: integer('equivalent_id').references(() => products.id, { onDelete: 'cascade' }),
}, t => ({ pk: primaryKey({ columns: [t.productId, t.equivalentId] }) }))

export const productCompatibilities = pgTable('product_compatibilities', {
  productId:      integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  vehicleModelId: integer('vehicle_model_id').references(() => vehicleModels.id, { onDelete: 'cascade' }),
  yearStart:      integer('year_start'),
  yearEnd:        integer('year_end'),
  notes:          varchar('notes', { length: 255 }),
}, t => ({ pk: primaryKey({ columns: [t.productId, t.vehicleModelId] }) }))

// ─── INVENTORY & AUDIT ───────────────────────────────────────────────────────

export const stockMovements = pgTable('stock_movements', {
  id:           serial('id').primaryKey(),
  productId:    integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
  quantity:     integer('quantity').notNull(),
  movementType: varchar('movement_type', { length: 20 }).notNull(),
  reason:       text('reason'),
  userId:       char('user_id', { length: 36 }),
  createdAt:    timestamp('created_at').defaultNow(),
})

export const auditLog = pgTable('audit_log', {
  id:        serial('id').primaryKey(),
  userId:    char('user_id', { length: 36 }),
  action:    varchar('action', { length: 50 }).notNull(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId:  varchar('record_id', { length: 50 }),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── RELATIONS (para .with() en queries) ─────────────────────────────────────

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
}))

export const vehicleBrandsRelations = relations(vehicleBrands, ({ many }) => ({
  models: many(vehicleModels),
}))

export const vehicleModelsRelations = relations(vehicleModels, ({ one }) => ({
  brand: one(vehicleBrands, { fields: [vehicleModels.brandId], references: [vehicleBrands.id] }),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const partBrandsRelations = relations(partBrands, ({ many }) => ({
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category:       one(categories,  { fields: [products.categoryId],  references: [categories.id] }),
  partBrand:      one(partBrands,  { fields: [products.partBrandId], references: [partBrands.id] }),
  supplier:       one(suppliers,   { fields: [products.supplierId],  references: [suppliers.id] }),
  images:         many(productImages),
  specs:          many(productSpecs),
  alternateCodes: many(productAlternateCodes),
  compatibilities: many(productCompatibilities),
}))

export const productCompatibilitiesRelations = relations(productCompatibilities, ({ one }) => ({
  product: one(products,      { fields: [productCompatibilities.productId],      references: [products.id] }),
  model:   one(vehicleModels, { fields: [productCompatibilities.vehicleModelId], references: [vehicleModels.id] }),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))

export const productSpecsRelations = relations(productSpecs, ({ one }) => ({
  product: one(products, { fields: [productSpecs.productId], references: [products.id] }),
}))

// ─── INFERRED TYPES ──────────────────────────────────────────────────────────

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type Role            = InferSelectModel<typeof roles>
export type User            = InferSelectModel<typeof users>
export type VehicleBrand    = InferSelectModel<typeof vehicleBrands>
export type VehicleModel    = InferSelectModel<typeof vehicleModels>
export type Category        = InferSelectModel<typeof categories>
export type PartBrand       = InferSelectModel<typeof partBrands>
export type Supplier        = InferSelectModel<typeof suppliers>
export type Product         = InferSelectModel<typeof products>
export type ProductImage    = InferSelectModel<typeof productImages>
export type ProductSpec     = InferSelectModel<typeof productSpecs>
export type StockMovement   = InferSelectModel<typeof stockMovements>

export type NewProduct      = InferInsertModel<typeof products>
export type NewProductImage = InferInsertModel<typeof productImages>
