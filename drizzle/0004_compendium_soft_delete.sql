ALTER TABLE "official_sources" ADD COLUMN "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "official_compendium_items" ADD COLUMN "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "official_compendium_item_versions" ADD COLUMN "deleted_at" timestamp;
