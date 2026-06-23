-- =========================================================
-- El Chino Americano — Suppliers Seed (Basic)
-- Run after 001_schema.sql
-- =========================================================

INSERT INTO suppliers (name, contact_name, phone, address) VALUES
  -- Importadores locales Ecuador
  ('Importadora Tomebamba S.A.',    'Gerente Comercial', '+593 7 283 0000', 'Cuenca, Azuay'),
  ('Auto Parts Ecuador Cía. Ltda.', 'Jefe de Compras',   '+593 2 250 0000', 'Quito, Pichincha'),
  ('Repuestos del Pacífico',        'Carlos Mendoza',    '+593 4 246 0000', 'Guayaquil, Guayas'),
  ('Automotores y Anexos S.A.',     'María López',       '+593 2 260 0000', 'Quito, Pichincha'),
  -- Proveedores directos marcas chinas
  ('Chery Ecuador (Ambacar)',       'Proveedor OEM',     '+593 2 400 0000', 'Quito, Pichincha'),
  ('Great Wall Ecuador (Casabaca)', 'Proveedor OEM',     '+593 2 410 0000', 'Quito, Pichincha'),
  ('BYD Ecuador',                  'Proveedor OEM',     '+593 4 500 0000', 'Guayaquil, Guayas'),
  -- Distribuidores de marcas de repuestos
  ('Bosch Ecuador',                'Distribuidor',      '+593 2 200 0000', 'Quito, Pichincha'),
  ('NGK Ecuador',                  'Distribuidor',      '+593 2 201 0000', 'Quito, Pichincha'),
  ('Monroe / Tenneco Ecuador',     'Distribuidor',      '+593 2 202 0000', 'Quito, Pichincha');
