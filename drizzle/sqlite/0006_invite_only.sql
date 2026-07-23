ALTER TABLE `users` ADD COLUMN `invite_accepted_at` integer;
--> statement-breakpoint
UPDATE `users` SET `invite_accepted_at` = unixepoch() * 1000 WHERE `invite_accepted_at` IS NULL;
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`invite_type` text NOT NULL,
	`email` text,
	`invite_code` text NOT NULL,
	`campaign_id` text,
	`created_by_user_id` text,
	`accepted_by_user_id` text,
	`accepted_at` integer,
	`revoked_at` integer,
	`expires_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`accepted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_invite_code_idx` ON `invitations` (`invite_code`);
--> statement-breakpoint
CREATE INDEX `invitations_email_idx` ON `invitations` (`email`);
--> statement-breakpoint
CREATE INDEX `invitations_campaign_id_idx` ON `invitations` (`campaign_id`);
--> statement-breakpoint
CREATE INDEX `invitations_accepted_by_user_id_idx` ON `invitations` (`accepted_by_user_id`);
