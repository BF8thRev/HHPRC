CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`message` text NOT NULL,
	`name` text,
	`email` text,
	`created_at` integer NOT NULL,
	`handled_at` integer
);
--> statement-breakpoint
CREATE TABLE `site_content` (
	`key` text PRIMARY KEY NOT NULL,
	`json` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `email_signups` ADD `synced_at` integer;