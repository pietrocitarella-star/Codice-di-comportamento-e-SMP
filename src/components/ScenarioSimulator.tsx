import React, { useState, useEffect } from 'react';
import { TrafficLightCase, ClassroomSessionId } from '../types';
import { TRAFFIC_LIGHT_CASES } from '../data/courseData';
import { debriefingService, CLASSROOM_SESSIONS } from '../services/debriefingService';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  Calendar,
} from 'lucide-react';

// Helper function to smartly shuffle and interleave cases so Verde, Giallo and Rosso don't repeat consecutively
function smartShuffleCases(casesList: TrafficLightCase[]): TrafficLightCase[] {
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const greens = shuffleArray(casesList.filter((c) => c.category === 'Verde'));
  const yellows = shuffleArray(casesList.filter((c) => c.category === 'Giallo'));
  const reds = shuffleArray(casesList.filter((c) => c.category === 'Rosso'));

  const result: TrafficLightCase[] = [];
  const maxLen = Math.max(greens.length, yellows.length, reds.length);

  // Randomize initial starting color sequence to prevent any predictability
  const orders: ('Verde' | 'Giallo' | 'Rosso')[][] = [
    ['Verde', 'Rosso', 'Giallo'],
    ['Giallo', 'Verde', 'Rosso'],
    ['Rosso', 'Giallo', 'Verde'],
    ['Verde', 'Giallo', 'Rosso'],
    ['Giallo', 'Rosso', 'Verde'],
    ['Rosso', 'Verde', 'Giallo'],
  ];
  const chosenOrder = orders[Math.floor(Math.random() * orders.length)];

  for (let i = 0; i < maxLen; i++) {
    for (const cat of chosenOrder) {
      if (cat === 'Verde' && greens.length > 0) result.push(greens.pop()!);
      if (cat === 'Giallo' && yellows.length > 0) result.push(yellows.pop()!);
      if (cat === 'Rosso' && reds.length > 0) result.push(reds.pop()!);
    }
  }

  // Append any leftovers
  while (greens.length > 0) result.push(greens.pop()!);
  while (yellows.length > 0) result.push(yellows.pop()!);
  while (reds.length > 0) result.push(reds.pop()!);

  return result;
}

