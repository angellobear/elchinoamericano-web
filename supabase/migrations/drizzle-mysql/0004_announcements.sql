CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(150),
  `description` text,
  `image_url` varchar(500) NOT NULL,
  `image_public_id` varchar(200),
  `link_url` varchar(500),
  `starts_at` date NOT NULL,
  `ends_at` date NOT NULL,
  `is_active` boolean DEFAULT true,
  `deleted_at` timestamp,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);--> statement-breakpoint
CREATE INDEX `announcements_window_idx` ON `announcements` (`is_active`,`starts_at`,`ends_at`);
