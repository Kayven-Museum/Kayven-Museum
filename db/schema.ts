import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const manuscripts = sqliteTable('manuscripts', {
  deleted: integer('deleted').notNull().default(0),
  id: text('id').primaryKey(),
  draft: text('draft').notNull(),
  published: text('published'),
  revision: integer('revision').notNull().default(1),
  updatedAt: text('updated_at').notNull(),
  publishedAt: text('published_at'),
  updatedBy: text('updated_by').notNull(),
});

export const documents = sqliteTable('documents', {
 deleted: integer('deleted').notNull().default(0),
 id: text('id').primaryKey(), draft: text('draft').notNull(), published: text('published'),
 revision: integer('revision').notNull().default(1), updatedAt: text('updated_at').notNull(),
 publishedAt: text('published_at'), updatedBy: text('updated_by').notNull(),
});

export const imageAssets=sqliteTable('image_assets',{
 id:text('id').primaryKey(),mime:text('mime').notNull(),size:integer('size').notNull(),
 createdAt:text('created_at').notNull(),createdBy:text('created_by').notNull(),
});

export const comments=sqliteTable('comments',{
 articleId:text('article_id').notNull().default(''),
 id:text('id').primaryKey(),name:text('name').notNull(),body:text('body').notNull(),
 createdAt:text('created_at').notNull(),visitorHash:text('visitor_hash').notNull(),
 hidden:integer('hidden').notNull().default(0),reply:text('reply').notNull().default(''),
 repliedAt:text('replied_at'),revision:integer('revision').notNull().default(1),
},t=>[index('comments_article_date').on(t.articleId,t.hidden,t.createdAt),index('comments_public_date').on(t.hidden,t.createdAt),index('comments_visitor_date').on(t.visitorHash,t.createdAt)]);
