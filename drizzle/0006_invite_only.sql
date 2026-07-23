ALTER TABLE "users" ADD COLUMN "invite_accepted_at" timestamp;
--> statement-breakpoint
UPDATE "users" SET "invite_accepted_at" = now() WHERE "invite_accepted_at" IS NULL;
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_type" text NOT NULL,
	"email" text,
	"invite_code" text NOT NULL,
	"campaign_id" uuid,
	"created_by_user_id" uuid,
	"accepted_by_user_id" uuid,
	"accepted_at" timestamp,
	"revoked_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_accepted_by_user_id_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");
--> statement-breakpoint
CREATE INDEX "invitations_invite_code_idx" ON "invitations" USING btree ("invite_code");
--> statement-breakpoint
CREATE INDEX "invitations_campaign_id_idx" ON "invitations" USING btree ("campaign_id");
--> statement-breakpoint
CREATE INDEX "invitations_accepted_by_user_id_idx" ON "invitations" USING btree ("accepted_by_user_id");
