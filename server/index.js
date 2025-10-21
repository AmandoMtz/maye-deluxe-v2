import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL en .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const bootstrap = `
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  owner TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  owner TEXT NOT NULL,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  owner TEXT NOT NULL,
  title TEXT NOT NULL,
  items TEXT[],
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

(async () => {
  const c = await pool.connect();
  try { await c.query(bootstrap); } finally { c.release(); }
})().catch(e => { console.error("Init error:", e); process.exit(1); });

const q = (t,p=[]) => pool.query(t,p);

app.get('/health', async (_req,res)=>{
  try { const { rows } = await q('select 1 as ok'); res.json({ ok:true, db: rows[0].ok }); }
  catch(e){ res.status(500).json({ ok:false, error:e.message }); }
});

app.get('/api/notes', async (req,res)=>{
  const owner = req.query.owner ?? '';
  const { rows } = await q('SELECT * FROM notes WHERE owner=$1 ORDER BY created_at DESC',[owner]);
  res.json(rows);
});
app.post('/api/notes', async (req,res)=>{
  const { owner, title, content } = req.body;
  const { rows } = await q('INSERT INTO notes(owner,title,content) VALUES($1,$2,$3) RETURNING *',[owner,title,content]);
  res.json(rows[0]);
});

app.get('/api/plans', async (req,res)=>{
  const owner = req.query.owner ?? '';
  const { rows } = await q('SELECT * FROM plans WHERE owner=$1 ORDER BY created_at DESC',[owner]);
  res.json(rows);
});
app.post('/api/plans', async (req,res)=>{
  const { owner, title } = req.body;
  const { rows } = await q('INSERT INTO plans(owner,title) VALUES($1,$2) RETURNING *',[owner,title]);
  res.json(rows[0]);
});
app.patch('/api/plans/:id/toggle', async (req,res)=>{
  const id = +req.params.id;
  const { rows } = await q('UPDATE plans SET done = NOT done WHERE id=$1 RETURNING *',[id]);
  res.json(rows[0]);
});

app.get('/api/recipes', async (req,res)=>{
  const owner = req.query.owner ?? '';
  const { rows } = await q('SELECT * FROM recipes WHERE owner=$1 ORDER BY created_at DESC',[owner]);
  res.json(rows);
});
app.post('/api/recipes', async (req,res)=>{
  const { owner, title, items=[], instructions='' } = req.body;
  const { rows } = await q('INSERT INTO recipes(owner,title,items,instructions) VALUES($1,$2,$3,$4) RETURNING *',[owner,title,items,instructions]);
  res.json(rows[0]);
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