export const ScenarioSimulator: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userChoice, setUserChoice] = useState<'Verde' | 'Giallo' | 'Rosso' | null>(null);
  const [solvedCases, setSolvedCases] = useState<Record<string, { choice: string; isCorrect: boolean }>>({});
  const [selectedContext, setSelectedContext] = useState<string>('All');
  const [currentSessionId, setCurrentSessionId] = useState<ClassroomSessionId>(() =>
    debriefingService.getActiveSessionId()
  );
  const [activeCasesList, setActiveCasesList] = useState<TrafficLightCase[]>(() =>
    smartShuffleCases(TRAFFIC_LIGHT_CASES)
  );

  const contexts = ['All', 'Bacheca Pubblica', 'Gruppo WhatsApp', 'LinkedIn', 'Foto & Storie', 'Commenti ai Media'];

  // Listen to active session changes from teacher
  useEffect(() => {
    const unsub = debriefingService.onUpdate(() => {
      setCurrentSessionId(debriefingService.getActiveSessionId());
    });
    return () => unsub();
  }, []);

  // When context filter changes, update and shuffle
  useEffect(() => {
    let pool = TRAFFIC_LIGHT_CASES;
    if (selectedContext !== 'All') {
      pool = TRAFFIC_LIGHT_CASES.filter((c) => c.context === selectedContext);
    }
    setActiveCasesList(smartShuffleCases(pool));
    setCurrentIndex(0);
    setUserChoice(null);
  }, [selectedContext]);

  const handleShuffleCases = () => {
    let pool = TRAFFIC_LIGHT_CASES;
    if (selectedContext !== 'All') {
      pool = TRAFFIC_LIGHT_CASES.filter((c) => c.context === selectedContext);
    }
    setActiveCasesList(smartShuffleCases(pool));
    setCurrentIndex(0);
    setUserChoice(null);
  };

  const activeCase = activeCasesList[currentIndex] || activeCasesList[0];

  const handleSelectCategory = (choice: 'Verde' | 'Giallo' | 'Rosso') => {
    if (userChoice !== null) return; // already answered
    const isCorrect = choice === activeCase.category;
    setUserChoice(choice);
    setSolvedCases((prev) => ({
      ...prev,
      [activeCase.id]: { choice, isCorrect },
    }));
    // Record anonymous answer for classroom debriefing in the active classroom session
    debriefingService.recordAnswer(activeCase.id, choice, currentSessionId);
  };

  const handleNext = () => {
    setUserChoice(null);
    if (currentIndex < activeCasesList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleReset = () => {
    setUserChoice(null);
    setCurrentIndex(0);
    setSolvedCases({});
    handleShuffleCases();
  };

  const totalAnswered = Object.keys(solvedCases).length;
  const totalCorrect = Object.values(solvedCases).filter((v) => v.isCorrect).length;

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
              Palestra interattiva di decisione: mettiti alla prova con situazioni e dilemmi reali affrontati
              quotidianamente dai dipendenti pubblici. Assegna il semaforo (Verde, Giallo o Rosso) e confronta la tua scelta con la motivazione del Codice di Comportamento.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Precisione</span>
              <span className="font-mono tabular-nums text-lg font-bold text-teal-900">
                {totalAnswered > 0 ? `${Math.round((totalCorrect / totalAnswered) * 100)}%` : '—'}
              </span>
              <span className="text-[11px] text-slate-500 block">
                ({totalCorrect} su {totalAnswered})
              </span>
            </div>
            {totalAnswered > 0 && (
              <button
                onClick={handleReset}
                title="Ricomincia simulazione"
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter by context and Classroom session */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="font-medium text-slate-600 shrink-0">Filtra per canale:</span>
            {contexts.map((ctx) => (
              <button
                key={ctx}
                onClick={() => {
                  setSelectedContext(ctx);
                  setCurrentIndex(0);
                  setUserChoice(null);
                }}
                className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
                  selectedContext === ctx
                    ? 'bg-teal-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ctx === 'All' ? 'Tutti i Canali' : ctx}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-teal-50/80 text-teal-900 px-3 py-1 rounded-lg border border-teal-200/80 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-teal-800 shrink-0" />
            <span className="font-semibold text-slate-600">Aula:</span>
            <select
              value={currentSessionId}
              onChange={(e) => setCurrentSessionId(e.target.value as ClassroomSessionId)}
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

      {/* Main Interactive Stage */}
      {activeCase && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-800">
                Caso {currentIndex + 1} di {activeCasesList.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>Canale: {activeCase.context}</span>
            </div>
            {solvedCases[activeCase.id] && (
              <span
                className={`font-semibold ${
                  solvedCases[activeCase.id].isCorrect ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {solvedCases[activeCase.id].isCorrect ? '✓ Risolto Correttamente' : '✕ Errato al primo tentativo'}
              </span>
            )}
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
          <p className="text-sm font-bold text-slate-900 mb-4">
            Come classificheresti questo comportamento in base al Codice di Comportamento?
          </p>

          {/* 3 Traffic Light Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => handleSelectCategory('Verde')}
              disabled={userChoice !== null}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                userChoice === 'Verde'
                  ? 'ring-2 ring-emerald-600 bg-emerald-50 border-emerald-400'
                  : 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
              } ${userChoice !== null ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
                <span className="font-bold text-emerald-900 text-sm">Verde - Consentito</span>
              </div>
              <p className="text-xs text-emerald-800">
                Critica costruttiva, informazione utile o comunicazione lecita.
              </p>
            </button>

            <button
              onClick={() => handleSelectCategory('Giallo')}
              disabled={userChoice !== null}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                userChoice === 'Giallo'
                  ? 'ring-2 ring-amber-500 bg-amber-50 border-amber-400'
                  : 'bg-amber-50/40 border-amber-200 hover:bg-amber-50'
              } ${userChoice !== null ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                <span className="font-bold text-amber-900 text-sm">Giallo - Serve Cautela</span>
              </div>
              <p className="text-xs text-amber-800">
                Area grigia, richiede disclaimer o può sfociare in violazione.
              </p>
            </button>

            <button
              onClick={() => handleSelectCategory('Rosso')}
              disabled={userChoice !== null}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                userChoice === 'Rosso'
                  ? 'ring-2 ring-rose-600 bg-rose-50 border-rose-400'
                  : 'bg-rose-50/40 border-rose-200 hover:bg-rose-50'
              } ${userChoice !== null ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600" />
                <span className="font-bold text-rose-900 text-sm">Rosso - Da Evitare</span>
              </div>
              <p className="text-xs text-rose-800">
                Lesione del decoro, insulti, violazione privacy o segreto d'ufficio.
              </p>
            </button>
          </div>

          {/* Feedback Explanation Drawer when user answered */}
          {userChoice && (
            <div
              className={`p-5 rounded-xl border mb-6 animate-fadeIn ${
                userChoice === activeCase.category
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-slate-50 border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {userChoice === activeCase.category ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-extrabold text-sm block text-slate-900">
                      {userChoice === activeCase.category
                        ? 'Esatto! Risposta Corretta.'
                        : `Attenzione: la classificazione corretta è "${activeCase.category}".`}
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

          {/* Next button */}
          {userChoice && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
              >
                <span>Prossimo Caso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
