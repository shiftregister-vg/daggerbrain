CREATE TABLE "official_sources" (
	"source_key" text PRIMARY KEY NOT NULL,
	"metadata" jsonb NOT NULL,
	"current_version" integer DEFAULT 1 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "official_compendium_versions" (
	"source_key" text NOT NULL,
	"version" integer NOT NULL,
	"label" text NOT NULL,
	"changelog" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "official_compendium_versions_source_key_version_pk" PRIMARY KEY("source_key","version")
);
--> statement-breakpoint
CREATE TABLE "official_compendium_items" (
	"item_type" text NOT NULL,
	"item_id" text NOT NULL,
	"source_key" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"item" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "official_compendium_items_source_key_version_item_type_item_id_pk" PRIMARY KEY("source_key","version","item_type","item_id")
);
--> statement-breakpoint
ALTER TABLE "official_compendium_versions" ADD CONSTRAINT "official_compendium_versions_source_key_official_sources_source_key_fk" FOREIGN KEY ("source_key") REFERENCES "public"."official_sources"("source_key") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "official_compendium_items" ADD CONSTRAINT "official_compendium_items_source_key_official_sources_source_key_fk" FOREIGN KEY ("source_key") REFERENCES "public"."official_sources"("source_key") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "official_compendium_items_source_version_idx" ON "official_compendium_items" USING btree ("source_key","version");
--> statement-breakpoint
CREATE INDEX "official_compendium_items_item_type_idx" ON "official_compendium_items" USING btree ("item_type");
