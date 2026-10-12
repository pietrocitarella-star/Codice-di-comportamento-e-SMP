import { AnonymousSubmission, CaseDebriefStats, ClassroomSessionId, ClassroomSessionInfo } from '../types';
import { TRAFFIC_LIGHT_CASES } from '../data/courseData';

const STORAGE_KEY = 'pa_social_anonymous_submissions';
const ACTIVE_SESSION_KEY = 'pa_social_active_session';
const SESSION_OPEN_KEY = 'pa_social_session_open';
const OPEN_SESSIONS_KEY = 'pa_social_open_sessions';
const CHANNEL_NAME = 'pa_social_debriefing_channel';

export const CLASSROOM_SESSIONS: ClassroomSessionInfo[] = [
  {
    id: '27_ottobre_mattina',
    day: '27 Ottobre',
    slot: 'Mattina',
    time: '9.30 - 11.30',
    label: '27 Ottobre · Mattina (9.30 - 11.30)',
  },
  {
    id: '27_ottobre_pomeriggio',
    day: '27 Ottobre',
    slot: 'Pomeriggio',
    time: '12.00 - 14.00',
    label: '27 Ottobre · Pomeriggio (12.00 - 14.00)',
  },
  {
    id: '28_ottobre_mattina',
    day: '28 Ottobre',
    slot: 'Mattina',
    time: '9.30 - 11.30',
    label: '28 Ottobre · Mattina (9.30 - 11.30)',
  },
  {
    id: '28_ottobre_pomeriggio',
    day: '28 Ottobre',
    slot: 'Pomeriggio',
    time: '12.00 - 14.00',
    label: '28 Ottobre · Pomeriggio (12.00 - 14.00)',
  },
];

const DEBRIEF_METADATA: Record<
  string,
  {
    pitfall: string;
    question: string;
    legalFocus: string;
  }
> = {
  'case-1': {
    pitfall:
      'Alcuni dipendenti temono che qualsiasi critica tecnica sia vietata. In realtà, la critica costruttiva e misurata è tutelata dall\'art. 21 Cost.',
    question:
      '«Qual è il confine tra proporre un miglioramento procedurale e screditare pubblicamente la propria amministrazione?»',
    legalFocus: 'Canone di continenza verbale e pertinenza tecnica (Consiglio di Stato, n. 4112/2021).',
  },
  'case-2': {
    pitfall:
      'Spesso scambiata per propaganda. La condivisione di comunicazioni istituzionali ufficiali e link a bandi aperti è invece una buona prassi.',
    question:
      '«Perché condividere il link al sito istituzionale è sicuro, mentre commentarlo con opinioni soggettive può essere rischioso?»',
    legalFocus: 'Principio di trasparenza e sussidiarietà informativa nella comunicazione pubblica.',
  },
  'case-3': {
    pitfall:
      'Molti corsisti ritengono il "like" un\'azione passiva priva di rilievo. Per i giudici del lavoro equivale invece ad adesione consapevole e amplificazione.',
    question:
      '«Se mettete "Mi Piace" a un post di un cittadino che insulta un dirigente, siete responsabili anche voi?»',
    legalFocus:
      'Cassazione Civile Sez. Lavoro n. 27939/2021: il like o la reaction manifestano adesione al messaggio diffamatorio.',
  },
  'case-4': {
    pitfall:
      'Su LinkedIn o X si indica il nome dell\'ente nella bio ma non si inserisce il disclaimer, ingenerando confusione nell\'utenza.',
    question:
      '«Chi legge il vostro profilo deve capire all\'istante se parla il Comune o se parlate voi come privati cittadini: avete già inserito il disclaimer?»',
    legalFocus: 'Art. 11-bis comma 2, D.P.R. 62/2013 (introdotto dal D.P.R. 81/2023).',
  },
  'case-5': {
    pitfall:
      'Si crede che i gruppi WhatsApp siano sempre "privati". Nei gruppi con oltre 15-20 membri cade la garanzia di corrispondenza protetta.',
    question:
      '«Quante persone ci sono nel vostro gruppo WhatsApp di colleghi? Sapevate che oltre una certa soglia i messaggi possono costituire diffamazione?»',
    legalFocus:
      'Cassazione Penale n. 13653/2021: i gruppi numerosi perdono il carattere di riservatezza personale.',
  },
  'case-6': {
    pitfall:
      'Foto "innocenti" del compleanno o della scrivania piena che mostrano in secondo piano fascicoli con dati di cittadini o planimetrie.',
    question:
      '«Quando scattate una foto in ufficio, avete verificato cosa c\'è sullo schermo del PC o sui fogli stampati accanto al caffè?»',
    legalFocus: 'Violazione art. 5 GDPR (integrità e riservatezza) + violazione del segreto d\'ufficio.',
  },
  'case-7': {
    pitfall:
      'Sfogare la rabbia per il carico di lavoro nei commenti ai giornali locali. È l\'infrazione con il tasso più alto di procedimenti disciplinari.',
    question:
      '«Quali sono i canali corretti da attivare quando nell\'ente ci sono problemi organizzativi o carichi insostenibili?»',
    legalFocus:
      'Dovere di fedeltà e decoro (art. 54 Cost., art. 98 Cost., art. 13 D.P.R. 62/2013). Procedimento disciplinare e querela.',
  },
  'case-8': {
    pitfall:
      'Utilizzare lo stemma o il logo del Comune/ASL come immagine del proprio profilo personale o di un gruppo.',
    question:
      '«Chi ha l\'autorizzazione legale a usare i loghi istituzionali sui social network?»',
    legalFocus: 'Linee guida AGID e Codice di Comportamento: i loghi spettano solo ai canali ufficiali accreditati.',
  },
};

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    broadcastChannel = null;
  }
}

