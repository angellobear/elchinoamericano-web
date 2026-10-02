import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  int,
  date,
  decimal,
  char,
  json,
  primaryKey,
} from 'drizzle-orm/mysql-core'
import { relations, sql } from 'drizzle-orm'
// Relativo y solo de tipo: drizzle-kit carga este archivo sin el alias "@/".
import type { DeliveryPhoto } from '../orders'

const mysqlCurrentTimestamp = sql`CURRENT_TIMESTAMP`

export const roles = mysqlTable('roles', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
})

export const modules = mysqlTable('modules', {
  id: int('id').autoincrement().primaryKey(),
  key: varchar('key', { length: 50 }).unique().notNull(),
  label: varchar('label', { length: 100 }).notNull(),
})

export const rolePermissions = mysqlTable('role_permissions', {
  roleId: int('role_id').references(() => roles.id),
  moduleId: int('module_id').references(() => modules.id),
  canView: boolean('can_view').default(false),
  canCreate: boolean('can_create').default(false),
  canEdit: boolean('can_edit').default(false),
  canDelete: boolean('can_delete').default(false),
}, (t) => ({ pk: primaryKey({ columns: [t.roleId, t.moduleId] }) }))

export const users = mysqlTable('users', {
  id: char('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 100 }),
  roleId: int('role_id').references(() => roles.id),
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
  updatedAt: timestamp('updated_at').default(mysqlCurrentTimestamp),
})

// Sesiones del admin: una fila por dispositivo. Solo se guarda el hash del token de renovación.
export const sessions = mysqlTable('sessions', {
  id: char('id', { length: 36 }).primaryKey(),
  userId: char('user_id', { length: 36 }).notNull().references(() => users.id),
  tokenHash: char('token_hash', { length: 64 }).notNull(),
  prevTokenHash: char('prev_token_hash', { length: 64 }),
  rotatedAt: timestamp('rotated_at'),
  userAgent: varchar('user_agent', { length: 255 }),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
  lastUsedAt: timestamp('last_used_at').default(mysqlCurrentTimestamp),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
})

export const vehicleBrands = mysqlTable('vehicle_brands', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  origin: varchar('origin', { length: 20 }).notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),
  logoPublicId: varchar('logo_public_id', { length: 200 }),
  sortOrder: int('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  isVisibleOnWeb: boolean('is_visible_on_web').default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
  updatedAt: timestamp('updated_at').default(mysqlCurrentTimestamp),
})

export const vehicleModels = mysqlTable('vehicle_models', {
  id: int('id').autoincrement().primaryKey(),
  brandId: int('brand_id').references(() => vehicleBrands.id),
  name: varchar('name', { length: 150 }).notNull(),
  displacement: varchar('displacement', { length: 20 }),
  fuelType: varchar('fuel_type', { length: 20 }),
  transmission: varchar('transmission', { length: 20 }),
  driveType: varchar('drive_type', { length: 10 }),
  bodyType: varchar('body_type', { length: 30 }),
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
  updatedAt: timestamp('updated_at').default(mysqlCurrentTimestamp),
})

export const categories = mysqlTable('categories', {
  id: int('id').autoincrement().primaryKey(),
  parentId: int('parent_id'),
  key: varchar('key', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  imagePublicId: varchar('image_public_id', { length: 200 }),
  sortOrder: int('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
  updatedAt: timestamp('updated_at').default(mysqlCurrentTimestamp),
})

export const partBrands = mysqlTable('part_brands', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),
  logoPublicId: varchar('logo_public_id', { length: 200 }),
  originCountry: varchar('origin_country', { length: 100 }),
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
  updatedAt: timestamp('updated_at').default(mysqlCurrentTimestamp),
})

export const suppliers = mysqlTable('suppliers', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  contactName: varchar('contact_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
  address: text('address'),
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
  updatedAt: timestamp('updated_at').default(mysqlCurrentTimestamp),
})

export const products = mysqlTable('products', {
  id: int('id').autoincrement().primaryKey(),
  code: varchar('code', { length: 20 }).unique(),
  sku: varchar('sku', { length: 100 }),
  replacementCode: varchar('replacement_code', { length: 100 }),
  title: varchar('title', { length: 255 }).notNull(),
  shortTitle: varchar('short_title', { length: 100 }),
  description: text('description'),
  shortDescription: varchar('short_description', { length: 500 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  discountPct: decimal('discount_pct', { precision: 5, scale: 2 }),
  discountUntil: timestamp('discount_until'),
  stock: int('stock').notNull().default(0),
  minStockAlert: int('min_stock_alert').default(5),
  categoryId: int('category_id').references(() => categories.id),
  partBrandId: int('part_brand_id').references(() => partBrands.id),
  supplierId: int('supplier_id').references(() => suppliers.id),
  type: varchar('type', { length: 20 }).notNull(),
  condition: varchar('condition', { length: 20 }).default('new'),
  weightKg: decimal('weight_kg', { precision: 8, scale: 3 }),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 500 }),
  isFeatured: boolean('is_featured').default(false),
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
  updatedAt: timestamp('updated_at').default(mysqlCurrentTimestamp),
})

export const productImages = mysqlTable('product_images', {
  id: int('id').autoincrement().primaryKey(),
  productId: int('product_id').references(() => products.id),
  url: varchar('url', { length: 500 }).notNull(),
  cloudinaryPublicId: varchar('cloudinary_public_id', { length: 200 }),
  altText: varchar('alt_text', { length: 255 }),
  isPrimary: boolean('is_primary').default(false),
  sortOrder: int('sort_order').default(0),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
})

