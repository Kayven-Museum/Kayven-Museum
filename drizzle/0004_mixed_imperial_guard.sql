ALTER TABLE `comments` ADD `article_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `comments_article_date` ON `comments` (`article_id`,`hidden`,`created_at`);