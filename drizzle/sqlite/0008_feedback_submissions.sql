CREATE TABLE `feedback_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text,
	`email` text,
	`category` text DEFAULT 'general' NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`page_url` text,
	`user_agent` text,
	`status` text DEFAULT 'new' NOT NULL,
	`admin_notes` text,
	`resolved_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `feedback_submissions_user_id_idx` ON `feedback_submissions` (`user_id`);
--> statement-breakpoint
CREATE INDEX `feedback_submissions_status_idx` ON `feedback_submissions` (`status`);
--> statement-breakpoint
CREATE INDEX `feedback_submissions_created_at_idx` ON `feedback_submissions` (`created_at`);
