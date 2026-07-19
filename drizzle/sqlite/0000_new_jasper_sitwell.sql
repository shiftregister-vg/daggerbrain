CREATE TABLE `accounts` (
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `accounts_user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `authenticators` (
	`credential_id` text NOT NULL,
	`user_id` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`credential_public_key` text NOT NULL,
	`counter` integer NOT NULL,
	`credential_device_type` text NOT NULL,
	`credential_backed_up` integer NOT NULL,
	`transports` text,
	PRIMARY KEY(`user_id`, `credential_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `authenticators_credential_id_unique` ON `authenticators` (`credential_id`);--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`invite_code` text NOT NULL,
	`campaign` text NOT NULL,
	`members` text NOT NULL,
	`characters` text NOT NULL,
	`legacy_import_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `campaigns_invite_code_unique` ON `campaigns` (`invite_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `campaigns_legacy_import_id_unique` ON `campaigns` (`legacy_import_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `campaigns_invite_code_idx` ON `campaigns` (`invite_code`);--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`campaign_id` text,
	`character` text NOT NULL,
	`legacy_import_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `characters_legacy_import_id_unique` ON `characters` (`legacy_import_id`);--> statement-breakpoint
CREATE INDEX `characters_owner_user_id_idx` ON `characters` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `characters_campaign_id_idx` ON `characters` (`campaign_id`);--> statement-breakpoint
CREATE TABLE `dice_history` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`history` text NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `dice_history_campaign_id_idx` ON `dice_history` (`campaign_id`);--> statement-breakpoint
CREATE TABLE `encounters` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`encounter` text NOT NULL,
	`legacy_import_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `encounters_legacy_import_id_unique` ON `encounters` (`legacy_import_id`);--> statement-breakpoint
CREATE INDEX `encounters_owner_user_id_idx` ON `encounters` (`owner_user_id`);--> statement-breakpoint
CREATE TABLE `homebrew_items` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`type` text NOT NULL,
	`item` text NOT NULL,
	`legacy_import_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `homebrew_items_legacy_import_id_unique` ON `homebrew_items` (`legacy_import_id`);--> statement-breakpoint
CREATE INDEX `homebrew_items_owner_user_id_idx` ON `homebrew_items` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `homebrew_items_owner_user_id_type_idx` ON `homebrew_items` (`owner_user_id`,`type`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `stream_overlays` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`token` text NOT NULL,
	`enabled` integer NOT NULL,
	`modules` text NOT NULL,
	`settings` text NOT NULL,
	`layout` text NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stream_overlays_token_unique` ON `stream_overlays` (`token`);--> statement-breakpoint
CREATE INDEX `stream_overlays_campaign_id_idx` ON `stream_overlays` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `stream_overlays_token_idx` ON `stream_overlays` (`token`);--> statement-breakpoint
CREATE TABLE `user_unlocked_sources` (
	`user_id` text PRIMARY KEY NOT NULL,
	`unlocked_source_keys` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`email_verified` integer,
	`image` text,
	`legacy_clerk_id` text,
	`is_admin` integer DEFAULT false NOT NULL,
	`homebrew_vault` text DEFAULT '{"primary_weapons":[],"secondary_weapons":[],"armor":[],"loot":[],"consumables":[],"beastforms":[],"classes":[],"subclasses":[],"domains":[],"domain_cards":[],"ancestry_cards":[],"community_cards":[],"transformation_cards":[],"adversaries":[],"environments":[]}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_legacy_clerk_id_unique` ON `users` (`legacy_clerk_id`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_legacy_clerk_id_idx` ON `users` (`legacy_clerk_id`);--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
