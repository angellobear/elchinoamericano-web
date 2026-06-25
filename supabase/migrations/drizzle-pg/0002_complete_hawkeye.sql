ALTER TABLE "categories" ADD COLUMN "image_public_id" varchar(200);--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "part_brands" ADD COLUMN "logo_public_id" varchar(200);--> statement-breakpoint
ALTER TABLE "part_brands" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "vehicle_brands" ADD COLUMN "logo_public_id" varchar(200);--> statement-breakpoint
ALTER TABLE "vehicle_brands" ADD COLUMN "is_visible_on_web" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vehicle_brands" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "vehicle_models" ADD COLUMN "updated_at" timestamp DEFAULT now();