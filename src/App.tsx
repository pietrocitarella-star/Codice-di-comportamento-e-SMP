import React, { useState } from 'react';
import { TabType } from './types';
import { Header } from './components/Header';
import { GuideSection } from './components/GuideSection';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { PostChecker } from './components/PostChecker';
import { QuizSection } from './components/QuizSection';
import { VademecumModal } from './components/VademecumModal';
import { BookOpen, HelpCircle, FileCheck, Award, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('guida');
  const [isVademecumOpen, setIsVademecumOpen] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVademecum={() => setIsVademecumOpen(true)}
        completedQuiz={hasCompletedQuiz}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Course quick progress bar & modules switcher for tablets and desktop */}
        <div className="no-print hidden sm:flex items-center justify-between p-2 mb-6 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('guida')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'guida'
                  ? 'bg-teal-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Guida & Infografica</span>
            </button>
            <button
              onClick={() => setActiveTab('simulatore')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'simulatore'
                  ? 'bg-teal-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>2. Casi Pratici (Semaforo)</span>
            </button>
            <button
              onClick={() => setActiveTab('analizzatore')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'analizzatore'
                  ? 'bg-teal-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>3. Analisi Post & Bio Disclaimer</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'quiz'
                  ? 'bg-teal-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>4. Test & Attestato</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 pr-2">
            <span>Docente: </span>
            <strong className="text-slate-800">Pietro Citarella</strong>
          </div>
        </div>

        {/* View Switcher */}
        {activeTab === 'guida' && (
          <GuideSection
            onGoToSimulator={() => setActiveTab('simulatore')}
            onGoToQuiz={() => setActiveTab('quiz')}
            onOpenVademecum={() => setIsVademecumOpen(true)}
          />
        )}

        {activeTab === 'simulatore' && <ScenarioSimulator />}

        {activeTab === 'analizzatore' && <PostChecker />}

        {activeTab === 'quiz' && (
          <QuizSection onQuizCompleted={() => setHasCompletedQuiz(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-900 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-sm">
              <Shield className="w-4 h-4 text-teal-400" />
              <span>Social Media & Lavoro Pubblico</span>
            </div>
            <p className="text-slate-400 max-w-xl text-[11px] leading-relaxed">
              Guida Formativa interattiva per il personale della Pubblica Amministrazione. Basata sui principi
              del Codice di Comportamento dei Dipendenti Pubblici (D.P.R. 62/2013 e D.P.R. 81/2023).
            </p>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400">
            <p>Progetto formativo a cura di Pietro Citarella</p>
            <p className="text-slate-500 mt-0.5">Disponibile per la formazione continua e l'aggiornamento PA</p>
          </div>
        </div>
      </footer>

      {/* Vademecum Modal */}
      <VademecumModal
        isOpen={isVademecumOpen}
        onClose={() => setIsVademecumOpen(false)}
      />
    </div>
  );
}
