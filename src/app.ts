import express from 'express';
import { ItemStore, validateCreateItem } from './store.ts';

export function createApp(store = new ItemStore()) {
  const app = express();
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get('/items', (_req, res) => {
    res.status(200).json({ items: store.list() });
  });

  app.post('/items', (req, res) => {
    const parsed = validateCreateItem(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const item = store.create(parsed.value);
    res.status(201).json({ item });
  });

  return app;
}
