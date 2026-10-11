import React, { useState } from 'react';
import { RISK_CHART_DATA, SOURCES_CHART_DATA, ROLE_RESPONSIBILITIES } from '../data/courseData';
import { Info, HelpCircle } from 'lucide-react';

export const RiskLevelsChart: React.FC = () => {
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  return (
    <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Indice di Cautela per Canale</h4>
          <p className="text-xs text-slate-500">Scala da 1 (Basso rischio) a 10 (Violazione grave)</p>
        </div>
        <span className="text-[11px] text-teal-800 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          Tocca una barra
        </span>
      </div>

      <div className="space-y-3.5">
        {RISK_CHART_DATA.map((item, idx) => {
          const widthPct = (item.value / 10) * 100;
          const isSelected = selectedBar === idx;

          return (
            <div
              key={idx}
              onClick={() => setSelectedBar(isSelected ? null : idx)}
              className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                isSelected ? 'bg-white shadow-sm ring-1 ring-teal-500' : 'hover:bg-white/70'
              }`}
            >
              <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                <span className="text-slate-800">{item.name}</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {item.value.toFixed(1)} / 10
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              {isSelected && (
                <div className="mt-2 text-xs text-slate-600 bg-slate-100/70 p-2 rounded flex items-start gap-1.5 animate-fadeIn">
                  <Info className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Valutazione:</strong> {item.note}. La portata disciplinare dipende dalla
                    dimensione dell'audience e dall'esplicito collegamento con l'amministrazione.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
        <span>🟢 1-3: Zona Protetta</span>
        <span>🟡 4-6: Cautela</span>
        <span>🔴 7-10: Alto Rischio Disciplinare</span>
      </div>
    </div>
  );
};

export const SourcesDoughnutChart: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  // SVG parameters
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Origine delle Segnalazioni</h4>
          <p className="text-xs text-slate-500">Tipologie di infrazioni più frequenti nella PA</p>
        </div>
        <span className="text-[11px] text-slate-500">Dati aggregati</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {SOURCES_CHART_DATA.map((item, idx) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += item.percentage;
              const isSelected = activeIndex === idx;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                  onClick={() => setActiveIndex(idx)}
                />
              );
            })}
          </svg>

          {/* Center text in donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {activeIndex !== null ? (
              <>
                <span className="font-mono tabular-nums text-2xl font-extrabold text-slate-900">
                  {SOURCES_CHART_DATA[activeIndex].percentage}%
                </span>
                <span className="text-[11px] text-slate-500 max-w-[90px] leading-tight mt-0.5">
                  Frequenza
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-500">Tocca una sezione</span>
            )}
          </div>
        </div>

        {/* Legend list */}
        <div className="space-y-2 text-xs">
          {SOURCES_CHART_DATA.map((item, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between gap-2 ${
                  isSelected ? 'bg-white shadow-sm ring-1 ring-slate-300' : 'hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-slate-700 font-medium">{item.label}</span>
                </div>
                <span className="font-mono tabular-nums font-bold text-slate-900 shrink-0">
                  {item.percentage}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ResponsibilityStackChart: React.FC = () => {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(3); // default Dirigenti
  const currentRole = ROLE_RESPONSIBILITIES[selectedRoleIndex];

  return (
    <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Responsabilità e Cautela per Ruoli</h4>
          <p className="text-xs text-slate-500">
            Maggiore è la qualifica, maggiore è il grado di esemplarità richiesto
          </p>
        </div>
        <div className="flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-500">DPR 81/2023</span>
        </div>
      </div>

      {/* Role selector tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-200/70 rounded-lg mb-4">
        {ROLE_RESPONSIBILITIES.map((r, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedRoleIndex(idx)}
            className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all text-center whitespace-nowrap truncate ${
              selectedRoleIndex === idx
                ? 'bg-white text-teal-900 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {r.badge}
          </button>
        ))}
      </div>

      {/* Stacked visualization bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-cyan-800">
            Doveri Generali: {currentRole.generalDuty}%
          </span>
          <span className="text-teal-900">
            Esemplarità Istituzionale: {currentRole.exemplarityDuty}%
          </span>
        </div>
        <div className="h-6 w-full bg-slate-200 rounded-lg overflow-hidden flex">
          <div
            className="h-full bg-cyan-600 transition-all duration-500 flex items-center justify-center text-[11px] font-bold text-white font-mono"
            style={{ width: `${currentRole.generalDuty}%` }}
          >
            {currentRole.generalDuty > 25 ? `${currentRole.generalDuty}%` : ''}
          </div>
          <div
            className="h-full bg-teal-800 transition-all duration-500 flex items-center justify-center text-[11px] font-bold text-white font-mono"
            style={{ width: `${currentRole.exemplarityDuty}%` }}
          >
            {currentRole.exemplarityDuty > 25 ? `${currentRole.exemplarityDuty}%` : ''}
          </div>
        </div>
      </div>

      {/* Role specific guidelines card */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
            Focus: {currentRole.role}
          </h5>
          <span className="text-[11px] text-teal-800 font-medium">
            Standard: {currentRole.exemplarityDuty >= 60 ? 'Rafforzato' : 'Ordinario'}
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-3">{currentRole.description}</p>
        
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
            Cosa richiede la norma:
          </span>
          <ul className="space-y-1 text-xs text-slate-600">
            {currentRole.guidelines.map((g, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-teal-700 font-bold">›</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
