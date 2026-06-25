ALTER TABLE users ADD COLUMN deleted_at timestamp NULL;
ALTER TABLE vehicle_brands ADD COLUMN deleted_at timestamp NULL;
ALTER TABLE vehicle_models ADD COLUMN deleted_at timestamp NULL;
ALTER TABLE categories ADD COLUMN deleted_at timestamp NULL;
ALTER TABLE part_brands ADD COLUMN deleted_at timestamp NULL;
ALTER TABLE suppliers ADD COLUMN deleted_at timestamp NULL;
ALTER TABLE products ADD COLUMN deleted_at timestamp NULL;
