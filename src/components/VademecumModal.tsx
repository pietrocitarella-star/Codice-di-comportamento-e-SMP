import React from 'react';
import { VADEMECUM_ROWS, CANONS_DATA } from '../data/courseData';
import { X, Printer, Download, Check, Shield } from 'lucide-react';

interface VademecumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VademecumModal: React.FC<VademecumModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header - Hidden in Print */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-800" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Vademecum Tascabile del Dipendente Consapevole
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Stampa / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Printable */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs">
          <div className="text-center border-b border-slate-200 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
              Pubblica Amministrazione · Guida Operativa
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display mt-1">
              Vademecum: Social Media e Condotta Digitale
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Linee guida pratiche ai sensi dell'art. 11-bis del D.P.R. 62/2013 (introdotto dal D.P.R. 81/2023)
            </p>
          </div>

          {/* 4 Canons quick recap */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              I 4 Canoni Fondamentali prima di premere "Pubblica"
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CANONS_DATA.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-teal-50/50 border border-teal-200">
                  <span className="font-bold text-teal-950 block">
                    {c.id}. {c.title}
                  </span>
                  <p className="text-[11px] text-teal-800 mt-0.5">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              Tabella di Confronto: Azioni Consentite vs Vietate
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold">
                    <th className="p-2.5">Ambito</th>
                    <th className="p-2.5 text-emerald-800">Cosa è Consentito</th>
                    <th className="p-2.5 text-rose-800">Cosa è Vietato</th>
                    <th className="p-2.5 text-slate-600">Regola Pratica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {VADEMECUM_ROWS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap align-top">
                        {row.area}
                      </td>
                      <td className="p-2.5 text-slate-700 align-top">
                        <span className="text-emerald-700 font-bold mr-1">✓</span>
                        {row.consentito}
                      </td>
                      <td className="p-2.5 text-slate-700 align-top">
                        <span className="text-rose-700 font-bold mr-1">✕</span>
                        {row.vietato}
                      </td>
                      <td className="p-2.5 text-slate-500 italic align-top">{row.consiglio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-[11px] text-slate-600">
            <p>
              Materiale ad uso esclusivo dei corsi di formazione sul Codice di Comportamento dei Dipendenti Pubblici.
              A cura di: Pietro Citarella.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
