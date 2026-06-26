CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` char(36),
	`action` varchar(50) NOT NULL,
	`table_name` varchar(100) NOT NULL,
	`record_id` varchar(50),
	`old_values` text,
	`new_values` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parent_id` int,
	`key` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`image_url` varchar(500),
	`image_public_id` varchar(200),
	`sort_order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(50) NOT NULL,
	`label` varchar(100) NOT NULL,
	CONSTRAINT `modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `modules_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `part_brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`logo_url` varchar(500),
	`logo_public_id` varchar(200),
	`origin_country` varchar(100),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `part_brands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_alternate_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int,
	`code` varchar(100) NOT NULL,
	`source` varchar(200),
	CONSTRAINT `product_alternate_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_compatibilities` (
	`product_id` int NOT NULL,
	`vehicle_model_id` int NOT NULL,
	`year_start` int,
	`year_end` int,
	`notes` varchar(255),
	CONSTRAINT `product_compatibilities_product_id_vehicle_model_id_pk` PRIMARY KEY(`product_id`,`vehicle_model_id`)
);
--> statement-breakpoint
CREATE TABLE `product_equivalencies` (
	`product_id` int NOT NULL,
	`equivalent_id` int NOT NULL,
	CONSTRAINT `product_equivalencies_product_id_equivalent_id_pk` PRIMARY KEY(`product_id`,`equivalent_id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int,
	`url` varchar(500) NOT NULL,
	`cloudinary_public_id` varchar(200),
	`alt_text` varchar(255),
	`is_primary` boolean DEFAULT false,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_specs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int,
	`label` varchar(100) NOT NULL,
	`value` varchar(255) NOT NULL,
	`sort_order` int DEFAULT 0,
	CONSTRAINT `product_specs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20),
	`sku` varchar(100),
	`title` varchar(255) NOT NULL,
	`short_title` varchar(100),
	`description` text,
	`short_description` varchar(500),
	`price` decimal(10,2) NOT NULL,
	`cost_price` decimal(10,2),
	`discount_pct` decimal(5,2),
	`discount_until` timestamp,
	`stock` int NOT NULL DEFAULT 0,
	`min_stock_alert` int DEFAULT 5,
	`category_id` int,
	`part_brand_id` int,
	`supplier_id` int,
	`type` varchar(20) NOT NULL,
	`condition` varchar(20) DEFAULT 'new',
	`weight_kg` decimal(8,3),
	`slug` varchar(255) NOT NULL,
	`meta_title` varchar(255),
	`meta_description` varchar(500),
	`is_featured` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_code_unique` UNIQUE(`code`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` int NOT NULL,
	`module_id` int NOT NULL,
	`can_view` boolean DEFAULT false,
	`can_create` boolean DEFAULT false,
	`can_edit` boolean DEFAULT false,
	`can_delete` boolean DEFAULT false,
	CONSTRAINT `role_permissions_role_id_module_id_pk` PRIMARY KEY(`role_id`,`module_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int,
	`quantity` int NOT NULL,
	`movement_type` varchar(20) NOT NULL,
	`reason` text,
	`user_id` char(36),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`contact_name` varchar(100),
	`email` varchar(255),
	`phone` varchar(30),
	`address` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` text NOT NULL,
	`full_name` varchar(100),
	`role_id` int,
	`is_active` boolean DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`origin` varchar(20) NOT NULL,
	`logo_url` varchar(500),
	`logo_public_id` varchar(200),
	`sort_order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`is_visible_on_web` boolean DEFAULT false,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `vehicle_brands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brand_id` int,
	`name` varchar(150) NOT NULL,
	`displacement` varchar(20),
	`fuel_type` varchar(20),
	`transmission` varchar(20),
	`body_type` varchar(30),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `vehicle_models_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `product_alternate_codes` ADD CONSTRAINT `product_alternate_codes_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_compatibilities` ADD CONSTRAINT `product_compatibilities_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_compatibilities` ADD CONSTRAINT `product_compatibilities_vehicle_model_id_vehicle_models_id_fk` FOREIGN KEY (`vehicle_model_id`) REFERENCES `vehicle_models`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_equivalencies` ADD CONSTRAINT `product_equivalencies_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_equivalencies` ADD CONSTRAINT `product_equivalencies_equivalent_id_products_id_fk` FOREIGN KEY (`equivalent_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_part_brand_id_part_brands_id_fk` FOREIGN KEY (`part_brand_id`) REFERENCES `part_brands`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_supplier_id_suppliers_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_module_id_modules_id_fk` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_models` ADD CONSTRAINT `vehicle_models_brand_id_vehicle_brands_id_fk` FOREIGN KEY (`brand_id`) REFERENCES `vehicle_brands`(`id`) ON DELETE no action ON UPDATE no action;