ALTER TABLE `official_sources` ADD COLUMN `deleted_at` integer;
--> statement-breakpoint
ALTER TABLE `official_compendium_items` ADD COLUMN `deleted_at` integer;
--> statement-breakpoint
ALTER TABLE `official_compendium_item_versions` ADD COLUMN `deleted_at` integer;
