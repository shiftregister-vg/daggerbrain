ALTER TABLE `users` ADD COLUMN `disabled_at` integer;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `disabled_reason` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `banned_at` integer;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `ban_reason` text;
