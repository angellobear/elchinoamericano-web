// Schema MySQL — espejo de schema.ts para ambiente local
// Usa mysqlTable con tipos compatibles con MySQL 8.0+
import {
  mysqlTable, varchar, text, boolean, timestamp,
  int, decimal, char, primaryKey,
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

// ─── AUTH & ROLES ────────────────────────────────────────────────────────────

export const roles = mysqlTable('roles', {
  id:        int('id').autoincrement().primaryKey(),
  name:      varchar('name', { length: 50 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const modules = mysqlTable('modules', {
  id:    int('id').autoincrement().primaryKey(),
  key:   varchar('key', { length: 50 }).unique().notNull(),
  label: varchar('label', { length: 100 }).notNull(),
})

export const rolePermissions = mysqlTable('role_permissions', {
  roleId:    int('role_id').references(() => roles.id),
  moduleId:  int('module_id').references(() => modules.id),
  canView:   boolean('can_view').default(false),
  canCreate: boolean('can_create').default(false),
  canEdit:   boolean('can_edit').default(false),
  canDelete: boolean('can_delete').default(false),
}, t => ({ pk: primaryKey({ columns: [t.roleId, t.moduleId] }) }))

export const users = mysqlTable('users', {
  id:           char('id', { length: 36 }).primaryKey(),
  email:        varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName:     varchar('full_name', { length: 100 }),
  roleId:       int('role_id').references(() => roles.id),
  isActive:     boolean('is_active').default(true),
  lastLoginAt:  timestamp('last_login_at'),
  createdAt:    timestamp('created_at').defaultNow(),
  updatedAt:    timestamp('updated_at').defaultNow(),
})

// ─── VEHICLES ────────────────────────────────────────────────────────────────

export const vehicleBrands = mysqlTable('vehicle_brands', {
  id:        int('id').autoincrement().primaryKey(),
  name:      varchar('name', { length: 100 }).notNull(),
  origin:    varchar('origin', { length: 20 }).notNull(),
  logoUrl:   varchar('logo_url', { length: 500 }),
  sortOrder: int('sort_order').default(0),
  isActive:  boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const vehicleModels = mysqlTable('vehicle_models', {
  id:           int('id').autoincrement().primaryKey(),
  brandId:      int('brand_id').references(() => vehicleBrands.id),
  name:         varchar('name', { length: 150 }).notNull(),
  displacement: varchar('displacement', { length: 20 }),
  fuelType:     varchar('fuel_type', { length: 20 }),
  transmission: varchar('transmission', { length: 20 }),
  bodyType:     varchar('body_type', { length: 30 }),
  yearStart:    int('year_start'),
  yearEnd:      int('year_end'),
  isActive:     boolean('is_active').default(true),
  createdAt:    timestamp('created_at').defaultNow(),
})

// ─── CATALOG ─────────────────────────────────────────────────────────────────

export const categories = mysqlTable('categories', {
  id:          int('id').autoincrement().primaryKey(),
  parentId:    int('parent_id'),
  key:         varchar('key', { length: 50 }).unique().notNull(),
  name:        varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  imageUrl:    varchar('image_url', { length: 500 }),
  sortOrder:   int('sort_order').default(0),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at').defaultNow(),
})

export const partBrands = mysqlTable('part_brands', {
  id:            int('id').autoincrement().primaryKey(),
  name:          varchar('name', { length: 100 }).notNull(),
  logoUrl:       varchar('logo_url', { length: 500 }),
  originCountry: varchar('origin_country', { length: 100 }),
  isActive:      boolean('is_active').default(true),
  createdAt:     timestamp('created_at').defaultNow(),
})

export const suppliers = mysqlTable('suppliers', {
  id:          int('id').autoincrement().primaryKey(),
  name:        varchar('name', { length: 200 }).notNull(),
  contactName: varchar('contact_name', { length: 100 }),
  email:       varchar('email', { length: 255 }),
  phone:       varchar('phone', { length: 30 }),
  address:     text('address'),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at').defaultNow(),
})

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export const products = mysqlTable('products', {
  id:               int('id').autoincrement().primaryKey(),
  code:             varchar('code', { length: 20 }).unique(),
  sku:              varchar('sku', { length: 100 }),
  title:            varchar('title', { length: 255 }).notNull(),
  shortTitle:       varchar('short_title', { length: 100 }),
  description:      text('description'),
  shortDescription: varchar('short_description', { length: 500 }),
  price:            decimal('price', { precision: 10, scale: 2 }).notNull(),
  costPrice:        decimal('cost_price', { precision: 10, scale: 2 }),
  discountPct:      decimal('discount_pct', { precision: 5, scale: 2 }),
  discountUntil:    timestamp('discount_until'),
  stock:            int('stock').notNull().default(0),
  minStockAlert:    int('min_stock_alert').default(5),
  categoryId:       int('category_id').references(() => categories.id),
  partBrandId:      int('part_brand_id').references(() => partBrands.id),
  supplierId:       int('supplier_id').references(() => suppliers.id),
  type:             varchar('type', { length: 20 }).notNull(),
  condition:        varchar('condition', { length: 20 }).default('new'),
  weightKg:         decimal('weight_kg', { precision: 8, scale: 3 }),
  slug:             varchar('slug', { length: 255 }).unique().notNull(),
  metaTitle:        varchar('meta_title', { length: 255 }),
  metaDescription:  varchar('meta_description', { length: 500 }),
  isFeatured:       boolean('is_featured').default(false),
  isActive:         boolean('is_active').default(true),
  createdAt:        timestamp('created_at').defaultNow(),
  updatedAt:        timestamp('updated_at').defaultNow(),
})

export const productImages = mysqlTable('product_images', {
  id:                 int('id').autoincrement().primaryKey(),
  productId:          int('product_id').references(() => products.id),
  url:                varchar('url', { length: 500 }).notNull(),
  cloudinaryPublicId: varchar('cloudinary_public_id', { length: 200 }),
  altText:            varchar('alt_text', { length: 255 }),
  isPrimary:          boolean('is_primary').default(false),
  sortOrder:          int('sort_order').default(0),
  createdAt:          timestamp('created_at').defaultNow(),
})

export const productSpecs = mysqlTable('product_specs', {
  id:        int('id').autoincrement().primaryKey(),
  productId: int('product_id').references(() => products.id),
  label:     varchar('label', { length: 100 }).notNull(),
  value:     varchar('value', { length: 255 }).notNull(),
  sortOrder: int('sort_order').default(0),
})

export const productAlternateCodes = mysqlTable('product_alternate_codes', {
  id:        int('id').autoincrement().primaryKey(),
  productId: int('product_id').references(() => products.id),
  code:      varchar('code', { length: 100 }).notNull(),
  source:    varchar('source', { length: 200 }),
})

export const productEquivalencies = mysqlTable('product_equivalencies', {
  productId:    int('product_id').references(() => products.id),
  equivalentId: int('equivalent_id').references(() => products.id),
}, t => ({ pk: primaryKey({ columns: [t.productId, t.equivalentId] }) }))

export const productCompatibilities = mysqlTable('product_compatibilities', {
  productId:      int('product_id').references(() => products.id),
  vehicleModelId: int('vehicle_model_id').references(() => vehicleModels.id),
  notes:          varchar('notes', { length: 255 }),
}, t => ({ pk: primaryKey({ columns: [t.productId, t.vehicleModelId] }) }))

// ─── INVENTORY & AUDIT ───────────────────────────────────────────────────────

export const stockMovements = mysqlTable('stock_movements', {
  id:           int('id').autoincrement().primaryKey(),
  productId:    int('product_id').references(() => products.id),
  quantity:     int('quantity').notNull(),
  movementType: varchar('movement_type', { length: 20 }).notNull(),
  reason:       text('reason'),
  userId:       char('user_id', { length: 36 }),
  createdAt:    timestamp('created_at').defaultNow(),
})

export const auditLog = mysqlTable('audit_log', {
  id:        int('id').autoincrement().primaryKey(),
  userId:    char('user_id', { length: 36 }),
  action:    varchar('action', { length: 50 }).notNull(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId:  varchar('record_id', { length: 50 }),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── RELATIONS ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
}))

export const vehicleBrandsRelations = relations(vehicleBrands, ({ many }) => ({
  models: many(vehicleModels),
}))

export const vehicleModelsRelations = relations(vehicleModels, ({ one }) => ({
  brand: one(vehicleBrands, { fields: [vehicleModels.brandId], references: [vehicleBrands.id] }),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category:        one(categories,  { fields: [products.categoryId],  references: [categories.id] }),
  partBrand:       one(partBrands,  { fields: [products.partBrandId], references: [partBrands.id] }),
  supplier:        one(suppliers,   { fields: [products.supplierId],  references: [suppliers.id] }),
  images:          many(productImages),
  specs:           many(productSpecs),
  alternateCodes:  many(productAlternateCodes),
  compatibilities: many(productCompatibilities),
}))

export const productCompatibilitiesRelations = relations(productCompatibilities, ({ one }) => ({
  product: one(products,      { fields: [productCompatibilities.productId],      references: [products.id] }),
  model:   one(vehicleModels, { fields: [productCompatibilities.vehicleModelId], references: [vehicleModels.id] }),
}))
