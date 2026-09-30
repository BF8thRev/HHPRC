CREATE TABLE `hours_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`season_name` text NOT NULL,
	`position` integer NOT NULL,
	`label` text NOT NULL,
	`starts_on` text NOT NULL,
	`ends_on` text NOT NULL,
	`days_json` text NOT NULL,
	FOREIGN KEY (`season_name`) REFERENCES `seasons`(`name`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `seasons` (
	`name` text PRIMARY KEY NOT NULL,
	`opening_day` text NOT NULL,
	`opening_time` text NOT NULL,
	`closing_day` text NOT NULL,
	`dues_cents` integer NOT NULL,
	`dues_due_on` text NOT NULL,
	`late_fee_cents` integer NOT NULL,
	`statements_mailed` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);
