CREATE TABLE `system_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
INSERT INTO `system_settings` (`key`, `value`, `updated_at`)
VALUES (
	'operations',
	'{"maintenance_enabled":false,"maintenance_message":"Daggerlore is being upgraded!","invite_only_enabled":true,"contact_email":"scribe@daggerlore.com","community":{"articles_enabled":true,"changelog_enabled":true,"roadmap_enabled":true,"faq_enabled":true,"contact_enabled":true,"discord_enabled":true,"socials_enabled":true}}',
	unixepoch() * 1000
)
ON CONFLICT(`key`) DO NOTHING;
