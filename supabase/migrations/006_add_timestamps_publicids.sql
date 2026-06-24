-- Add updatedAt and Cloudinary publicId columns added in session Jun-23

-- vehicle_brands
ALTER TABLE "vehicle_brands"
  ADD COLUMN IF NOT EXISTS "logo_public_id" varchar(200),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

-- vehicle_models
ALTER TABLE "vehicle_models"
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

-- categories
ALTER TABLE "categories"
  ADD COLUMN IF NOT EXISTS "image_public_id" varchar(200),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

-- part_brands
ALTER TABLE "part_brands"
  ADD COLUMN IF NOT EXISTS "logo_public_id" varchar(200),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

-- suppliers
ALTER TABLE "suppliers"
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
