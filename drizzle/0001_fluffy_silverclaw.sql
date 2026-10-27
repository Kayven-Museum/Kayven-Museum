CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`draft` text NOT NULL,
	`published` text,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text,
	`updated_by` text NOT NULL
);
