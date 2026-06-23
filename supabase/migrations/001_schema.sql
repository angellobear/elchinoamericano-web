-- =========================================================
-- El Chino Americano — Initial Schema
-- DB-portable: compatible with PostgreSQL (Supabase) and MySQL 5.7+/8.0
-- Run in Supabase SQL editor or via Supabase CLI: supabase db push
-- =========================================================

-- ─────────────────────────────────────────
-- AUTH & ROLES
-- ─────────────────────────────────────────

CREATE TABLE roles (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(50)  UNIQUE NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modules (
  id    SERIAL PRIMARY KEY,
  key   VARCHAR(50)  UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL
);

CREATE TABLE role_permissions (
  role_id    INT  REFERENCES roles(id)   ON DELETE CASCADE,
  module_id  INT  REFERENCES modules(id) ON DELETE CASCADE,
  can_view   BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit   BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (role_id, module_id)
);

-- UUID generated at app layer (stored as TEXT for MySQL portability)
CREATE TABLE users (
  id             TEXT         PRIMARY KEY,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  TEXT         NOT NULL,
  full_name      VARCHAR(100),
  role_id        INT          REFERENCES roles(id),
  is_active      BOOLEAN      DEFAULT TRUE,
  last_login_at  TIMESTAMP,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- VEHICLES
-- ─────────────────────────────────────────

CREATE TABLE vehicle_brands (
  id         SERIAL       PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  origin     VARCHAR(20)  NOT NULL,   -- 'chinese' | 'american' | 'european' | 'japanese' | 'korean'
  logo_url   VARCHAR(500),
  sort_order INT          DEFAULT 0,
  is_active  BOOLEAN      DEFAULT TRUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Each row = one version/trim: brand + model name + displacement + years
-- Allows structured compatibility table in the public frontend
CREATE TABLE vehicle_models (
  id           SERIAL       PRIMARY KEY,
  brand_id     INT          REFERENCES vehicle_brands(id) ON DELETE CASCADE,
  name         VARCHAR(150) NOT NULL,
  displacement VARCHAR(20),           -- "1.4", "2.0T", "2.2"
  fuel_type    VARCHAR(20),           -- 'gasoline' | 'diesel' | 'hybrid' | 'electric'
  transmission VARCHAR(20),           -- 'manual' | 'automatic' | 'cvt' (phase 2)
  body_type    VARCHAR(30),           -- 'sedan' | 'suv' | 'pickup' | 'hatchback' (phase 2)
  year_start   INT,
  year_end     INT,                   -- NULL = still in production
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- CATALOG STRUCTURE
-- ─────────────────────────────────────────

-- Self-referencing for subcategories; parent_id NULL = top-level category
CREATE TABLE categories (
  id          SERIAL       PRIMARY KEY,
  parent_id   INT          REFERENCES categories(id),
  key         VARCHAR(50)  UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  sort_order  INT          DEFAULT 0,
  is_active   BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE part_brands (
  id              SERIAL       PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  logo_url        VARCHAR(500),
  origin_country  VARCHAR(100),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
  id           SERIAL       PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  contact_name VARCHAR(100),
  email        VARCHAR(255),
  phone        VARCHAR(30),
  address      TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags: searchable keyword dictionary (phase 2)
CREATE TABLE tags (
  id   SERIAL       PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

-- ─────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────

CREATE TABLE products (
  id                SERIAL        PRIMARY KEY,
  code              VARCHAR(20)   UNIQUE,          -- CA-0001, set by app after insert
  sku               VARCHAR(100),
  title             VARCHAR(255)  NOT NULL,
  short_title       VARCHAR(100),
  description       TEXT,
  short_description VARCHAR(500),
  price             DECIMAL(10,2) NOT NULL,
  cost_price        DECIMAL(10,2),                 -- internal only, never public
  discount_pct      DECIMAL(5,2),                  -- 0–100; NULL = no discount
  discount_until    TIMESTAMP,                     -- NULL or past = offer inactive
  stock             INT           NOT NULL DEFAULT 0,
  min_stock_alert   INT           DEFAULT 5,
  category_id       INT           REFERENCES categories(id),
  part_brand_id     INT           REFERENCES part_brands(id),
  supplier_id       INT           REFERENCES suppliers(id),
  type              VARCHAR(20)   NOT NULL,        -- 'original' | 'oem' | 'aftermarket'
  condition         VARCHAR(20)   DEFAULT 'new',   -- 'new' | 'used' | 'refurbished'
  weight_kg         DECIMAL(8,3),
  slug              VARCHAR(255)  UNIQUE NOT NULL,
  meta_title        VARCHAR(255),
  meta_description  VARCHAR(500),
  is_featured       BOOLEAN       DEFAULT FALSE,
  is_active         BOOLEAN       DEFAULT TRUE,
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);
-- offer_price computed in app (not stored):
-- price * (1 - discount_pct / 100) when discount_pct IS NOT NULL AND discount_until > NOW()

CREATE TABLE product_images (
  id                   SERIAL       PRIMARY KEY,
  product_id           INT          REFERENCES products(id) ON DELETE CASCADE,
  url                  VARCHAR(500) NOT NULL,
  cloudinary_public_id VARCHAR(200),
  alt_text             VARCHAR(255),
  is_primary           BOOLEAN      DEFAULT FALSE,
  sort_order           INT          DEFAULT 0,
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_specs (
  id         SERIAL       PRIMARY KEY,
  product_id INT          REFERENCES products(id) ON DELETE CASCADE,
  label      VARCHAR(100) NOT NULL,
  value      VARCHAR(255) NOT NULL,
  sort_order INT          DEFAULT 0
);

-- External manufacturer / OEM codes (n per product)
CREATE TABLE product_alternate_codes (
  id         SERIAL       PRIMARY KEY,
  product_id INT          REFERENCES products(id) ON DELETE CASCADE,
  code       VARCHAR(100) NOT NULL,
  source     VARCHAR(200)            -- "OEM Ford", "Bosch reference"
);

-- Other products in the catalog that are interchangeable
-- Both directions inserted (A→B and B→A) so either direction can query efficiently
CREATE TABLE product_equivalencies (
  product_id    INT REFERENCES products(id) ON DELETE CASCADE,
  equivalent_id INT REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, equivalent_id),
  CHECK (product_id <> equivalent_id)
);

CREATE TABLE product_compatibilities (
  product_id       INT REFERENCES products(id)       ON DELETE CASCADE,
  vehicle_model_id INT REFERENCES vehicle_models(id) ON DELETE CASCADE,
  notes            VARCHAR(255),
  PRIMARY KEY (product_id, vehicle_model_id)
);

CREATE TABLE product_tags (
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  tag_id     INT REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- ─────────────────────────────────────────
-- INVENTORY & AUDIT
-- ─────────────────────────────────────────

CREATE TABLE stock_movements (
  id            SERIAL      PRIMARY KEY,
  product_id    INT         REFERENCES products(id) ON DELETE CASCADE,
  quantity      INT         NOT NULL,     -- positive = in, negative = out
  movement_type VARCHAR(20) NOT NULL,     -- 'purchase' | 'sale' | 'adjustment' | 'return'
  reason        TEXT,
  user_id       TEXT,                     -- who triggered the change
  created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
  id          SERIAL       PRIMARY KEY,
  user_id     TEXT,
  action      VARCHAR(50)  NOT NULL,      -- 'CREATE' | 'UPDATE' | 'DELETE'
  table_name  VARCHAR(100) NOT NULL,
  record_id   VARCHAR(50),
  old_values  TEXT,                       -- JSON serialized as TEXT
  new_values  TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

CREATE INDEX idx_products_slug         ON products(slug);
CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_products_is_active    ON products(is_active);
CREATE INDEX idx_products_is_featured  ON products(is_featured);
CREATE INDEX idx_vehicle_models_brand  ON vehicle_models(brand_id);
CREATE INDEX idx_product_compat_prod   ON product_compatibilities(product_id);
CREATE INDEX idx_product_compat_model  ON product_compatibilities(vehicle_model_id);
CREATE INDEX idx_product_alt_codes     ON product_alternate_codes(product_id);
CREATE INDEX idx_product_equiv         ON product_equivalencies(product_id);
CREATE INDEX idx_stock_movements_prod  ON stock_movements(product_id);
CREATE INDEX idx_audit_log_table       ON audit_log(table_name, record_id);
