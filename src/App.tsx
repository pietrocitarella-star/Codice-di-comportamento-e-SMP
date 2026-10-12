import React, { useState, useEffect } from 'react';
import { TabType } from './types';
import { Header } from './components/Header';
import { GuideSection } from './components/GuideSection';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { PostChecker } from './components/PostChecker';
import { QuizSection } from './components/QuizSection';
import { VademecumModal } from './components/VademecumModal';
import { TeacherDebriefing } from './components/TeacherDebriefing';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { PrivacyModal } from './components/PrivacyModal';
import { BookOpen, HelpCircle, FileCheck, Award, Shield, Lock, LogOut, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('guida');
  const [isVademecumOpen, setIsVademecumOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);

  // Private teacher authentication state
  const [isTeacherAuthOpen, setIsTeacherAuthOpen] = useState(false);
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('pa_social_teacher_authenticated') === 'true';
      setIsTeacherAuthenticated(auth);
    }
  }, []);

  const handleOpenTeacherArea = () => {
    if (isTeacherAuthenticated) {
      setActiveTab('debriefing');
    } else {
      setIsTeacherAuthOpen(true);
    }
  };

  const handleTeacherAuthSuccess = () => {
    setIsTeacherAuthenticated(true);
    setIsTeacherAuthOpen(false);
    setActiveTab('debriefing');
  };

  const handleTeacherLogout = () => {
    sessionStorage.removeItem('pa_social_teacher_authenticated');
    setIsTeacherAuthenticated(false);
    setActiveTab('guida');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVademecum={() => setIsVademecumOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        completedQuiz={hasCompletedQuiz}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Course quick switcher for tablets and desktop */}
        <div className="no-print hidden sm:flex items-center justify-between p-2 mb-6 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('guida')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
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
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'simulatore'
                  ? 'bg-teal-900 text-white shadow-xs'
                  : 'text-slate-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Laboratorio Casi Pratici: Il Semaforo</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                In Evidenza
              </span>
            </button>

            {/* Teacher tab - visible only when authenticated */}
            {isTeacherAuthenticated && (
              <button
                onClick={() => setActiveTab('debriefing')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'debriefing'
                    ? 'bg-slate-900 text-teal-300 shadow-xs'
                    : 'text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>3. Debriefing Risposte Anonime</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 pr-2">
            <strong className="text-slate-800 font-semibold">Pietro Citarella</strong>
            {isTeacherAuthenticated && (
              <button
                onClick={handleTeacherLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                title="Esci dall'Area Riservata"
              >
                <LogOut className="w-3 h-3" />
                <span>Esci dall'Area Riservata</span>
              </button>
            )}
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

        {activeTab === 'debriefing' && (
          <TeacherDebriefing onLogout={handleTeacherLogout} />
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

          <div className="flex flex-col items-center md:items-end gap-2 text-[11px] text-slate-400">
            <p>Progetto formativo a cura di Pietro Citarella</p>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 pt-0.5">
              {/* Privacy Policy Trigger */}
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-teal-300 transition-colors py-1 px-2.5 rounded hover:bg-slate-800 text-[11px] cursor-pointer"
                title="Informativa sulla privacy: nessun dato personale raccolto"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Informativa Privacy</span>
              </button>

              <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>

              {/* Discrete Teacher Area Access Button */}
              <button
                onClick={handleOpenTeacherArea}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-teal-300 transition-colors py-1 px-2.5 rounded hover:bg-slate-800 text-[11px] cursor-pointer"
                title="Accesso riservato al formatore per il debriefing delle risposte anonime"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {isTeacherAuthenticated
                    ? 'Area Riservata: Debriefing (Aperta)'
                    : 'Area Riservata (PIN)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Vademecum Modal */}
      <VademecumModal
        isOpen={isVademecumOpen}
        onClose={() => setIsVademecumOpen(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Teacher Authentication Modal */}
      <TeacherAuthModal
        isOpen={isTeacherAuthOpen}
        onClose={() => setIsTeacherAuthOpen(false)}
        onSuccess={handleTeacherAuthSuccess}
      />
    </div>
  );
}
