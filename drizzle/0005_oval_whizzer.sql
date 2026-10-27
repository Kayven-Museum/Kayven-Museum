ALTER TABLE `documents` ADD `deleted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `manuscripts` ADD `deleted` integer DEFAULT 0 NOT NULL;