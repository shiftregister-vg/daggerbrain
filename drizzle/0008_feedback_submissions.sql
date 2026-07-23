CREATE TABLE "feedback_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text,
	"email" text,
	"category" text DEFAULT 'general' NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"page_url" text,
	"user_agent" text,
	"status" text DEFAULT 'new' NOT NULL,
	"admin_notes" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "feedback_submissions_user_id_idx" ON "feedback_submissions" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "feedback_submissions_status_idx" ON "feedback_submissions" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "feedback_submissions_created_at_idx" ON "feedback_submissions" USING btree ("created_at");
