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

          {/* Zone 2: Clean single-line nav links for available sections */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('guida')}
              className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'guida' ? 'text-teal-900 font-bold border-b-2 border-teal-700' : ''
              }`}
            >
              Guida & Infografica
            </button>
            <button
              onClick={() => setActiveTab('simulatore')}
              className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 pb-0.5 flex items-center gap-2 ${
                activeTab === 'simulatore' ? 'text-teal-900 font-bold border-b-2 border-teal-700' : ''
              }`}
            >
              <span>Laboratorio Casi Pratici: Il Semaforo</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                In Evidenza
              </span>
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
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('guida')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'guida' ? 'text-teal-900 font-bold bg-teal-50' : ''
            }`}
          >
            Guida & Infografica
          </button>
          <button
            onClick={() => setActiveTab('simulatore')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'simulatore' ? 'text-teal-900 font-bold bg-teal-50' : ''
            }`}
          >
            <span>Laboratorio Casi (Semaforo)</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
