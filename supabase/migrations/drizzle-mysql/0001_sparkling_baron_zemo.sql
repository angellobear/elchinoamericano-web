ALTER TABLE `categories` ADD `image_public_id` varchar(200);--> statement-breakpoint
ALTER TABLE `categories` ADD `updated_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `part_brands` ADD `logo_public_id` varchar(200);--> statement-breakpoint
ALTER TABLE `part_brands` ADD `updated_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `suppliers` ADD `updated_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `vehicle_brands` ADD `logo_public_id` varchar(200);--> statement-breakpoint
ALTER TABLE `vehicle_brands` ADD `updated_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `vehicle_models` ADD `updated_at` timestamp DEFAULT (now());