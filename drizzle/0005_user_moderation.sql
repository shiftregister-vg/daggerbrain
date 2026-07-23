ALTER TABLE "users" ADD COLUMN "disabled_at" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "disabled_reason" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_at" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_reason" text;
