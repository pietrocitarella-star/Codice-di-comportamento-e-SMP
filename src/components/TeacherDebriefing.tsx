import React, { useState, useEffect } from 'react';
import { debriefingService, CLASSROOM_SESSIONS } from '../services/debriefingService';
import { ClassroomSessionId, CaseDebriefStats } from '../types';
import {
  Lock,
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
} from 'lucide-react';

interface TeacherDebriefingProps {
  onLogout: () => void;
}

export const TeacherDebriefing: React.FC<TeacherDebriefingProps> = ({ onLogout }) => {
  const [selectedSession, setSelectedSession] = useState<ClassroomSessionId | 'all'>('27_ottobre_mattina');
  const [stats, setStats] = useState(() => debriefingService.getDebriefStats('27_ottobre_mattina'));
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationCaseIndex, setPresentationCaseIndex] = useState(0);
  const [sortByCritical, setSortByCritical] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<'current' | 'all'>('current');
  const [activeSessionNotice, setActiveSessionNotice] = useState(false);
  const [shuffledNotice, setShuffledNotice] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync from server on mount and periodically every 5 seconds
  useEffect(() => {
    const fetchFreshData = async () => {
      await debriefingService.syncFromServer();
      setStats(debriefingService.getDebriefStats(selectedSession));
    };

    fetchFreshData();
    const interval = setInterval(fetchFreshData, 5000);
    return () => clearInterval(interval);
  }, [selectedSession]);

  // Subscribe to local/broadcast events
  useEffect(() => {
    const unsubscribe = debriefingService.onUpdate(() => {
      setStats(debriefingService.getDebriefStats(selectedSession));
    });
    return () => unsubscribe();
  }, [selectedSession]);

  const handleSelectSessionTab = (sessionId: ClassroomSessionId | 'all') => {
    setSelectedSession(sessionId);
    setStats(debriefingService.getDebriefStats(sessionId));
  };

  const handleSetActiveSessionForStudents = (sessionId: ClassroomSessionId) => {
    debriefingService.setActiveSessionId(sessionId);
    setActiveSessionNotice(true);
    setTimeout(() => setActiveSessionNotice(false), 3000);
  };

  const handleShuffleCasesFromTeacher = () => {
    // Shuffling from teacher area
    setShuffledNotice(true);
    setTimeout(() => setShuffledNotice(false), 2500);
  };

  const handleSeedClassroom = () => {
    if (selectedSession === 'all') {
      debriefingService.seedSampleClassroom('27_ottobre_mattina', 26);
    } else {
      debriefingService.seedSampleClassroom(selectedSession, 26);
    }
    setStats(debriefingService.getDebriefStats(selectedSession));
  };

  const handleResetConfirmed = () => {
    if (resetTarget === 'all') {
      debriefingService.clearSubmissions('all');
    } else {
      debriefingService.clearSubmissions(selectedSession);
    }
    setStats(debriefingService.getDebriefStats(selectedSession));
    setConfirmResetOpen(false);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await debriefingService.syncFromServer();
    setStats(debriefingService.getDebriefStats(selectedSession));
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
  const activeSessionGlobal = debriefingService.getActiveSessionId();

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
                Canale: {c.context}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Risposte aula: {c.totalAnswers}
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
                  Distribuzione delle Risposte in Quest'Aula
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                  Risposta Corretta: {c.correctCategory} ({c.correctPercentage}%)
                </span>
              </div>

              <div className="space-y-4">
                {/* Verde */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Verde - Consentito</span>
                      {c.correctCategory === 'Verde' && (
                        <span className="text-[10px] bg-emerald-900 text-emerald-200 px-1.5 rounded font-mono">
                          CORRETTO
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

                {/* Giallo */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Giallo - Serve Cautela</span>
                      {c.correctCategory === 'Giallo' && (
                        <span className="text-[10px] bg-amber-900 text-amber-200 px-1.5 rounded font-mono">
                          CORRETTO
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-200">
                      {c.counts.Giallo} voti ({c.percentages.Giallo}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${c.percentages.Giallo}%` }}
                    />
                  </div>
                </div>

                {/* Rosso */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Rosso - Da Evitare</span>
                      {c.correctCategory === 'Rosso' && (
                        <span className="text-[10px] bg-rose-900 text-rose-200 px-1.5 rounded font-mono">
                          CORRETTO
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-200">
                      {c.counts.Rosso} voti ({c.percentages.Rosso}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${c.percentages.Rosso}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1 uppercase tracking-wide">
                  ⚠️ Trappola & Dubbio Frequente:
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
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800 mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Area Riservata Docente · Pietro Citarella (PIN: 2204)</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">Gestione 4 Aule (27-28 Ottobre)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Restituzione Debriefing
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              I risultati anonimi dei partecipanti sono separati e archiviati per ciascuna delle tue 4
              lezioni (mattina e pomeriggio del 27 e 28 ottobre).
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
              title="Aggiorna risposte dal server in tempo reale"
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

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
              title="Esci dall'area riservata docente"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Esci</span>
            </button>
          </div>
        </div>

        {/* 4 Classrooms Tab Switcher */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-800" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Seleziona l'Aula da Esaminare:
              </span>
            </div>
            {selectedSession !== 'all' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSetActiveSessionForStudents(selectedSession)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                    activeSessionGlobal === selectedSession
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Imposta questa aula come predefinita per tutti i corsisti che aprono l'app"
                >
                  {activeSessionGlobal === selectedSession ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Aula Attualmente Attiva per i Corsisti</span>
                    </>
                  ) : (
                    <span>Imposta come Aula Attiva per l'Esercitazione</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {activeSessionNotice && (
            <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Aula impostata con successo! I corsisti che apriranno l'app invieranno le risposte in
                questa sessione.
              </span>
            </div>
          )}

          {/* Classroom Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CLASSROOM_SESSIONS.map((session) => {
              const isSelected = selectedSession === session.id;
              const isGlobalActive = activeSessionGlobal === session.id;

              return (
                <button
                  key={session.id}
                  onClick={() => handleSelectSessionTab(session.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-teal-900 text-white border-teal-900 shadow-sm'
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
                    {isGlobalActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Aula Attiva" />
                    )}
                  </div>
                  <span className="font-bold text-xs block leading-tight">{session.slot}</span>
                  <span
                    className={`text-[10px] font-mono mt-0.5 block ${
                      isSelected ? 'text-teal-200' : 'text-slate-500'
                    }`}
                  >
                    {session.time}
                  </span>
                </button>
              );
            })}

            {/* All sessions combined tab */}
            <button
              onClick={() => handleSelectSessionTab('all')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedSession === 'all'
                  ? 'bg-teal-900 text-white border-teal-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                  selectedSession === 'all' ? 'text-teal-200' : 'text-slate-500'
                }`}
              >
                Riepilogo Generale
              </span>
              <span className="font-bold text-xs block leading-tight">Tutte le 4 Aule</span>
              <span
                className={`text-[10px] mt-0.5 block ${
                  selectedSession === 'all' ? 'text-teal-200' : 'text-slate-500'
                }`}
              >
                Dati complessivi
              </span>
            </button>
          </div>
        </div>

        {/* Classroom Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Partecipanti Stimati
            </span>
            <span className="font-mono text-2xl font-extrabold text-slate-900 mt-1 block">
              {stats.totalParticipantsEstimated}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              In quest'aula ({stats.sessionLabel.split('(')[0].trim()})
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Risposte Raccolte
            </span>
            <span className="font-mono text-2xl font-extrabold text-teal-900 mt-1 block">
              {stats.totalSubmissions}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Decisioni registrate</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Accuratezza dell'Aula
            </span>
            <span
              className={`font-mono text-2xl font-extrabold mt-1 block ${
                stats.overallAccuracy >= 70
                  ? 'text-emerald-700'
                  : stats.overallAccuracy >= 50
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {stats.totalSubmissions > 0 ? `${stats.overallAccuracy}%` : '—'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Conformità al Codice</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Indice di Rischio Aula
            </span>
            <span
              className={`font-bold text-base mt-2 block ${
                stats.overallAccuracy >= 75
                  ? 'text-emerald-800'
                  : stats.overallAccuracy >= 60
                  ? 'text-amber-800'
                  : 'text-rose-800'
              }`}
            >
              {stats.totalSubmissions === 0
                ? 'Nessun voto ancora'
                : stats.overallAccuracy >= 75
                ? 'Basso (Aula Preparata)'
                : stats.overallAccuracy >= 60
                ? 'Moderato (Dubbi Frequenti)'
                : 'Elevato (Focus Necessario)'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Clima decisionale</span>
          </div>
        </div>

        {/* Teacher Private Tools & Reset actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortByCritical(!sortByCritical)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                sortByCritical
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>
                {sortByCritical ? 'Ordinato per: Più Critici prima' : 'Ordina per: Più Critici prima'}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Seed mock participants for the selected classroom */}
            <button
              onClick={handleSeedClassroom}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg font-semibold transition-colors"
              title="Genera dati realistici di 26 discenti per testare o mostrare la simulazione in quest'aula"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Simula Voti di Prova (26 discenti)</span>
            </button>

            {/* Reset button with options */}
            <button
              onClick={() => {
                setResetTarget('current');
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

              {/* Collective Responses Distribution Bar */}
              <div className="mb-6 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Distribuzione Risposte in Quest'Aula:
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Risposta Corretta: <strong className="text-teal-900">{c.correctCategory}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                        <span>Verde</span>
                      </span>
                      <span className="font-mono tabular-nums text-slate-900">
                        {c.counts.Verde} ({c.percentages.Verde}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${c.percentages.Verde}%` }}
                      />
                    </div>
                  </div>

                  {/* Giallo */}
                  <div
                    className={`p-3 rounded-lg border ${
                      c.correctCategory === 'Giallo'
                        ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-500'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-amber-800 flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>Giallo</span>
                      </span>
                      <span className="font-mono tabular-nums text-slate-900">
                        {c.counts.Giallo} ({c.percentages.Giallo}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${c.percentages.Giallo}%` }}
                      />
                    </div>
                  </div>

                  {/* Rosso */}
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
                        <span>Rosso</span>
                      </span>
                      <span className="font-mono tabular-nums text-slate-900">
                        {c.counts.Rosso} ({c.percentages.Rosso}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${c.percentages.Rosso}%` }}
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
    </div>
  );
};
