import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { pool, initDb } from './db.js';

const app = express();
app.use(cors()); // allow the GitHub Pages frontend (any origin) to call this API
app.use(express.json({ limit: '15mb' })); // annotations can include base64 design images

// ── health ──
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'down', error: e.message });
  }
});

// ── pull: full data document for a sync key ──
app.get('/api/data/:user', async (req, res) => {
  const user = (req.params.user || '').trim();
  if (!user) return res.status(400).json({ error: 'missing user' });
  try {
    const { rows } = await pool.query(
      'SELECT data, updated_at FROM user_data WHERE user_id = $1',
      [user]
    );
    if (!rows.length) return res.json({ data: null, updated_at: null });
    res.json({ data: rows[0].data, updated_at: rows[0].updated_at });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── push: upsert the full data document (last-write-wins) ──
app.put('/api/data/:user', async (req, res) => {
  const user = (req.params.user || '').trim();
  if (!user) return res.status(400).json({ error: 'missing user' });
  const data = req.body && req.body.data;
  if (typeof data !== 'object' || data === null) {
    return res.status(400).json({ error: 'body must be { data: {...} }' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO user_data (user_id, data, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (user_id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = now()
       RETURNING updated_at`,
      [user, data]
    );
    res.json({ ok: true, updated_at: rows[0].updated_at });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 4000;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`✓ Sync API listening on :${PORT}`));
  })
  .catch((e) => {
    console.error('✗ DB init failed:', e.message);
    // Still start the server so /api/health reports the DB problem clearly.
    app.listen(PORT, () => console.log(`⚠ Sync API on :${PORT} (DB not ready)`));
  });
