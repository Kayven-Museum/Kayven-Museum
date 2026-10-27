CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`hidden` integer DEFAULT 0 NOT NULL,
	`reply` text DEFAULT '' NOT NULL,
	`replied_at` text,
	`revision` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `comments_public_date` ON `comments` (`hidden`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_visitor_date` ON `comments` (`visitor_hash`,`created_at`);