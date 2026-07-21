CREATE TABLE `official_sources` (
	`source_key` text PRIMARY KEY NOT NULL,
	`metadata` text NOT NULL,
	`current_version` integer DEFAULT 1 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `official_compendium_versions` (
	`source_key` text NOT NULL,
	`version` integer NOT NULL,
	`label` text NOT NULL,
	`changelog` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`published_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`source_key`, `version`),
	FOREIGN KEY (`source_key`) REFERENCES `official_sources`(`source_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `official_compendium_items` (
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`source_key` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`item` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`source_key`, `version`, `item_type`, `item_id`),
	FOREIGN KEY (`source_key`) REFERENCES `official_sources`(`source_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `official_compendium_items_source_version_idx` ON `official_compendium_items` (`source_key`,`version`);
--> statement-breakpoint
CREATE INDEX `official_compendium_items_item_type_idx` ON `official_compendium_items` (`item_type`);
