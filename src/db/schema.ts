import { pgTable, serial, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// Users table keyed by Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Document state table storing synced annotations, thoughts, and modifications per user and doc
export const documentStates = pgTable(
  'document_states',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    documentId: text('document_id').notNull(),
    excerpts: text('excerpts').notNull().default('[]'),
    comments: text('comments').notNull().default('[]'),
    textBoxes: text('text_boxes').notNull().default('[]'),
    theme: text('theme').default('windows-light'),
    currentPage: integer('current_page').default(1),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('user_doc_idx').on(table.userId, table.documentId)
  ]
);
