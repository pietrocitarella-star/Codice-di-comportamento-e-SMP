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
const SESSION_STATE_FILE = path.join(DATA_DIR, 'session_state.json');

interface Submission {
  id: string;
  caseId: string;
  choice: 'Verde' | 'Rosso' | 'Giallo';
  sessionId: string;
  timestamp: number;
}

let submissions: Submission[] = [];
let activeSessionId: string = '27_ottobre_mattina';
let isSessionOpen: boolean = true;
let openSessions: Record<string, boolean> = {
  '27_ottobre_mattina': true,
  '27_ottobre_pomeriggio': false,
  '28_ottobre_mattina': false,
  '28_ottobre_pomeriggio': false,
};

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DATA_FILE)) {
    submissions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
  if (fs.existsSync(SESSION_STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(SESSION_STATE_FILE, 'utf-8'));
    if (state.activeSessionId) activeSessionId = state.activeSessionId;
    if (typeof state.isSessionOpen === 'boolean') isSessionOpen = state.isSessionOpen;
    if (state.openSessions && typeof state.openSessions === 'object') {
      openSessions = { ...openSessions, ...state.openSessions };
    } else {
      // Migrate or initialize openSessions
      openSessions[activeSessionId] = isSessionOpen;
    }
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

function persistSessionState() {
  try {
    fs.writeFileSync(
      SESSION_STATE_FILE,
      JSON.stringify({ activeSessionId, isSessionOpen, openSessions }, null, 2)
    );
  } catch (e) {
    console.warn('Could not persist session state to disk:', e);
  }
}

function isClassroomSessionOpen(sessionId: string): boolean {
  if (sessionId in openSessions) {
    return Boolean(openSessions[sessionId]);
  }
  return isSessionOpen;
}

// API Routes
app.get('/api/responses', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const session = req.query.session as string | undefined;
  if (session && session !== 'all') {
    res.json({
      activeSessionId,
      isSessionOpen,
      openSessions,
      submissions: submissions.filter((s) => s.sessionId === session),
    });
  } else {
    res.json({
      activeSessionId,
      isSessionOpen,
      openSessions,
      submissions,
    });
  }
});

// Single answer submission
app.post('/api/responses', (req, res) => {
  const { caseId, choice, sessionId } = req.body;
  if (!caseId || !choice) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const targetSession = sessionId || activeSessionId;

  // Gating check: participants can only submit if target lab session is opened by teacher
  if (!isClassroomSessionOpen(targetSession)) {
    return res.status(403).json({
      error: `Laboratorio attualmente chiuso per la sessione selezionata (${targetSession}). Il formatore non ha ancora aperto la sessione d'aula.`,
    });
  }

  const newSub: Submission = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    caseId,
    choice,
    sessionId: targetSession,
    timestamp: Date.now(),
  };

  submissions.push(newSub);
  persistSubmissions();
  res.status(201).json({ success: true, submission: newSub });
});

// Atomic batch submissions (when learner clicks "Concludi e invia risposte")
app.post('/api/responses/batch', (req, res) => {
  const { answers, sessionId } = req.body;
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid answers object' });
  }

  const targetSession = sessionId || activeSessionId;

  // Gating check
  if (!isClassroomSessionOpen(targetSession)) {
    return res.status(403).json({
      error: `Laboratorio chiuso per l'aula ${targetSession}.`,
    });
  }

  const newSubs: Submission[] = [];
  const now = Date.now();

  Object.entries(answers).forEach(([caseId, choice], idx) => {
    if (choice === 'Verde' || choice === 'Rosso' || choice === 'Giallo') {
      newSubs.push({
        id: `${now}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        caseId,
        choice,
        sessionId: targetSession,
        timestamp: now,
      });
    }
  });

  submissions.push(...newSubs);
  persistSubmissions();
  res.status(201).json({ success: true, count: newSubs.length, submissions: newSubs });
});

app.post('/api/responses/active-session', (req, res) => {
  const { sessionId, isOpen, openSessions: customOpenSessions, allOpen } = req.body;

  if (sessionId) {
    activeSessionId = sessionId;
  }

  if (typeof isOpen === 'boolean') {
    isSessionOpen = isOpen;
    if (sessionId) {
      openSessions[sessionId] = isOpen;
    }
  }

  if (typeof allOpen === 'boolean') {
    isSessionOpen = allOpen;
    Object.keys(openSessions).forEach((k) => {
      openSessions[k] = allOpen;
    });
  }

  if (customOpenSessions && typeof customOpenSessions === 'object') {
    openSessions = { ...openSessions, ...customOpenSessions };
  }

  persistSessionState();
  res.json({ success: true, activeSessionId, isSessionOpen, openSessions });
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

  // Remove previous simulated seed answers for this session first to prevent duplicate stacking
  submissions = submissions.filter((s) => !s.id.startsWith(`seed-${sessionId}-`));

  const cases = [
    { id: 'case-1', dist: 85 }, // Verde
    { id: 'case-2', dist: 90 }, // Verde
    { id: 'case-3', dist: 25 }, // Rosso
    { id: 'case-4', dist: 20 }, // Rosso
    { id: 'case-5', dist: 22 }, // Rosso
    { id: 'case-6', dist: 8 },  // Rosso
    { id: 'case-7', dist: 5 },  // Rosso
    { id: 'case-8', dist: 12 }, // Rosso
  ];

  cases.forEach((c) => {
    for (let i = 0; i < count; i++) {
      const rand = Math.random() * 100;
      const choice: 'Verde' | 'Rosso' = rand < c.dist ? 'Verde' : 'Rosso';

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
