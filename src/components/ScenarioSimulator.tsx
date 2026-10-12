import React, { useState, useEffect } from 'react';
import { TrafficLightCase, ClassroomSessionId } from '../types';
import { TRAFFIC_LIGHT_CASES } from '../data/courseData';
import { debriefingService, CLASSROOM_SESSIONS } from '../services/debriefingService';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Calendar,
  Lock,
  Unlock,
  Send,
  Check,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

// Smart shuffle function to interleave the 2 greens among the 6 reds
function smartShuffleBinaryCases(casesList: TrafficLightCase[]): TrafficLightCase[] {
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const greens = shuffle(casesList.filter((c) => c.category === 'Verde'));
  const reds = shuffle(casesList.filter((c) => c.category === 'Rosso'));

  const patterns = [
    [1, 5],
    [2, 6],
    [0, 4],
    [1, 6],
    [2, 5],
  ];
  const chosenPattern = patterns[Math.floor(Math.random() * patterns.length)];

  const result: TrafficLightCase[] = [];
  let gIdx = 0;
  let rIdx = 0;

  for (let i = 0; i < casesList.length; i++) {
    if (chosenPattern.includes(i) && gIdx < greens.length) {
      result.push(greens[gIdx++]);
    } else if (rIdx < reds.length) {
      result.push(reds[rIdx++]);
    } else if (gIdx < greens.length) {
      result.push(greens[gIdx++]);
    }
  }

  return result;
}

