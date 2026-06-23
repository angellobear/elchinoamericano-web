-- =========================================================
-- El Chino Americano — Seed Data
-- Run after 001_schema.sql
-- =========================================================

-- ROLES
INSERT INTO roles (name) VALUES
  ('superadmin'),
  ('admin'),
  ('employee');

-- MODULES
INSERT INTO modules (key, label) VALUES
  ('products',       'Productos'),
  ('categories',     'Categorías'),
  ('inventory',      'Inventario'),
  ('vehicle_brands', 'Marcas de Vehículos'),
  ('part_brands',    'Marcas de Repuestos'),
  ('suppliers',      'Proveedores'),
  ('users',          'Usuarios');

-- ROLE PERMISSIONS
-- superadmin (id=1): everything
INSERT INTO role_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete)
SELECT 1, id, TRUE, TRUE, TRUE, TRUE FROM modules;

-- admin (id=2): everything except users
INSERT INTO role_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete)
SELECT 2, id, TRUE, TRUE, TRUE, TRUE FROM modules WHERE key <> 'users';

-- employee (id=3): view products + inventory, edit inventory only
INSERT INTO role_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete)
VALUES
  (3, (SELECT id FROM modules WHERE key = 'products'),   TRUE,  FALSE, FALSE, FALSE),
  (3, (SELECT id FROM modules WHERE key = 'inventory'),  TRUE,  FALSE, TRUE,  FALSE),
  (3, (SELECT id FROM modules WHERE key = 'categories'), TRUE,  FALSE, FALSE, FALSE);

-- CATEGORIES (keys in Spanish to match existing frontend filter values)
INSERT INTO categories (key, name, sort_order) VALUES
  ('motor',        'Motor',                   1),
  ('frenos',       'Frenos',                  2),
  ('suspension',   'Suspensión y Dirección',  3),
  ('filtros',      'Filtros',                 4),
  ('carroceria',   'Carrocería',              5),
  ('enfriamiento', 'Sistema de Enfriamiento', 6);

-- VEHICLE BRANDS
INSERT INTO vehicle_brands (name, origin, sort_order) VALUES
  -- Chinese
  ('Chery',      'chinese',  1),
  ('Great Wall', 'chinese',  2),
  ('BYD',        'chinese',  3),
  ('DFSK',       'chinese',  4),
  ('Jetour',     'chinese',  5),
  ('Shineray',   'chinese',  6),
  ('MG',         'chinese',  7),
  ('JAC',        'chinese',  8),
  -- American
  ('Ford',       'american', 9),
  ('Chevrolet',  'american', 10);

-- VEHICLE MODELS (sample, admin will add more)
INSERT INTO vehicle_models (brand_id, name, displacement, fuel_type, year_start, year_end) VALUES
  -- Chery (1)
  (1, 'Tiggo 5',     '2.0', 'gasoline', 2019, 2023),
  (1, 'Arrizo 5',    '1.5', 'gasoline', 2018, 2023),
  -- Great Wall (2)
  (2, 'Wingle 5',    '2.2', 'gasoline', 2016, 2019),
  (2, 'Wingle 6',    '2.0', 'gasoline', 2020, NULL),
  -- BYD (3)
  (3, 'Song Plus',   '1.5', 'hybrid',   2021, NULL),
  -- DFSK (4)
  (4, 'Glory 580',   '1.5', 'gasoline', 2020, 2023),
  -- MG (7)
  (7, 'ZS',          '1.5', 'gasoline', 2020, NULL),
  -- JAC (8)
  (8, 'T8',          '2.0', 'gasoline', 2020, NULL),
  -- Ford (9)
  (9, 'F-150',       '3.5', 'gasoline', 2018, 2022),
  (9, 'Ranger',      '2.5', 'gasoline', 2016, 2020),
  (9, 'Explorer',    '2.3', 'gasoline', 2017, 2021),
  -- Chevrolet (10)
  (10, 'Silverado',  '5.3', 'gasoline', 2019, 2022),
  (10, 'Blazer',     '2.0', 'gasoline', 2019, 2023);

-- PART BRANDS (common auto parts manufacturers)
INSERT INTO part_brands (name) VALUES
  ('Bosch'),
  ('NGK'),
  ('Brembo'),
  ('Monroe'),
  ('Gates'),
  ('Denso'),
  ('Ferodo'),
  ('Mann'),
  ('Sakura'),
  ('Moog'),
  ('TYC'),
  ('MGT Magiaty');
