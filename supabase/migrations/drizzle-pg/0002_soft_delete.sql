ALTER TABLE "categories" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "part_brands" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "vehicle_brands" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "vehicle_models" ADD COLUMN "deleted_at" timestamp;
