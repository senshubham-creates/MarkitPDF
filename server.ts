import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getDocumentState, saveDocumentState } from './src/db/users.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '15mb' }));

  // Health check route
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // User Profile Sync on sign-in
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const profile = await getOrCreateUser({
        uid: user.uid,
        email: user.email || '',
        displayName: user.name || null,
        photoUrl: user.picture || null,
      });
      res.json({ success: true, profile });
    } catch (error: any) {
      console.error('Failed to sync auth user:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  // Cloud Pull: Retrieve document state for current user
  app.get('/api/sync/doc/:docId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.uid;
      const docId = req.params.docId;
      const state = await getDocumentState(userId, docId);
      res.json({ success: true, state });
    } catch (error: any) {
      console.error('Failed to load document state:', error);
      res.status(500).json({ error: error.message || 'Failed to load document state' });
    }
  });

  // Cloud Push: Save document state for current user
  app.post('/api/sync/doc/:docId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.uid;
      const docId = req.params.docId;
      const { excerpts, comments, textBoxes, theme, currentPage } = req.body;

      const saved = await saveDocumentState({
        userId,
        documentId: docId,
        excerpts: typeof excerpts === 'string' ? excerpts : JSON.stringify(excerpts || []),
        comments: typeof comments === 'string' ? comments : JSON.stringify(comments || []),
        textBoxes: typeof textBoxes === 'string' ? textBoxes : JSON.stringify(textBoxes || []),
        theme: theme || 'windows-light',
        currentPage: currentPage || 1,
      });

      res.json({ success: true, saved });
    } catch (error: any) {
      console.error('Failed to save document state to Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to save document state' });
    }
  });

  // Mount Vite dev server or static files
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (dev mode: ${!isProd})`);
  });
}

createServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
