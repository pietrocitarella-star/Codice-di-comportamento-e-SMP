import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory submissions store with persistence to data/submissions.json
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

interface Submission {
  id: string;
  caseId: string;
  choice: 'Verde' | 'Giallo' | 'Rosso';
  sessionId: string;
  timestamp: number;
}

let submissions: Submission[] = [];
let activeSessionId = '27_ottobre_mattina';

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DATA_FILE)) {
    submissions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
} catch (e) {
  console.warn('File initialization warning:', e);
}

function persistSubmissions() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
  } catch (e) {
    console.warn('Could not persist submissions to disk:', e);
  }
}

// API Routes
app.get('/api/responses', (req, res) => {
  const session = req.query.session as string | undefined;
  if (session && session !== 'all') {
    res.json({
      activeSessionId,
      submissions: submissions.filter((s) => s.sessionId === session),
    });
  } else {
    res.json({
      activeSessionId,
      submissions,
    });
  }
});

app.post('/api/responses', (req, res) => {
  const { caseId, choice, sessionId } = req.body;
  if (!caseId || !choice) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const newSub: Submission = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    caseId,
    choice,
    sessionId: sessionId || activeSessionId,
    timestamp: Date.now(),
  };

  submissions.push(newSub);
  persistSubmissions();
  res.status(201).json({ success: true, submission: newSub });
});

app.post('/api/responses/active-session', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    activeSessionId = sessionId;
  }
  res.json({ success: true, activeSessionId });
});

app.post('/api/responses/reset', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && sessionId !== 'all') {
    submissions = submissions.filter((s) => s.sessionId !== sessionId);
  } else {
    submissions = [];
  }
  persistSubmissions();
  res.json({ success: true, remaining: submissions.length });
});

// Seed classroom endpoint
app.post('/api/responses/seed', (req, res) => {
  const { sessionId = '27_ottobre_mattina', count = 26 } = req.body;
  const cases = [
    { id: 'case-1', dist: [70, 20, 10] },
    { id: 'case-2', dist: [85, 10, 5] },
    { id: 'case-3', dist: [25, 45, 30] },
    { id: 'case-4', dist: [15, 60, 25] },
    { id: 'case-5', dist: [20, 55, 25] },
    { id: 'case-6', dist: [5, 15, 80] },
    { id: 'case-7', dist: [5, 10, 85] },
    { id: 'case-8', dist: [10, 25, 65] },
  ];

  cases.forEach((c) => {
    for (let i = 0; i < count; i++) {
      const rand = Math.random() * 100;
      let choice: 'Verde' | 'Giallo' | 'Rosso' = 'Verde';
      if (rand < c.dist[0]) choice = 'Verde';
      else if (rand < c.dist[0] + c.dist[1]) choice = 'Giallo';
      else choice = 'Rosso';

      submissions.push({
        id: `seed-${sessionId}-${c.id}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        caseId: c.id,
        choice,
        sessionId,
        timestamp: Date.now() - Math.floor(Math.random() * 3600000),
      });
    }
  });

  persistSubmissions();
  res.json({ success: true, seededCount: cases.length * count });
});

// Vite Middleware or Static Servings
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
