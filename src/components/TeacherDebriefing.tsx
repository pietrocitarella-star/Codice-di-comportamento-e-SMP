import React, { useState, useEffect } from 'react';
import { debriefingService, CLASSROOM_SESSIONS } from '../services/debriefingService';
import { ClassroomSessionId, CaseDebriefStats } from '../types';
import {
  Lock,
  Unlock,
  Users,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
  Sparkles,
  Maximize2,
  Minimize2,
  LogOut,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Shield,
  ArrowUpDown,
  Calendar,
  Shuffle,
  RefreshCw,
  Check,
  History,
  Tag,
  X,
  FileText,
  AlertCircle,
  Radio,
} from 'lucide-react';

interface TeacherDebriefingProps {
  onLogout: () => void;
}

const APP_VERSION = 'v2.5.0';

const CHANGELOG_ENTRIES = [
  {
    version: 'v2.5.0',
    date: '12 Ottobre 2026',
    title: 'Sincronizzazione Multi-Device Cloud & Modulo 3 Responsive Mobile',
    badge: 'Versione Attuale',
    changes: [
      'Sincronizzazione Real-Time Multi-Device: debriefing e stato aule sincronizzati e persistiti lato server tra qualsiasi dispositivo (PC, tablet, smartphone).',
      'Gestione Apertura Indipendente per le 4 Aule: ciascuna sessione (27 e 28 Ottobre, Mattina e Pomeriggio) ha il proprio stato dedicato di apertura/chiusura con pulsanti di controllo rapido.',
      'Badge di stato (🟢 Aperta / 🔒 Chiusa) e contatore risposte visibili in tempo reale su ogni singola pillola d\'aula.',
      'Invio atomico e protetto delle risposte da parte dei corsisti (/api/responses/batch) per evitare perdite di pacchetti.',
      'Modulo 3 (Vademecum) completamente responsive su dispositivi mobili con schede tematiche dedicate per agevole lettura.',
    ],
  },
  {
    version: 'v2.4.0',
    date: '28 Ottobre 2026',
    title: 'Modalità Decisionale Binaria, Gating Aula e Sicurezza PIN',
    changes: [
      'Passaggio a 2 sole opzioni nel laboratorio: Verde (Corretta) e Rossa (Da evitare o che richiede cautela).',
      'Inserimento del messaggio di conferma per validare la risposta selezionata dal discente.',
      'Navigazione bidirezionale libera tra i casi (avanti/indietro/selettore a pillole) con possibilità di modifica prima dell\'invio.',
      'Pulsante conclusivo di invio definitivo del test con congelamento e blocco modifiche post-invio.',
      'Controllo accesso (Gating) del laboratorio: i corsisti possono rispondere solo se il formatore apre manualmente la sessione d\'aula.',
      'Oscuramento e rimozione totale del PIN (2204) da placeholder, etichette e testi visibili a schermo.',
      'Pulsante dedicato di uscita rapida dall\'area riservata (logout) con disconnessione di sicurezza.',
      'Registro di versione e changelog integrato consultabile nell\'area riservata.',
    ],
  },
  {
    version: 'v2.3.0',
    date: '27 Ottobre 2026',
    title: 'Perfezionamento Orari e Rimozione Filtri Superflui',
    changes: [
      'Orari aule corretti e uniformati: Mattina (9.30 - 11.30) e Pomeriggio (12.00 - 14.00).',
      'Rimozione del filtro per canale nel laboratorio casi pratici.',
      'Eliminazione del grafico a torta dell\'origine delle segnalazioni.',
      'Rimozione prefisso "Docente" davanti al nome di Pietro Citarella.',
      'Funzione "Rimescola Casi" spostata esclusivamente all\'interno dell\'area riservata con notifica visiva.',
    ],
  },
  {
    version: 'v2.2.0',
    date: '26 Ottobre 2026',
    title: 'Gestione Multi-Aula e Azzeramento Risposte',
    changes: [
      'Separazione e isolamento dei risultati per le 4 lezioni (27 e 28 Ottobre, mattina e pomeriggio).',
      'Pulsante di azzeramento risposte per singola aula o per tutte le 4 aule simultaneamente per le prove pre-corso.',
      'Aggiornamento PIN di sicurezza a 2204.',
    ],
  },
  {
    version: 'v2.1.0',
    date: '25 Ottobre 2026',
    title: 'Dashboard Debriefing Riservata e Algoritmo di Rimescolamento',
    changes: [
      'Creazione dell\'area riservata con accesso PIN per l\'analisi anonima in tempo reale.',
      'Algoritmo smart-shuffle per alternare e distribuire uniformemente i casi nel laboratorio.',
      'Modalità Proiettore/LIM a schermo intero con navigazione da tastiera per la restituzione in aula.',
    ],
  },
  {
    version: 'v2.0.0',
    date: '24 Ottobre 2026',
    title: 'Rilascio Laboratorio Dilemmi Operativi PA',
    changes: [
      'Simulatore interattivo basato sulle novità del D.P.R. 81/2023 (Codice di Comportamento integrato).',
      'Sezione interattiva con canoni di comportamento, vademecum e linee guida per social media.',
    ],
  },
];