export const debriefingService = {
  // Check if a specific classroom session (or current active session) is open
  isSessionOpen(sessionId?: ClassroomSessionId): boolean {
    if (typeof window === 'undefined') return true;
    const targetSession = sessionId || this.getActiveSessionId();

    try {
      const storedMap = localStorage.getItem(OPEN_SESSIONS_KEY);
      if (storedMap) {
        const parsed = JSON.parse(storedMap);
        if (targetSession in parsed) {
          return Boolean(parsed[targetSession]);
        }
      }
    } catch {
      // fallback
    }

    const storedGlobal = localStorage.getItem(SESSION_OPEN_KEY);
    if (storedGlobal === null) return true;
    return storedGlobal === 'true';
  },

  // Get full dictionary of open state per classroom
  getOpenSessions(): Record<string, boolean> {
    const defaults: Record<string, boolean> = {
      '27_ottobre_mattina': true,
      '27_ottobre_pomeriggio': false,
      '28_ottobre_mattina': false,
      '28_ottobre_pomeriggio': false,
    };
    if (typeof window === 'undefined') return defaults;
    try {
      const stored = localStorage.getItem(OPEN_SESSIONS_KEY);
      if (stored) {
        return { ...defaults, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return defaults;
  },

  // Open or close classroom test for students (per session or globally)
  async setSessionOpen(isOpen: boolean, sessionId?: ClassroomSessionId): Promise<void> {
    if (typeof window === 'undefined') return;
    const targetSession = sessionId || this.getActiveSessionId();

    // Update local open map
    const openMap = this.getOpenSessions();
    openMap[targetSession] = isOpen;
    localStorage.setItem(OPEN_SESSIONS_KEY, JSON.stringify(openMap));
    localStorage.setItem(SESSION_OPEN_KEY, isOpen ? 'true' : 'false');
    if (sessionId) {
      localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
    }

    window.dispatchEvent(
      new CustomEvent('pa_debriefing_session_status', {
        detail: { isOpen, sessionId: targetSession, openSessions: openMap },
      })
    );
    window.dispatchEvent(new CustomEvent('pa_debriefing_session_change', { detail: targetSession }));
    broadcastChannel?.postMessage({
      type: 'SESSION_STATUS',
      isOpen,
      sessionId: targetSession,
      openSessions: openMap,
    });

    // Sync active session and open state with server
    try {
      const res = await fetch('/api/responses/active-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: targetSession,
          isOpen,
          openSessions: openMap,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.openSessions) {
          localStorage.setItem(OPEN_SESSIONS_KEY, JSON.stringify(data.openSessions));
        }
      }
    } catch {
      // offline fallback
    }
  },

  // Open or close all 4 sessions simultaneously
  async setAllSessionsOpen(allOpen: boolean): Promise<void> {
    if (typeof window === 'undefined') return;
    const openMap: Record<string, boolean> = {
      '27_ottobre_mattina': allOpen,
      '27_ottobre_pomeriggio': allOpen,
      '28_ottobre_mattina': allOpen,
      '28_ottobre_pomeriggio': allOpen,
    };
    localStorage.setItem(OPEN_SESSIONS_KEY, JSON.stringify(openMap));
    localStorage.setItem(SESSION_OPEN_KEY, allOpen ? 'true' : 'false');

    window.dispatchEvent(
      new CustomEvent('pa_debriefing_session_status', {
        detail: { isOpen: allOpen, openSessions: openMap },
      })
    );
    broadcastChannel?.postMessage({
      type: 'SESSION_STATUS',
      isOpen: allOpen,
      openSessions: openMap,
    });

    try {
      await fetch('/api/responses/active-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allOpen, openSessions: openMap }),
      });
    } catch {
      // offline fallback
    }
  },

  // Get active session ID
  getActiveSessionId(): ClassroomSessionId {
    if (typeof window === 'undefined') return '27_ottobre_mattina';
    const stored = localStorage.getItem(ACTIVE_SESSION_KEY) as ClassroomSessionId;
    if (stored && CLASSROOM_SESSIONS.some((s) => s.id === stored)) {
      return stored;
    }
    return '27_ottobre_mattina';
  },

  // Set active session (Pietro can set which aula is active)
  setActiveSessionId(sessionId: ClassroomSessionId): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
    window.dispatchEvent(new CustomEvent('pa_debriefing_session_change', { detail: sessionId }));
    broadcastChannel?.postMessage({ type: 'SESSION_CHANGE', sessionId });

    // Sync active session with server
    fetch('/api/responses/active-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, isOpen: this.isSessionOpen(sessionId) }),
    }).catch(() => {});
  },

  // Batch record all answers on final submission (atomic and loss-proof)
  async recordAnswersBatch(
    answers: Record<string, 'Verde' | 'Rosso'>,
    sessionId: ClassroomSessionId
  ): Promise<boolean> {
    if (typeof window === 'undefined') return true;

    const targetSession = sessionId || this.getActiveSessionId();
    const now = Date.now();
    const newSubs: AnonymousSubmission[] = Object.entries(answers).map(([caseId, choice], idx) => ({
      id: `${now}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      caseId,
      choice,
      sessionId: targetSession,
      timestamp: now,
    }));

    // Update local cache immediately
    const current = this.getLocalSubmissions();
    current.push(...newSubs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('pa_debriefing_update'));
      broadcastChannel?.postMessage({ type: 'NEW_SUBMISSION' });
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Sync atomically to server
    try {
      const res = await fetch('/api/responses/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          sessionId: targetSession,
        }),
      });
      if (res.ok) {
        // Refresh from server to ensure perfect consistency
        await this.syncFromServer();
        return true;
      }
    } catch (e) {
      console.warn('Batch submission server sync error:', e);
    }
    return false;
  },

  // Record a single anonymous answer
  recordAnswer(
    caseId: string,
    choice: 'Verde' | 'Giallo' | 'Rosso',
    sessionId?: ClassroomSessionId
  ): void {
    if (typeof window === 'undefined') return;

    const targetSession = sessionId || this.getActiveSessionId();
    const submission: AnonymousSubmission = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      caseId,
      choice,
      sessionId: targetSession,
      timestamp: Date.now(),
    };

    // Save locally
    const current = this.getLocalSubmissions();
    current.push(submission);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('pa_debriefing_update', { detail: submission }));
      broadcastChannel?.postMessage({ type: 'NEW_SUBMISSION', submission });
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Sync to server
    fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId,
        choice,
        sessionId: targetSession,
      }),
    }).catch(() => {});
  },

  // Read local submissions
  getLocalSubmissions(): AnonymousSubmission[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as AnonymousSubmission[];
    } catch {
      return [];
    }
  },

  // Fetch submissions and session state from server
  async syncFromServer(): Promise<AnonymousSubmission[]> {
    if (typeof window === 'undefined') return [];
    try {
      const res = await fetch(`/api/responses?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.submissions)) {
          // Merge server submissions
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.submissions));

          if (data.activeSessionId && CLASSROOM_SESSIONS.some((s) => s.id === data.activeSessionId)) {
            localStorage.setItem(ACTIVE_SESSION_KEY, data.activeSessionId);
          }
          if (typeof data.isSessionOpen === 'boolean') {
            localStorage.setItem(SESSION_OPEN_KEY, data.isSessionOpen ? 'true' : 'false');
          }
          if (data.openSessions && typeof data.openSessions === 'object') {
            localStorage.setItem(OPEN_SESSIONS_KEY, JSON.stringify(data.openSessions));
          }

          // Notify any listening components
          window.dispatchEvent(
            new CustomEvent('pa_debriefing_session_status', {
              detail: {
                isOpen: data.isSessionOpen,
                sessionId: data.activeSessionId,
                openSessions: data.openSessions,
              },
            })
          );
          window.dispatchEvent(
            new CustomEvent('pa_debriefing_session_change', { detail: data.activeSessionId })
          );
          window.dispatchEvent(new CustomEvent('pa_debriefing_update'));
          return data.submissions;
        }
      }
    } catch {
      // Fallback to local
    }
    return this.getLocalSubmissions();
  },

  // Filter submissions by session
  getSubmissions(sessionId?: ClassroomSessionId | 'all'): AnonymousSubmission[] {
    const all = this.getLocalSubmissions();
    if (!sessionId || sessionId === 'all') {
      return all;
    }
    return all.filter((s) => s.sessionId === sessionId);
  },

  // Subscribe to live events
  onUpdate(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleCustom = () => callback();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === ACTIVE_SESSION_KEY || e.key === SESSION_OPEN_KEY) callback();
    };
    const handleBroadcast = (msg: MessageEvent) => {
      if (
        msg.data?.type === 'NEW_SUBMISSION' ||
        msg.data?.type === 'RESET' ||
        msg.data?.type === 'SESSION_CHANGE' ||
        msg.data?.type === 'SESSION_STATUS'
      ) {
        callback();
      }
    };

    window.addEventListener('pa_debriefing_update', handleCustom);
    window.addEventListener('pa_debriefing_session_change', handleCustom);
    window.addEventListener('pa_debriefing_session_status', handleCustom);
    window.addEventListener('storage', handleStorage);
    broadcastChannel?.addEventListener('message', handleBroadcast);

    return () => {
      window.removeEventListener('pa_debriefing_update', handleCustom);
      window.removeEventListener('pa_debriefing_session_change', handleCustom);
      window.removeEventListener('pa_debriefing_session_status', handleCustom);
      window.removeEventListener('storage', handleStorage);
      broadcastChannel?.removeEventListener('message', handleBroadcast);
    };
  },

  // Trigger reshuffle from teacher area to simulator
  triggerShuffle(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('pa_shuffle_cases'));
    broadcastChannel?.postMessage({ type: 'SHUFFLE_CASES' });
  },

  onShuffle(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handleEvent = () => callback();
    const handleBroadcast = (msg: MessageEvent) => {
      if (msg.data?.type === 'SHUFFLE_CASES') callback();
    };
    window.addEventListener('pa_shuffle_cases', handleEvent);
    broadcastChannel?.addEventListener('message', handleBroadcast);
    return () => {
      window.removeEventListener('pa_shuffle_cases', handleEvent);
      broadcastChannel?.removeEventListener('message', handleBroadcast);
    };
  },

  // Compute stats for a specific classroom session (or all)
  getDebriefStats(sessionId?: ClassroomSessionId | 'all'): {
    cases: CaseDebriefStats[];
    totalSubmissions: number;
    totalParticipantsEstimated: number;
    overallAccuracy: number;
    sessionId: ClassroomSessionId | 'all';
    sessionLabel: string;
  } {
    const targetSession = sessionId || this.getActiveSessionId();
    const submissions = this.getSubmissions(targetSession);
    const totalSubmissions = submissions.length;

    const countsPerCase: Record<string, number> = {};
    submissions.forEach((s) => {
      countsPerCase[s.caseId] = (countsPerCase[s.caseId] || 0) + 1;
    });
    const totalParticipantsEstimated = Math.max(0, ...Object.values(countsPerCase));

    let correctTotal = 0;

    const cases: CaseDebriefStats[] = TRAFFIC_LIGHT_CASES.map((c) => {
      const caseSubmissions = submissions.filter((s) => s.caseId === c.id);
      const totalAnswers = caseSubmissions.length;

      const counts = {
        Verde: 0,
        Giallo: 0,
        Rosso: 0,
      };

      caseSubmissions.forEach((s) => {
        if (s.choice in counts) {
          counts[s.choice] += 1;
        }
      });

      const percentages = {
        Verde: totalAnswers > 0 ? Math.round((counts.Verde / totalAnswers) * 100) : 0,
        Giallo: totalAnswers > 0 ? Math.round((counts.Giallo / totalAnswers) * 100) : 0,
        Rosso: totalAnswers > 0 ? Math.round((counts.Rosso / totalAnswers) * 100) : 0,
      };

      const correctCount = counts[c.category] || 0;
      correctTotal += correctCount;

      const correctPercentage = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

      const meta = DEBRIEF_METADATA[c.id] || {
        pitfall: 'Valutazione della continenza verbale e dell\'identificazione.',
        question: 'Come vi sareste comportati in una situazione simile?',
        legalFocus: 'D.P.R. 62/2013 integrato dal D.P.R. 81/2023.',
      };

      return {
        caseId: c.id,
        title: c.title,
        context: c.context,
        correctCategory: c.category,
        quote: c.quote,
        totalAnswers,
        counts,
        percentages,
        correctPercentage,
        mostCommonPitfall: meta.pitfall,
        discussionQuestion: meta.question,
        legalFocus: meta.legalFocus,
      };
    });

    const overallAccuracy =
      totalSubmissions > 0 ? Math.round((correctTotal / totalSubmissions) * 100) : 0;

    const sessionInfo = CLASSROOM_SESSIONS.find((s) => s.id === targetSession);
    const sessionLabel =
      targetSession === 'all'
        ? 'Tutte le 4 Aule Riunite (Riepilogo Totale)'
        : sessionInfo?.label || targetSession;

    return {
      cases,
      totalSubmissions,
      totalParticipantsEstimated,
      overallAccuracy,
      sessionId: targetSession,
      sessionLabel,
    };
  },

  // Seed simulated classroom data for tests (synced to server)
  async seedSampleClassroom(sessionId: ClassroomSessionId, count = 26): Promise<void> {
    try {
      const res = await fetch('/api/responses/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, count }),
      });
      if (res.ok) {
        await this.syncFromServer();
        return;
      }
    } catch {
      // offline fallback
    }

    const mockSubmissions: AnonymousSubmission[] = [];
    const distributions: Record<string, [number, number]> = {
      'case-1': [85, 15],
      'case-2': [90, 10],
      'case-3': [25, 75],
      'case-4': [20, 80],
      'case-5': [22, 78],
      'case-6': [8, 92],
      'case-7': [5, 95],
      'case-8': [12, 88],
    };

    TRAFFIC_LIGHT_CASES.forEach((c) => {
      const dist = distributions[c.id] || [50, 50];
      for (let i = 0; i < count; i++) {
        const rand = Math.random() * 100;
        const choice: 'Verde' | 'Rosso' = rand < dist[0] ? 'Verde' : 'Rosso';
        mockSubmissions.push({
          id: `seed-${sessionId}-${c.id}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          caseId: c.id,
          choice,
          sessionId,
          timestamp: Date.now() - Math.floor(Math.random() * 3600000),
        });
      }
    });

    const existingOther = this.getLocalSubmissions().filter((s) => s.sessionId !== sessionId);
    const merged = [...existingOther, ...mockSubmissions];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('pa_debriefing_update'));
    broadcastChannel?.postMessage({ type: 'NEW_SUBMISSION' });
  },

  // Clear submissions for a specific classroom session, or for all
  async clearSubmissions(sessionId?: ClassroomSessionId | 'all'): Promise<void> {
    if (typeof window === 'undefined') return;

    if (!sessionId || sessionId === 'all') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      const remaining = this.getLocalSubmissions().filter((s) => s.sessionId !== sessionId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    }

    window.dispatchEvent(new CustomEvent('pa_debriefing_update'));
    broadcastChannel?.postMessage({ type: 'RESET' });

    try {
      await fetch('/api/responses/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId || 'all' }),
      });
      await this.syncFromServer();
    } catch {
      // offline fallback
    }
  },
};