export const productSpecs = mysqlTable('product_specs', {
  id: int('id').autoincrement().primaryKey(),
  productId: int('product_id').references(() => products.id),
  label: varchar('label', { length: 100 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  sortOrder: int('sort_order').default(0),
})

export const productAlternateCodes = mysqlTable('product_alternate_codes', {
  id: int('id').autoincrement().primaryKey(),
  productId: int('product_id').references(() => products.id),
  code: varchar('code', { length: 100 }).notNull(),
  source: varchar('source', { length: 200 }),
})

export const productEquivalencies = mysqlTable('product_equivalencies', {
  productId: int('product_id').references(() => products.id),
  equivalentId: int('equivalent_id').references(() => products.id),
}, (t) => ({ pk: primaryKey({ columns: [t.productId, t.equivalentId] }) }))

export const productCompatibilities = mysqlTable('product_compatibilities', {
  productId: int('product_id').references(() => products.id),
  vehicleModelId: int('vehicle_model_id').references(() => vehicleModels.id),
  yearStart: int('year_start'),
  yearEnd: int('year_end'),
  notes: varchar('notes', { length: 255 }),
}, (t) => ({ pk: primaryKey({ columns: [t.productId, t.vehicleModelId] }) }))

export const stockMovements = mysqlTable('stock_movements', {
  id: int('id').autoincrement().primaryKey(),
  productId: int('product_id').references(() => products.id),
  quantity: int('quantity').notNull(),
  movementType: varchar('movement_type', { length: 20 }).notNull(),
  reason: text('reason'),
  userId: char('user_id', { length: 36 }),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
})

export const orders = mysqlTable('orders', {
  id: int('id').autoincrement().primaryKey(),
  publicToken: char('public_token', { length: 43 }).unique().notNull(),
  customerName: varchar('customer_name', { length: 150 }),
  customerIdNumber: varchar('customer_id_number', { length: 20 }),
  customerPhone: varchar('customer_phone', { length: 30 }),
  discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  invoiceNumber: varchar('invoice_number', { length: 50 }),
  notes: text('notes'),
  estimatedDate: date('estimated_date', { mode: 'string' }),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  deliveredAt: date('delivered_at', { mode: 'string' }),
  receivedByName: varchar('received_by_name', { length: 150 }),
  receivedByIdNumber: varchar('received_by_id_number', { length: 20 }),
  deliveryPhotos: json('delivery_photos').$type<DeliveryPhoto[]>(),
  createdBy: char('created_by', { length: 36 }),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
  updatedAt: timestamp('updated_at').default(mysqlCurrentTimestamp),
})

export const orderItems = mysqlTable('order_items', {
  id: int('id').autoincrement().primaryKey(),
  orderId: int('order_id').notNull().references(() => orders.id),
  productId: int('product_id').references(() => products.id),
  description: varchar('description', { length: 255 }).notNull(),
  quantity: int('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
})

export const orderPayments = mysqlTable('order_payments', {
  id: int('id').autoincrement().primaryKey(),
  orderId: int('order_id').notNull().references(() => orders.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: varchar('method', { length: 20 }).notNull(),
  reference: varchar('reference', { length: 100 }),
  paidAt: date('paid_at', { mode: 'string' }).notNull(),
  userId: char('user_id', { length: 36 }),
  voidedAt: timestamp('voided_at'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
})

export const announcements = mysqlTable('announcements', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 150 }),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  imagePublicId: varchar('image_public_id', { length: 200 }),
  linkUrl: varchar('link_url', { length: 500 }),
  startsAt: date('starts_at', { mode: 'string' }).notNull(),
  endsAt: date('ends_at', { mode: 'string' }).notNull(),
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
  updatedAt: timestamp('updated_at').default(mysqlCurrentTimestamp),
})

export const auditLog = mysqlTable('audit_log', {
  id: int('id').autoincrement().primaryKey(),
  userId: char('user_id', { length: 36 }),
  action: varchar('action', { length: 50 }).notNull(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: varchar('record_id', { length: 50 }),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
})

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
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  partBrand: one(partBrands, { fields: [products.partBrandId], references: [partBrands.id] }),
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
  images: many(productImages),
  specs: many(productSpecs),
  alternateCodes: many(productAlternateCodes),
  compatibilities: many(productCompatibilities),
}))

export const productCompatibilitiesRelations = relations(productCompatibilities, ({ one }) => ({
  product: one(products, { fields: [productCompatibilities.productId], references: [products.id] }),
  model: one(vehicleModels, { fields: [productCompatibilities.vehicleModelId], references: [vehicleModels.id] }),
}))

export const productEquivalenciesRelations = relations(productEquivalencies, ({ one }) => ({
  product: one(products, { fields: [productEquivalencies.productId], references: [products.id] }),
  equivalent: one(products, { fields: [productEquivalencies.equivalentId], references: [products.id] }),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))

export const productSpecsRelations = relations(productSpecs, ({ one }) => ({
  product: one(products, { fields: [productSpecs.productId], references: [products.id] }),
}))

export const productAlternateCodesRelations = relations(productAlternateCodes, ({ one }) => ({
  product: one(products, { fields: [productAlternateCodes.productId], references: [products.id] }),
}))

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  payments: many(orderPayments),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}))

export const orderPaymentsRelations = relations(orderPayments, ({ one }) => ({
  order: one(orders, { fields: [orderPayments.orderId], references: [orders.id] }),
}))
