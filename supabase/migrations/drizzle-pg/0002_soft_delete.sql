ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE vehicle_brands ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE part_brands ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at timestamp;
