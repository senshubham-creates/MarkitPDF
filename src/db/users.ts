import { db } from './index.ts';
import { users, documentStates } from './schema.ts';
import { eq, and } from 'drizzle-orm';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string | null;
  photoUrl?: string | null;
}

export async function getOrCreateUser(profile: UserProfile) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName || null,
        photoUrl: profile.photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: profile.email,
          displayName: profile.displayName || null,
          photoUrl: profile.photoUrl || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to sync user to database:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getDocumentState(userId: string, documentId: string) {
  try {
    const rows = await db
      .select()
      .from(documentStates)
      .where(and(eq(documentStates.userId, userId), eq(documentStates.documentId, documentId)))
      .limit(1);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Failed to fetch document state:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export interface SaveDocumentStatePayload {
  userId: string;
  documentId: string;
  excerpts: string;
  comments: string;
  textBoxes: string;
  theme?: string;
  currentPage?: number;
}

export async function saveDocumentState(payload: SaveDocumentStatePayload) {
  try {
    const result = await db
      .insert(documentStates)
      .values({
        userId: payload.userId,
        documentId: payload.documentId,
        excerpts: payload.excerpts,
        comments: payload.comments,
        textBoxes: payload.textBoxes,
        theme: payload.theme || 'windows-light',
        currentPage: payload.currentPage || 1,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [documentStates.userId, documentStates.documentId],
        set: {
          excerpts: payload.excerpts,
          comments: payload.comments,
          textBoxes: payload.textBoxes,
          theme: payload.theme || 'windows-light',
          currentPage: payload.currentPage || 1,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to save document state:', error);
    throw new Error('Database save failed', { cause: error });
  }
}
