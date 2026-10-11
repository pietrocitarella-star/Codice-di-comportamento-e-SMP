import React from 'react';
import { TabType } from '../types';
import { Download, Award } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenVademecum: () => void;
  completedQuiz: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenVademecum,
  completedQuiz,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly compliant 3-zone Top Bar Contract: Brand - 4-5 Nav Links - 1 Action */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand title wordmark, single-line text */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-display font-bold text-lg sm:text-xl text-teal-900 tracking-tight whitespace-nowrap">
              Social Media PA
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Guida Formativa
            </span>
          </div>

          {/* Zone 2: 4-5 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('guida')}
              className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'guida' ? 'text-teal-900 font-bold border-b-2 border-teal-700' : ''
              }`}
            >
              Guida Interattiva
            </button>
            <button
              onClick={() => setActiveTab('simulatore')}
              className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'simulatore' ? 'text-teal-900 font-bold border-b-2 border-teal-700' : ''
              }`}
            >
              Casi & Semaforo
            </button>
            <button
              onClick={() => setActiveTab('analizzatore')}
              className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'analizzatore' ? 'text-teal-900 font-bold border-b-2 border-teal-700' : ''
              }`}
            >
              Analisi Post & Bio
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 pb-0.5 flex items-center gap-1.5 ${
                activeTab === 'quiz' ? 'text-teal-900 font-bold border-b-2 border-teal-700' : ''
              }`}
            >
              <span>Test & Attestato</span>
              {completedQuiz && (
                <Award className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenVademecum}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-800 rounded-lg hover:bg-teal-900 transition-colors shadow-sm whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Vademecum PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 overflow-x-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('guida')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'guida' ? 'text-teal-900 font-bold bg-teal-50' : ''}`}
          >
            Guida
          </button>
          <button
            onClick={() => setActiveTab('simulatore')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'simulatore' ? 'text-teal-900 font-bold bg-teal-50' : ''}`}
          >
            Semaforo
          </button>
          <button
            onClick={() => setActiveTab('analizzatore')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'analizzatore' ? 'text-teal-900 font-bold bg-teal-50' : ''}`}
          >
            Analisi Post
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'quiz' ? 'text-teal-900 font-bold bg-teal-50' : ''}`}
          >
            Test Attestato
          </button>
        </div>
      </div>
    </header>
  );
};