export const ScenarioSimulator: React.FC = () => {
  const [currentSessionId, setCurrentSessionId] = useState<ClassroomSessionId>(() =>
    debriefingService.getActiveSessionId()
  );
  const [isLabOpen, setIsLabOpen] = useState<boolean>(() =>
    debriefingService.isSessionOpen()
  );

  const [activeCasesList, setActiveCasesList] = useState<TrafficLightCase[]>(() =>
    smartShuffleBinaryCases(TRAFFIC_LIGHT_CASES)
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student answers mapping: caseId -> 'Verde' | 'Rosso'
  const [studentAnswers, setStudentAnswers] = useState<Record<string, 'Verde' | 'Rosso'>>(() => {
    try {
      const saved = localStorage.getItem(`pa_student_answers_${debriefingService.getActiveSessionId()}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Submitted lock state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`pa_test_submitted_${debriefingService.getActiveSessionId()}`) === 'true';
    } catch {
      return false;
    }
  });

  // Modal states
  const [pendingChoice, setPendingChoice] = useState<{
    caseId: string;
    choice: 'Verde' | 'Rosso';
    caseTitle: string;
    caseNumber: number;
  } | null>(null);

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [justSubmittedNotice, setJustSubmittedNotice] = useState(false);
  const [isRefreshingState, setIsRefreshingState] = useState(false);

  const syncStateFromService = () => {
    const newSession = debriefingService.getActiveSessionId();
    const openState = debriefingService.isSessionOpen();
    setCurrentSessionId(newSession);
    setIsLabOpen(openState);

    try {
      const savedSubmitted = localStorage.getItem(`pa_test_submitted_${newSession}`) === 'true';
      setIsSubmitted(savedSubmitted);
      const savedAnswers = localStorage.getItem(`pa_student_answers_${newSession}`);
      if (savedAnswers) {
        setStudentAnswers(JSON.parse(savedAnswers));
      }
    } catch {
      // ignore
    }
  };

  // Listen to session changes, open/close status, and reshuffle from teacher + POLLING
  useEffect(() => {
    const unsub = debriefingService.onUpdate(() => {
      syncStateFromService();
    });

    const unsubShuffle = debriefingService.onShuffle(() => {
      setActiveCasesList(smartShuffleBinaryCases(TRAFFIC_LIGHT_CASES));
      setCurrentIndex(0);
    });

    // Initial sync
    debriefingService.syncFromServer().then(() => {
      syncStateFromService();
    });

    // Periodic polling every 3 seconds to catch teacher opening/closing aula across separate devices
    const pollTimer = setInterval(() => {
      debriefingService.syncFromServer().then(() => {
        syncStateFromService();
      });
    }, 3000);

    return () => {
      unsub();
      unsubShuffle();
      clearInterval(pollTimer);
    };
  }, []);

  // Save answers whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        `pa_student_answers_${currentSessionId}`,
        JSON.stringify(studentAnswers)
      );
    } catch {
      // ignore
    }
  }, [studentAnswers, currentSessionId]);

  const activeCase = activeCasesList[currentIndex] || activeCasesList[0];
  const currentAnswer = activeCase ? studentAnswers[activeCase.id] : undefined;

  const currentSessionInfo = CLASSROOM_SESSIONS.find((s) => s.id === currentSessionId);

  // Manual refresh button
  const handleManualRefresh = async () => {
    setIsRefreshingState(true);
    await debriefingService.syncFromServer();
    syncStateFromService();
    setTimeout(() => setIsRefreshingState(false), 500);
  };

  // Classroom selection change by student (if needed)
  const handleSelectClassroom = (newId: ClassroomSessionId) => {
    setCurrentSessionId(newId);
    try {
      const savedSubmitted = localStorage.getItem(`pa_test_submitted_${newId}`) === 'true';
      setIsSubmitted(savedSubmitted);
      const savedAnswers = localStorage.getItem(`pa_student_answers_${newId}`);
      setStudentAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});
    } catch {
      // ignore
    }
  };

  // Handle clicking an option -> opens confirmation modal
  const handleInitiateChoice = (choice: 'Verde' | 'Rosso') => {
    if (!isLabOpen || isSubmitted || !activeCase) return;
    setPendingChoice({
      caseId: activeCase.id,
      choice,
      caseTitle: activeCase.title,
      caseNumber: currentIndex + 1,
    });
  };

  // Confirm choice in modal
  const handleConfirmChoice = () => {
    if (!pendingChoice) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [pendingChoice.caseId]: pendingChoice.choice,
    }));
    setPendingChoice(null);
  };

  // Final submission handler
  const handleFinalSubmit = () => {
    // Record all answered cases to debriefingService & server
    Object.entries(studentAnswers).forEach(([caseId, choice]) => {
      debriefingService.recordAnswer(caseId, choice, currentSessionId);
    });

    setIsSubmitted(true);
    setConfirmSubmitOpen(false);
    setJustSubmittedNotice(true);
    try {
      localStorage.setItem(`pa_test_submitted_${currentSessionId}`, 'true');
    } catch {
      // ignore
    }
  };

  // Reset test (for practicing again or re-taking)
  const handleResetTest = () => {
    setStudentAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
    setJustSubmittedNotice(false);
    try {
      localStorage.removeItem(`pa_student_answers_${currentSessionId}`);
      localStorage.removeItem(`pa_test_submitted_${currentSessionId}`);
    } catch {
      // ignore
    }
  };

  // Calculation of stats
  const totalCases = activeCasesList.length;
  const answeredCount = Object.keys(studentAnswers).length;
  const correctCount = Object.entries(studentAnswers).filter(([caseId, choice]) => {
    const foundCase = activeCasesList.find((c) => c.id === caseId);
    return foundCase && foundCase.category === choice;
  }).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Intro banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold mb-1">
              <span>Sezione Operativa in Evidenza</span>
              <span aria-hidden="true">·</span>
              <span>Dilemmi del Lavoro Pubblico</span>
              <span aria-hidden="true">·</span>
              <span>D.P.R. 81/2023</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Laboratorio Casi Pratici: Il Semaforo della PA
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Palestra decisionale a due opzioni: valuta ciascun dilemma del lavoro pubblico scegliendo tra{' '}
              <strong className="text-emerald-800">Verde (Corretta)</strong> o{' '}
              <strong className="text-rose-800">Rossa (Da evitare o che richiede cautela)</strong>.
              Puoi modificare liberamente le risposte prima dell'invio definitivo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Progresso</span>
              <span className="font-mono tabular-nums text-lg font-bold text-teal-900">
                {answeredCount} / {totalCases}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {isSubmitted ? '✓ Test Inviato' : 'In corso di compilazione'}
              </span>
            </div>
            {isSubmitted && (
              <button
                onClick={handleResetTest}
                title="Ricomincia il test da zero per una nuova prova"
                className="inline-flex items-center gap-1.5 p-2 px-3 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rifai Test</span>
              </button>
            )}
          </div>
        </div>

        {/* Classroom & Gate status strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            {isLabOpen ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sessione d'Aula Aperta per le Risposte</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-semibold text-[11px]">
                <Lock className="w-3 h-3 text-amber-700" />
                <span>Laboratorio Chiuso (In attesa di apertura dal docente)</span>
              </span>
            )}

            {/* Refresh button to force sync */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshingState}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              title="Aggiorna stato aula dal server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingState ? 'animate-spin text-teal-600' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-teal-50/80 text-teal-900 px-3 py-1.5 rounded-lg border border-teal-200/80 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-teal-800 shrink-0" />
            <span className="font-semibold text-slate-600">Aula:</span>
            <select
              value={currentSessionId}
              onChange={(e) => handleSelectClassroom(e.target.value as ClassroomSessionId)}
              className="bg-transparent font-bold text-teal-950 border-none focus:outline-none cursor-pointer text-xs"
            >
              {CLASSROOM_SESSIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gating alert if lab is CLOSED by teacher */}
      {!isLabOpen && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-7 shadow-xs animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-base font-bold text-amber-950">
                Laboratorio Attualmente Chiuso
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed max-w-3xl">
                La raccolta delle risposte per l'aula <strong>{currentSessionInfo?.label}</strong> non
                è al momento aperta. Il formatore (Pietro Citarella) deve prima attivare la sessione
                dalla propria <em>Area Riservata</em>. Non appena il docente aprirà l'aula, questa pagina
                si sbloccherà automaticamente (la verifica avviene automaticamente ogni pochi secondi).
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshingState}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-200/70 hover:bg-amber-200 text-amber-950 font-semibold text-xs rounded-lg transition-colors border border-amber-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingState ? 'animate-spin' : ''}`} />
                  <span>Verifica apertura ora</span>
                </button>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>In attesa dell'avvio in aula...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Already Submitted Banner with Repeat Test Option */}
      {isSubmitted && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 shadow-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Test Concluso! Risposte Registrate per l'Aula
                </h3>
                <p className="text-xs sm:text-sm text-emerald-900 mt-0.5 leading-relaxed">
                  Le tue risposte anonime sono state registrate con successo. Punteggio:{' '}
                  <strong className="text-emerald-950 font-mono font-bold">
                    {correctCount} su {totalCases} corrette ({Math.round((correctCount / totalCases) * 100)}%)
                  </strong>
                  . Puoi sfogliare i casi per leggere i verdetti giuridici del Codice.
                </p>
              </div>
            </div>
            <button
              onClick={handleResetTest}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ricomincia Nuova Prova</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Case Stepper / Pills Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Seleziona o Scorri tra i Casi ({currentIndex + 1} di {totalCases}):
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {answeredCount} di {totalCases} risposte impostate
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {activeCasesList.map((c, idx) => {
            const hasAnswer = studentAnswers[c.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={c.id}
                onClick={() => setCurrentIndex(idx)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                  isCurrent
                    ? 'ring-2 ring-teal-800 bg-teal-50 border-teal-400 text-teal-950 shadow-xs'
                    : hasAnswer
                    ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                    : 'bg-white border-dashed border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600'
                }`}
              >
                <span>Caso {idx + 1}</span>
                {hasAnswer ? (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      hasAnswer === 'Verde'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasAnswer === 'Verde' ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                    {hasAnswer === 'Verde' ? 'Verde' : 'Rossa'}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-normal">Da fare</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      {activeCase && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-800 text-sm">
                Caso {currentIndex + 1} di {activeCasesList.length}
              </span>
            </div>
            <div>
              {currentAnswer ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  <Check className="w-3.5 h-3.5 text-teal-700" />
                  <span>
                    Risposta impostata:{' '}
                    <strong>{currentAnswer === 'Verde' ? 'Verde (Corretta)' : 'Rossa (Da evitare / Cautela)'}</strong>
                  </span>
                </span>
              ) : (
                <span className="text-slate-400 italic">In attesa di risposta</span>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-3">{activeCase.title}</h3>

          {/* Social post mockup card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
            <div className="flex items-center gap-2.5 mb-3 text-xs">
              <div className="w-7 h-7 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                PA
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Dipendente Pubblico</span>
                <span className="text-slate-500 text-[11px]">
                  Pubblicato su {activeCase.context}
                </span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-slate-800 italic font-serif leading-relaxed bg-white p-4 rounded-lg border border-slate-200">
              {activeCase.quote}
            </p>
          </div>

          {/* Question callout */}
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-900">
              Come classificheresti questo comportamento in base al Codice di Comportamento?
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Seleziona una delle due possibilità. Puoi cambiare la scelta in qualsiasi momento prima dell'invio definitivo.
            </p>
          </div>

          {/* 2 BINARY ACTION BUTTONS: Verde vs Rossa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* 1. VERDE - CORRETTA */}
            <button
              onClick={() => handleInitiateChoice('Verde')}
              disabled={!isLabOpen || isSubmitted}
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                currentAnswer === 'Verde'
                  ? 'ring-2 ring-emerald-600 bg-emerald-50/90 border-emerald-400 shadow-sm'
                  : 'bg-emerald-50/30 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'
              } ${
                !isLabOpen || isSubmitted
                  ? 'cursor-not-allowed opacity-80'
                  : 'cursor-pointer hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 shadow-xs" />
                    <span className="font-extrabold text-emerald-950 text-base">
                      Verde · Corretta
                    </span>
                  </div>
                  {currentAnswer === 'Verde' && (
                    <span className="bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                      Selezionato
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed mt-1">
                  Comportamento lecito, costruttivo e pienamente conforme ai canoni del Codice di
                  Comportamento (libertà di espressione, utilità pubblica, continenza verbale).
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                <span>{currentAnswer === 'Verde' ? '✓ Tua scelta' : 'Clicca per selezionare'}</span>
                {!isSubmitted && isLabOpen && <span>Richiede conferma →</span>}
              </div>
            </button>

            {/* 2. ROSSA - DA EVITARE O CHE RICHIEDE CAUTELA */}
            <button
              onClick={() => handleInitiateChoice('Rosso')}
              disabled={!isLabOpen || isSubmitted}
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                currentAnswer === 'Rosso'
                  ? 'ring-2 ring-rose-600 bg-rose-50/90 border-rose-400 shadow-sm'
                  : 'bg-rose-50/30 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
              } ${
                !isLabOpen || isSubmitted
                  ? 'cursor-not-allowed opacity-80'
                  : 'cursor-pointer hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-rose-600 shadow-xs" />
                    <span className="font-extrabold text-rose-950 text-base">
                      Rossa · Da Evitare o con Cautela
                    </span>
                  </div>
                  {currentAnswer === 'Rosso' && (
                    <span className="bg-rose-200 text-rose-900 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                      Selezionato
                    </span>
                  )}
                </div>
                <p className="text-xs text-rose-900 leading-relaxed mt-1">
                  Comportamento da evitare, vietato, lesivo dell'immagine dell'ente o che richiede specifica cautela/disclaimer per non incorrere in violazione disciplinare.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-rose-200/60 flex items-center justify-between text-[11px] text-rose-800 font-semibold">
                <span>{currentAnswer === 'Rosso' ? '✓ Tua scelta' : 'Clicca per selezionare'}</span>
                {!isSubmitted && isLabOpen && <span>Richiede conferma →</span>}
              </div>
            </button>
          </div>

          {/* Feedback Explanation ONLY visible AFTER the student submits the final test */}
          {isSubmitted && (
            <div
              className={`p-5 rounded-xl border mb-6 animate-fadeIn ${
                currentAnswer === activeCase.category
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-slate-50 border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {currentAnswer === activeCase.category ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-extrabold text-sm block text-slate-900">
                      {currentAnswer === activeCase.category
                        ? 'Esatto! Risposta Corretta.'
                        : `Attenzione: la classificazione del Codice è "${
                            activeCase.category === 'Verde' ? 'Verde (Corretta)' : 'Rossa (Da evitare / Cautela)'
                          }".`}
                    </span>
                    <span className="text-slate-700 font-semibold">
                      Verdetto: {activeCase.verdict}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    <strong>Motivazione Giuridica: </strong>
                    {activeCase.legalBasis}
                  </p>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <strong className="text-teal-900 block mb-0.5">Cosa ricordare in ufficio:</strong>
                    <span className="text-slate-700">{activeCase.practicalAdvice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bidirectional Navigation & Submit Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            {/* Back button */}
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors ${
                currentIndex === 0
                  ? 'text-slate-300 bg-slate-50 cursor-not-allowed border border-slate-100'
                  : 'text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Caso Precedente</span>
            </button>

            {/* Middle summary */}
            <div className="text-xs text-slate-500 font-medium text-center">
              <span>
                Casi risposti: <strong className="text-slate-800">{answeredCount}</strong> di{' '}
                <strong className="text-slate-800">{totalCases}</strong>
              </span>
              {!isSubmitted && answeredCount < totalCases && (
                <span className="text-amber-700 block text-[11px]">
                  (Puoi scorrere avanti e indietro per completare o modificare)
                </span>
              )}
            </div>

            {/* Forward or Submit actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {currentIndex < totalCases - 1 && (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalCases - 1, prev + 1))}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <span>Caso Successivo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Conclude & Submit button (available to submit test) */}
              {!isSubmitted && (
                <button
                  onClick={() => setConfirmSubmitOpen(true)}
                  disabled={!isLabOpen || answeredCount === 0}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm transition-all ${
                    isLabOpen && answeredCount > 0
                      ? 'bg-teal-800 hover:bg-teal-900 text-white cursor-pointer hover:shadow'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title={
                    !isLabOpen
                      ? 'Laboratorio chiuso dal formatore'
                      : answeredCount === 0
                      ? 'Rispondi ad almeno un caso per inviare'
                      : 'Invia definitivamente le tue risposte'
                  }
                >
                  <Send className="w-4 h-4" />
                  <span>Concludi e Invia Risposte</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CONFIRMATION FOR VALIDATING SINGLE CASE ANSWER */}
      {/* ========================================================= */}
      {pendingChoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2.5 rounded-xl ${
                  pendingChoice.choice === 'Verde'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Conferma Selezione Risposta
                </h4>
                <p className="text-xs text-slate-500">
                  Caso {pendingChoice.caseNumber}: «{pendingChoice.caseTitle}»
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border mb-5 bg-slate-50 border-slate-200 text-xs space-y-2">
              <span className="text-slate-600 block">Hai selezionato:</span>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm ${
                  pendingChoice.choice === 'Verde'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    pendingChoice.choice === 'Verde' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
                <span>
                  {pendingChoice.choice === 'Verde'
                    ? 'Verde · Comportamento Corretto'
                    : 'Rossa · Da evitare o che richiede cautela'}
                </span>
              </div>
              <p className="text-slate-500 pt-1 leading-relaxed text-[11px]">
                Confermi questa risposta per questo caso? Potrai comunque modificarla liberamente
                spostandoti avanti e indietro prima dell'invio finale del test.
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setPendingChoice(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleConfirmChoice}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Conferma Risposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: FINAL TEST SUBMISSION CONFIRMATION */}
      {/* ========================================================= */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Invio Definitivo delle Risposte
                </h4>
                <p className="text-xs text-slate-500">
                  Aula: {currentSessionInfo?.label}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Casi risposti:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {answeredCount} su {totalCases}
                  </span>
                </div>
                {answeredCount < totalCases && (
                  <p className="text-amber-800 font-medium text-[11px] pt-1">
                    ⚠️ Attenzione: hai risposto a {answeredCount} su {totalCases} casi.
                    I casi non compilati non riceveranno punteggio.
                  </p>
                )}
              </div>

              <p className="text-slate-600">
                Confermi la conclusione del laboratorio? Dopo aver confermato{' '}
                <strong className="text-rose-900">non sarà più possibile modificare le risposte</strong>,
                e i tuoi dati verranno registrati in modalità anonima nel debriefing d'aula con Pietro Citarella.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                Torna Indietro per Modificare
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Sì, Invia Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
