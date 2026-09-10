-- ─── 1. Tabla ────────────────────────────────────────────────────────────────
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
  `deleted_at` timestamp NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `announcements_id` PRIMARY KEY(`id`),
  KEY `announcements_window_idx` (`is_active`,`starts_at`,`ends_at`)
);--> statement-breakpoint

-- ─── 2. Módulo (lo que lee proxy.ts y el JWT del login) ──────────────────────
INSERT INTO `modules` (`key`, `label`) VALUES ('announcements', 'Anuncios')
ON DUPLICATE KEY UPDATE `label` = VALUES(`label`);--> statement-breakpoint

-- ─── 3. Permisos: superadmin todo, admin sin borrar ──────────────────────────
INSERT INTO `role_permissions` (`role_id`, `module_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT r.`id`, m.`id`, 1, 1, 1, CASE WHEN r.`name` = 'superadmin' THEN 1 ELSE 0 END
FROM `roles` r
CROSS JOIN `modules` m
WHERE m.`key` = 'announcements'
  AND r.`name` IN ('superadmin', 'admin')
ON DUPLICATE KEY UPDATE
  `can_view`   = VALUES(`can_view`),
  `can_create` = VALUES(`can_create`),
  `can_edit`   = VALUES(`can_edit`),
  `can_delete` = VALUES(`can_delete`);
