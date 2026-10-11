import React from 'react';
import { CertificateData } from '../types';
import { Printer, ArrowLeft, Award, CheckCircle } from 'lucide-react';

interface PrintableCertificateProps {
  data: CertificateData;
  onBack: () => void;
}

export const PrintableCertificate: React.FC<PrintableCertificateProps> = ({ data, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna al Quiz</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Test Superato ({data.score}%)</span>
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-800 rounded-lg hover:bg-teal-900 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Stampa / Salva PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable Certificate Box */}
      <div className="bg-white p-8 sm:p-14 rounded-2xl border-4 border-double border-teal-900 shadow-xl max-w-4xl mx-auto relative overflow-hidden text-slate-900">
        {/* Subtle decorative watermark/seal */}
        <div className="absolute right-8 bottom-8 opacity-5 pointer-events-none">
          <Award className="w-80 h-80 text-teal-900" />
        </div>

        {/* Certificate Header */}
        <div className="text-center space-y-2 mb-8 border-b-2 border-teal-900/30 pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-900 text-white font-bold mb-2">
            <Award className="w-6 h-6" />
          </div>
          <span className="block text-xs uppercase tracking-widest text-teal-800 font-bold">
            Repubblica Italiana · Percorso di Aggiornamento Professionale PA
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-950 font-display tracking-tight">
            ATTESTATO DI COMPLETAMENTO E APPRENDIMENTO
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Corso Formativo: «Uso Consapevole ed Etico dei Social Media nella Pubblica Amministrazione»
          </p>
        </div>

        {/* Body content */}
        <div className="space-y-6 text-center max-w-2xl mx-auto py-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Si attesta con profitto che
          </p>

          <div className="border-b-2 border-teal-800 pb-2 inline-block min-w-[320px]">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-900 font-display">
              {data.studentName || 'Nome e Cognome'}
            </span>
          </div>

          <div className="text-sm text-slate-700 space-y-1">
            <p>
              Inquadrato/a con il ruolo di{' '}
              <strong className="text-slate-900">{data.role || 'Dipendente Pubblico'}</strong>
            </p>
            <p>
              Presso:{' '}
              <strong className="text-slate-900">
                {data.organization || 'Amministrazione di Appartenenza'}
              </strong>
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify mt-6 pt-4 border-t border-slate-200">
            Ha frequentato con esito positivo la verifica di apprendimento sul Codice di Comportamento
            dei Dipendenti Pubblici (D.P.R. 62/2013 integrato dal <strong>D.P.R. 81/2023</strong>), dimostrando
            piena padronanza dei principi di continenza verbale, distinzione tra sfera privata e ruolo
            istituzionale, tutela del segreto d'ufficio e protezione dei dati personali dei cittadini in rete.
          </p>
        </div>

        {/* Signatures and metadata footer */}
        <div className="grid grid-cols-3 gap-6 pt-10 mt-8 border-t border-slate-200 text-xs text-slate-600 items-end">
          <div className="text-left">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Data Emissione</span>
            <span className="font-semibold text-slate-800">{data.issueDate}</span>
            <span className="block text-[10px] text-slate-400 mt-1 font-mono">
              ID Validazione: {data.certificateCode}
            </span>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-teal-800 flex items-center justify-center p-1 mb-1">
              <span className="text-[9px] font-bold text-teal-900 uppercase text-center leading-tight">
                VERIFICA SUPERATA
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Punteggio: {data.score}%</span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Il Formatore / Docente</span>
            <span className="font-serif italic text-base text-slate-800 block mt-2">Pietro Citarella</span>
            <span className="block text-[10px] text-slate-500 border-t border-slate-300 pt-0.5 mt-1 inline-block min-w-[120px]">
              Firma Digitale / Docente Corso
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
