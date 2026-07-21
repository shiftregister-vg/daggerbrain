CREATE TABLE `official_compendium_item_versions` (
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`source_key` text NOT NULL,
	`item_version` integer DEFAULT 1 NOT NULL,
	`label` text NOT NULL,
	`changelog` text DEFAULT '' NOT NULL,
	`item` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`published_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`source_key`, `item_type`, `item_id`, `item_version`),
	FOREIGN KEY (`source_key`) REFERENCES `official_sources`(`source_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `official_compendium_item_versions` (
	`source_key`,
	`item_type`,
	`item_id`,
	`item_version`,
	`label`,
	`changelog`,
	`item`,
	`created_at`,
	`published_at`
)
SELECT
	`source_key`,
	`item_type`,
	`item_id`,
	`version`,
	'Version ' || `version`,
	'',
	`item`,
	`created_at`,
	`updated_at`
FROM `official_compendium_items`;
--> statement-breakpoint
DROP TABLE `official_compendium_items`;
--> statement-breakpoint
CREATE TABLE `official_compendium_items` (
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`source_key` text NOT NULL,
	`current_version` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`source_key`, `item_type`, `item_id`),
	FOREIGN KEY (`source_key`) REFERENCES `official_sources`(`source_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `official_compendium_items` (
	`source_key`,
	`item_type`,
	`item_id`,
	`current_version`,
	`created_at`,
	`updated_at`
)
SELECT
	`source_key`,
	`item_type`,
	`item_id`,
	max(`item_version`),
	min(`created_at`),
	max(`published_at`)
FROM `official_compendium_item_versions`
GROUP BY `source_key`, `item_type`, `item_id`;
--> statement-breakpoint
DROP TABLE `official_compendium_versions`;
--> statement-breakpoint
ALTER TABLE `official_sources` DROP COLUMN `current_version`;
--> statement-breakpoint
CREATE INDEX `official_compendium_items_source_item_type_idx` ON `official_compendium_items` (`source_key`,`item_type`);
--> statement-breakpoint
CREATE INDEX `official_compendium_item_versions_source_item_type_idx` ON `official_compendium_item_versions` (`source_key`,`item_type`);
--> statement-breakpoint
CREATE INDEX `official_compendium_item_versions_item_version_idx` ON `official_compendium_item_versions` (`source_key`,`item_type`,`item_id`,`item_version`);
