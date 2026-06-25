ALTER TABLE `categories` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `part_brands` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `products` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `vehicle_brands` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `vehicle_models` ADD `deleted_at` timestamp;