CREATE TABLE `url_mappings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`target_url` text NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	`last_visited_at` text,
	`disabled` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `url_mappings_slug_unique` ON `url_mappings` (`slug`);