export const TeacherDebriefing: React.FC<TeacherDebriefingProps> = ({ onLogout }) => {
  const [selectedSession, setSelectedSession] = useState<ClassroomSessionId | 'all'>(() =>
    debriefingService.getActiveSessionId()
  );
  const [stats, setStats] = useState(() => debriefingService.getDebriefStats(debriefingService.getActiveSessionId()));
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationCaseIndex, setPresentationCaseIndex] = useState(0);
  const [sortByCritical, setSortByCritical] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<'current' | 'all'>('current');
  const [activeSessionNotice, setActiveSessionNotice] = useState(false);
  const [shuffledNotice, setShuffledNotice] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [hasManuallySelectedTab, setHasManuallySelectedTab] = useState(false);

  // Classroom lab open state
  const [isLabOpen, setIsLabOpen] = useState<boolean>(() => debriefingService.isSessionOpen());
  const [openSessions, setOpenSessions] = useState<Record<string, boolean>>(() =>
    debriefingService.getOpenSessions()
  );
  const [activeSessionGlobal, setActiveSessionGlobal] = useState<ClassroomSessionId>(() =>
    debriefingService.getActiveSessionId()
  );

  // Sync from server on mount and periodically every 3 seconds for real-time multi-device synchronization
  useEffect(() => {
    let isMounted = true;

    const fetchFreshData = async () => {
      await debriefingService.syncFromServer();
      if (!isMounted) return;

      const serverActive = debriefingService.getActiveSessionId();
      const serverOpenMap = debriefingService.getOpenSessions();
      const serverGlobalOpen = debriefingService.isSessionOpen();

      setActiveSessionGlobal(serverActive);
      setOpenSessions(serverOpenMap);
      setIsLabOpen(serverGlobalOpen);

      // On initial load across devices, align with server's active session if teacher didn't manually pick a tab
      if (!hasManuallySelectedTab) {
        setSelectedSession((current) => {
          if (current !== 'all' && current !== serverActive) {
            setStats(debriefingService.getDebriefStats(serverActive));
            return serverActive;
          }
          setStats(debriefingService.getDebriefStats(current));
          return current;
        });
      } else {
        setStats(debriefingService.getDebriefStats(selectedSession));
      }

      setLastSyncTime(
        new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };

    fetchFreshData();
    const interval = setInterval(fetchFreshData, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedSession, hasManuallySelectedTab]);

  // Subscribe to local/broadcast events
  useEffect(() => {
    const unsubscribe = debriefingService.onUpdate(() => {
      setStats(debriefingService.getDebriefStats(selectedSession));
      setIsLabOpen(debriefingService.isSessionOpen());
      setOpenSessions(debriefingService.getOpenSessions());
      setActiveSessionGlobal(debriefingService.getActiveSessionId());
    });
    return () => unsubscribe();
  }, [selectedSession]);

  const handleSelectSessionTab = (sessionId: ClassroomSessionId | 'all') => {
    setHasManuallySelectedTab(true);
    setSelectedSession(sessionId);
    setStats(debriefingService.getDebriefStats(sessionId));
  };

  const handleToggleLabOpen = async (shouldOpen: boolean, targetSession?: ClassroomSessionId) => {
    const sessionToUse = targetSession || (selectedSession !== 'all' ? selectedSession : activeSessionGlobal);
    setIsSyncing(true);
    await debriefingService.setSessionOpen(shouldOpen, sessionToUse);
    setIsLabOpen(debriefingService.isSessionOpen());
    setOpenSessions(debriefingService.getOpenSessions());
    setActiveSessionGlobal(sessionToUse);
    setIsSyncing(false);
    setActiveSessionNotice(true);
    setTimeout(() => setActiveSessionNotice(false), 3000);
  };

  const handleToggleAllAule = async (allOpen: boolean) => {
    setIsSyncing(true);
    await debriefingService.setAllSessionsOpen(allOpen);
    setIsLabOpen(allOpen);
    setOpenSessions(debriefingService.getOpenSessions());
    setIsSyncing(false);
    setActiveSessionNotice(true);
    setTimeout(() => setActiveSessionNotice(false), 3000);
  };

  const handleSetActiveClassroomOnly = (sessionId: ClassroomSessionId) => {
    debriefingService.setActiveSessionId(sessionId);
    setActiveSessionGlobal(sessionId);
    setActiveSessionNotice(true);
    setTimeout(() => setActiveSessionNotice(false), 3000);
  };

  const handleShuffleCasesFromTeacher = () => {
    debriefingService.triggerShuffle();
    setShuffledNotice(true);
    setTimeout(() => setShuffledNotice(false), 2500);
  };

  const handleSeedClassroom = async () => {
    setIsSyncing(true);
    const target = selectedSession === 'all' ? activeSessionGlobal : selectedSession;
    await debriefingService.seedSampleClassroom(target, 26);
    setStats(debriefingService.getDebriefStats(selectedSession));
    setIsSyncing(false);
  };

  const handleResetConfirmed = async () => {
    setIsSyncing(true);
    if (resetTarget === 'all') {
      await debriefingService.clearSubmissions('all');
      CLASSROOM_SESSIONS.forEach((s) => {
        localStorage.removeItem(`pa_test_submitted_${s.id}`);
        localStorage.removeItem(`pa_student_answers_${s.id}`);
      });
    } else {
      await debriefingService.clearSubmissions(selectedSession);
      localStorage.removeItem(`pa_test_submitted_${selectedSession}`);
      localStorage.removeItem(`pa_student_answers_${selectedSession}`);
    }
    setStats(debriefingService.getDebriefStats(selectedSession));
    setIsSyncing(false);
    setConfirmResetOpen(false);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await debriefingService.syncFromServer();
    setStats(debriefingService.getDebriefStats(selectedSession));
    setIsLabOpen(debriefingService.isSessionOpen());
    setOpenSessions(debriefingService.getOpenSessions());
    setActiveSessionGlobal(debriefingService.getActiveSessionId());
    setLastSyncTime(
      new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (!presentationMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        setPresentationCaseIndex((prev) => Math.min(stats.cases.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setPresentationCaseIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setPresentationMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentationMode, stats.cases.length]);

  const displayCases = [...stats.cases].sort((a, b) => {
    if (sortByCritical) {
      return a.correctPercentage - b.correctPercentage;
    }
    return 0;
  });

  const activePresentationCase = stats.cases[presentationCaseIndex] || stats.cases[0];
  const activeSessionInfo = CLASSROOM_SESSIONS.find((s) => s.id === activeSessionGlobal);

  // ==========================================
  // PRESENTATION / PROJECTOR MODE VIEW
  // ==========================================
  if (presentationMode) {
    const c = activePresentationCase;
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-6 sm:p-12 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded border border-teal-800">
              Restituzione d'Aula · {stats.sessionLabel}
            </span>
            <span className="text-sm font-semibold text-slate-300">
              Caso {presentationCaseIndex + 1} di {stats.cases.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Frecce ← → per scorrere
            </span>
            <button
              onClick={() => setPresentationMode(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Esci dal Proiettore (Esc)</span>
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col justify-between py-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                Ambito: {c.context}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Risposte pervenute: {c.totalAnswers}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
              {c.title}
            </h2>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 mb-8">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                La situazione analizzata:
              </span>
              <p className="text-base sm:text-lg text-teal-100 font-serif italic leading-relaxed">
                {c.quote}
              </p>
            </div>

            <div className="mb-8 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
                  Distribuzione delle Risposte in Quest'Aula (Scelta Binaria)
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                  Risposta Conforme: {c.correctCategory === 'Verde' ? 'Verde (Corretta)' : 'Rossa (Da evitare / Cautela)'} ({c.correctPercentage}%)
                </span>
              </div>

              <div className="space-y-4">
                {/* Verde */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Verde · Corretta / Conforme</span>
                      {c.correctCategory === 'Verde' && (
                        <span className="text-[10px] bg-emerald-900 text-emerald-200 px-1.5 rounded font-mono font-bold">
                          CONFORME
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-200">
                      {c.counts.Verde} voti ({c.percentages.Verde}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${c.percentages.Verde}%` }}
                    />
                  </div>
                </div>

                {/* Rosso (inclusi eventuali gialli come non conformi/cautela) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Rossa · Da Evitare o con Cautela</span>
                      {c.correctCategory === 'Rosso' && (
                        <span className="text-[10px] bg-rose-900 text-rose-200 px-1.5 rounded font-mono font-bold">
                          CONFORME AL CODICE
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-200">
                      {c.counts.Rosso + c.counts.Giallo} voti ({Math.min(100, c.percentages.Rosso + c.percentages.Giallo)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, c.percentages.Rosso + c.percentages.Giallo)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1 uppercase tracking-wide">
                  ⚠️ Trappola & Dubbio Frequente in Aula:
                </span>
                <p className="text-slate-300 leading-relaxed">{c.mostCommonPitfall}</p>
              </div>

              <div className="bg-teal-950/60 p-4 rounded-xl border border-teal-800/60">
                <span className="text-teal-300 font-bold block mb-1 uppercase tracking-wide">
                  ⚖️ Fondamento Giuridico (D.P.R. 81/2023):
                </span>
                <p className="text-slate-200 leading-relaxed">{c.legalFocus}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
            <button
              onClick={() => setPresentationCaseIndex((prev) => Math.max(0, prev - 1))}
              disabled={presentationCaseIndex === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Caso Precedente</span>
            </button>

            <span className="font-mono text-xs text-slate-400">
              {presentationCaseIndex + 1} / {stats.cases.length}
            </span>

            <button
              onClick={() =>
                setPresentationCaseIndex((prev) => Math.min(stats.cases.length - 1, prev + 1))
              }
              disabled={presentationCaseIndex === stats.cases.length - 1}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-30 rounded-lg text-xs font-semibold transition-colors"
            >
              <span>Caso Successivo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STANDARD TEACHER DASHBOARD VIEW
  // ==========================================
  return (
    <div className="space-y-8 pb-16">
      {/* Top Teacher Control Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-teal-800 mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Area Riservata · Pietro Citarella</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">Gestione 4 Aule (27-28 Ottobre)</span>
              <span aria-hidden="true">·</span>
              {/* Version Badge & Changelog trigger */}
              <button
                onClick={() => setShowChangelogModal(true)}
                className="inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-full font-mono text-[11px] transition-colors cursor-pointer"
                title="Visualizza changelog e registro delle modifiche"
              >
                <Tag className="w-3 h-3 text-teal-700" />
                <span>{APP_VERSION}</span>
                <span className="underline decoration-dotted ml-0.5">Changelog</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Restituzione Debriefing
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              I risultati anonimi dei partecipanti sono separati per ciascuna delle tue 4
              lezioni (mattina e pomeriggio del 27 e 28 ottobre).
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Live Server Sync indicator */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200"
              title="Sincronizzazione Cloud in tempo reale attiva ogni 3 secondi"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px]">Sync: {lastSyncTime}</span>
            </div>

            {/* Version / Changelog button */}
            <button
              onClick={() => setShowChangelogModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-300"
              title="Visualizza registro versioni e modifiche"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>Changelog ({APP_VERSION})</span>
            </button>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
              title="Forza aggiornamento immediato delle risposte dal server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-700' : ''}`} />
              <span>Aggiorna Dati</span>
            </button>

            <button
              onClick={() => {
                setPresentationCaseIndex(0);
                setPresentationMode(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Apri modalità schermo intero per proiettore o LIM"
            >
              <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Proiettore / LIM</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Stampa Report</span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors shadow-xs"
              title="Esci dall'area riservata e disconnettiti"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Esci dall'Area Riservata</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CLASSROOM GATING CONTROL CARD (Open / Close for students) */}
        {/* ======================================================== */}
        {(() => {
          const isCurrentTabOpen =
            selectedSession === 'all'
              ? Object.values(openSessions).some(Boolean)
              : Boolean(openSessions[selectedSession]);
          const currentSessionInfo =
            selectedSession !== 'all' ? CLASSROOM_SESSIONS.find((s) => s.id === selectedSession) : null;
          const openAuleCount = Object.values(openSessions).filter(Boolean).length;

          return (
            <div className="pt-6 pb-2">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      isCurrentTabOpen
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {isCurrentTabOpen ? (
                      <Unlock className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {selectedSession === 'all'
                          ? 'Stato Complessivo Aule:'
                          : `Stato Aula (${currentSessionInfo?.slot}):`}
                      </span>
                      {selectedSession === 'all' ? (
                        <span
                          className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            openAuleCount > 0
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              openAuleCount > 0 ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                            }`}
                          />
                          <span>
                            {openAuleCount} di 4 Aule Aperte per le Risposte
                          </span>
                        </span>
                      ) : isCurrentTabOpen ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          <span>APERTA PER LE RISPOSTE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>CHIUSA (RISPOSTE BLOCCATE)</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {selectedSession === 'all' ? (
                        <>
                          Stai visualizzando il riepilogo complessivo di tutte e 4 le aule. Clicca su una singola aula qui sotto per aprirla o chiuderla individualmente.
                        </>
                      ) : isCurrentTabOpen ? (
                        <>
                          I discenti possono rispondere al test per l'aula:{' '}
                          <strong className="text-slate-900">{currentSessionInfo?.label}</strong>. Qualsiasi corsista collegato da smartphone o PC può compilare e inviare il test.
                        </>
                      ) : (
                        <>
                          L'invio delle risposte per quest'aula (<strong>{currentSessionInfo?.label}</strong>) è bloccato. Clicca su «Apri quest'Aula» per abilitare i partecipanti.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Action buttons for opening, closing, or switching classroom */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto">
                  {selectedSession !== 'all' ? (
                    <>
                      {isCurrentTabOpen ? (
                        <button
                          onClick={() => handleToggleLabOpen(false, selectedSession)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all shadow-xs"
                          title="Blocca l'invio delle risposte per questa aula"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Chiudi quest'Aula ({currentSessionInfo?.slot})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleLabOpen(true, selectedSession)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                          title="Abilita i corsisti a rispondere per questa aula"
                        >
                          <Unlock className="w-4 h-4" />
                          <span>Apri quest'Aula per i Corsisti ({currentSessionInfo?.slot})</span>
                        </button>
                      )}

                      {activeSessionGlobal !== selectedSession && (
                        <button
                          onClick={() => handleSetActiveClassroomOnly(selectedSession)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-all"
                          title="Imposta questa come aula principale suggerita ai corsisti nel simulatore"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                          <span>Imposta come Attiva</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggleAllAule(true)}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Apri Tutte e 4 le Aule</span>
                      </button>
                      <button
                        onClick={() => handleToggleAllAule(false)}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Chiudi Tutte le Aule</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4 Classrooms Tab Switcher */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-800" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Seleziona l'Aula da Esaminare:
            </span>
          </div>
        </div>

        {activeSessionNotice && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Stato sincronizzato con successo in tempo reale su tutti i dispositivi!
            </span>
          </div>
        )}

        {/* Classroom Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CLASSROOM_SESSIONS.map((session) => {
            const isSelected = selectedSession === session.id;
            const isOpen = Boolean(openSessions[session.id]);
            const isGlobalActive = activeSessionGlobal === session.id;
            const sessionSubmissions = debriefingService.getSubmissions(session.id);
            const count = sessionSubmissions.length;

            return (
              <button
                key={session.id}
                onClick={() => handleSelectSessionTab(session.id)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-teal-900 text-white border-teal-900 shadow-sm ring-2 ring-teal-500/30'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isSelected ? 'text-teal-200' : 'text-slate-500'
                    }`}
                  >
                    {session.day}
                  </span>
                  <div className="flex items-center gap-1">
                    {isOpen ? (
                      <span
                        className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                        title="Aula attualmente aperta per i corsisti"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>APERTA</span>
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
                          isSelected ? 'text-slate-300 bg-slate-800' : 'text-slate-400 bg-slate-200/80'
                        }`}
                        title="Aula chiusa (risposte bloccate)"
                      >
                        CHIUSA
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs block leading-tight">{session.slot}</span>
                  {isGlobalActive && (
                    <span
                      className={`text-[9px] font-extrabold px-1 rounded ${
                        isSelected ? 'bg-amber-400/30 text-amber-300' : 'bg-amber-100 text-amber-900'
                      }`}
                      title="Aula principale attiva suggerita ai corsisti"
                    >
                      ★ ATTIVA
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className={isSelected ? 'text-teal-200' : 'text-slate-500'}>
                    {session.time}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      count > 0
                        ? isSelected
                          ? 'text-emerald-300'
                          : 'text-emerald-700'
                        : isSelected
                        ? 'text-slate-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {count > 0 ? `${count} risp.` : '0 risp.'}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Total / All Classrooms Tab */}
          {(() => {
            const totalCount = debriefingService.getLocalSubmissions().length;
            const openCount = Object.values(openSessions).filter(Boolean).length;
            return (
              <button
                onClick={() => handleSelectSessionTab('all')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedSession === 'all'
                    ? 'bg-teal-900 text-white border-teal-900 shadow-sm ring-2 ring-teal-500/30'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block ${
                      selectedSession === 'all' ? 'text-teal-200' : 'text-slate-500'
                    }`}
                  >
                    Riepilogo
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      selectedSession === 'all'
                        ? 'bg-teal-800 text-teal-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {openCount}/4 aperte
                  </span>
                </div>
                <span className="font-bold text-xs block leading-tight">Tutte le 4 Aule</span>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className={selectedSession === 'all' ? 'text-teal-200' : 'text-slate-500'}>
                    Totale Generale
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      selectedSession === 'all' ? 'text-emerald-300' : 'text-emerald-700'
                    }`}
                  >
                    {totalCount} risp.
                  </span>
                </div>
              </button>
            );
          })()}
        </div>

        {/* Global Stats Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block uppercase font-medium">
              Voti Registrati
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">
              {stats.totalSubmissions}
            </span>
            <span className="text-[11px] text-slate-500">Risposte anonime ricevute</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block uppercase font-medium">
              Partecipanti Stimati
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-teal-800 mt-1 block">
              {stats.totalParticipantsEstimated}
            </span>
            <span className="text-[11px] text-slate-500">In base al caso più risposto</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block uppercase font-medium">
              Accuratezza Generale
            </span>
            <span
              className={`text-xl sm:text-2xl font-bold font-mono mt-1 block ${
                stats.overallAccuracy >= 70
                  ? 'text-emerald-700'
                  : stats.overallAccuracy >= 50
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {stats.overallAccuracy}%
            </span>
            <span className="text-[11px] text-slate-500">Conformità media al Codice</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block uppercase font-medium">
              Casi Analizzati
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">
              {stats.cases.length}
            </span>
            <span className="text-[11px] text-slate-500">Dilemmi D.P.R. 81/2023</span>
          </div>
        </div>

        {/* Toolbar: Shuffle, Sort, Mock, Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortByCritical(!sortByCritical)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                sortByCritical
                  ? 'bg-teal-900 text-white border-teal-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>
                {sortByCritical ? 'Ordinati per Criticità (Meno corretti prima)' : 'Ordine Standard'}
              </span>
            </button>

            {shuffledNotice && (
              <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded text-xs font-semibold animate-fadeIn">
                ✓ Ordine casi rimescolato nel laboratorio!
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Shuffle cases button for teacher */}
            <button
              onClick={handleShuffleCasesFromTeacher}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg font-semibold transition-colors"
              title="Rimescola casualmente l'ordine dei casi per i discenti nel laboratorio"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Rimescola Casi</span>
            </button>

            {/* Seed mock participants for the selected classroom */}
            <button
              onClick={handleSeedClassroom}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-colors"
              title="Simula 26 risposte per testare la grafica e la proiezione in aula prima dell'inizio del corso"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Simula Voti di Prova (+26)</span>
            </button>

            {/* Reset data */}
            <button
              onClick={() => {
                setResetTarget(selectedSession === 'all' ? 'all' : 'current');
                setConfirmResetOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold transition-colors"
              title="Azzera le risposte per le prove prima del corso"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Azzera Risposte (Prove)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-2">
              Azzeramento Risposte (Gestione Prove)
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Puoi azzerare le risposte raccolte per effettuare nuove prove senza sporcare le altre
              sessioni d'aula.
            </p>

            <div className="space-y-2 mb-6">
              <label
                onClick={() => setResetTarget('current')}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  resetTarget === 'current'
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="resetOption"
                  checked={resetTarget === 'current'}
                  onChange={() => setResetTarget('current')}
                  className="text-teal-700"
                />
                <div>
                  <span className="font-bold text-xs block text-slate-900">
                    Azzera solo quest'aula: {stats.sessionLabel}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Cancella solo le risposte raccolte per questa specifica sessione.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setResetTarget('all')}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  resetTarget === 'all'
                    ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="resetOption"
                  checked={resetTarget === 'all'}
                  onChange={() => setResetTarget('all')}
                  className="text-rose-700"
                />
                <div>
                  <span className="font-bold text-xs block text-rose-900">
                    Azzera TUTTE le 4 aule contemporaneamente
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pulisce l'intero database di tutte le lezioni del 27 e 28 ottobre.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annulla
              </button>
              <button
                onClick={handleResetConfirmed}
                className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-xs font-bold text-white shadow-sm"
              >
                Conferma Azzeramento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case by Case Breakdown List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Analisi dei Risultati: {stats.sessionLabel}
            </h2>
            <span className="text-xs text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200 font-medium">
              {stats.totalSubmissions} voti totali
            </span>
          </div>
          <span className="text-xs text-slate-500">Sincronizzazione in tempo reale attiva</span>
        </div>

        {displayCases.map((c, index) => {
          return (
            <div
              key={c.caseId}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:border-teal-300"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{c.title}</h3>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {c.context}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">{c.totalAnswers} voti</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      c.correctPercentage >= 70
                        ? 'bg-emerald-100 text-emerald-900'
                        : c.correctPercentage >= 50
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    Accuratezza: {c.correctPercentage}%
                  </span>
                </div>
              </div>

              {/* Dilemma Quote */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 text-xs italic text-slate-700 font-serif">
                {c.quote}
              </div>

              {/* Collective Responses Distribution Bar (Binary Classification) */}
              <div className="mb-6 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Distribuzione Risposte in Quest'Aula (Due Opzioni):
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Risposta Conforme: <strong className="text-teal-900">{c.correctCategory === 'Verde' ? 'Verde (Corretta)' : 'Rossa (Da evitare / Cautela)'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Verde */}
                  <div
                    className={`p-3 rounded-lg border ${
                      c.correctCategory === 'Verde'
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-emerald-800 flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <span>Verde · Corretta</span>
                        {c.correctCategory === 'Verde' && (
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold ml-1">
                            ✓ CORRETTA
                          </span>
                        )}
                      </span>
                      <span className="font-mono tabular-nums text-slate-900">
                        {c.counts.Verde} ({c.percentages.Verde}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${c.percentages.Verde}%` }}
                      />
                    </div>
                  </div>

                  {/* Rosso (inclusi eventuali risposte con cautela) */}
                  <div
                    className={`p-3 rounded-lg border ${
                      c.correctCategory === 'Rosso'
                        ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-500'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-rose-800 flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                        <span>Rossa · Da evitare / Cautela</span>
                        {c.correctCategory === 'Rosso' && (
                          <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-mono font-bold ml-1">
                            ✓ CORRETTA
                          </span>
                        )}
                      </span>
                      <span className="font-mono tabular-nums text-slate-900">
                        {c.counts.Rosso + c.counts.Giallo} ({Math.min(100, c.percentages.Rosso + c.percentages.Giallo)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-rose-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, c.percentages.Rosso + c.percentages.Giallo)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructor Debriefing Guide Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                  <span className="text-amber-900 font-bold block mb-1">
                    ⚠️ Trappola / Dubbio riscontrato in aula:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{c.mostCommonPitfall}</p>
                </div>

                <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200">
                  <span className="text-teal-950 font-bold block mb-1">
                    🗣️ Domanda stimolo per aprire il confronto con la classe:
                  </span>
                  <p className="text-slate-800 italic leading-relaxed">{c.discussionQuestion}</p>
                  <p className="text-[11px] text-teal-800 mt-2 font-medium">
                    <strong>Norma: </strong>
                    {c.legalFocus}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* CHANGELOG & VERSION REGISTER MODAL (Visible only in Reserved Area) */}
      {/* ========================================================= */}
      {showChangelogModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 rounded-xl text-teal-800 border border-teal-200">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Registro Versioni & Changelog
                  </h3>
                  <p className="text-xs text-slate-500">
                    Area Riservata · Pietro Citarella (Versione corrente: {APP_VERSION})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChangelogModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
              {CHANGELOG_ENTRIES.map((entry) => (
                <div
                  key={entry.version}
                  className="bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-teal-900 text-teal-100 px-2.5 py-0.5 rounded-md">
                        {entry.version}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{entry.title}</h4>
                      {entry.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
                          {entry.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{entry.date}</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-teal-700 font-bold shrink-0 mt-0.5">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowChangelogModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Chiudi Changelog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
