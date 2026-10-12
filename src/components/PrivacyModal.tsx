import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 rounded-xl text-teal-800 border border-teal-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Informativa Privacy & Trasparenza
                </h3>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Zero Dati Personali
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Social Media e Lavoro Pubblico · Progetto formativo a cura di Pietro Citarella
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-5 space-y-5 text-xs text-slate-700 leading-relaxed pr-1 flex-1">
          {/* Key Statement Box */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 text-sm block mb-1">
                  Principio di Minimizzazione: Nessun Dato Personale Raccolto
                </strong>
                <p className="text-emerald-900">
                  Questa piattaforma formativa è progettata nel rispetto assoluto dei principi di{' '}
                  <em>Privacy by Design</em> e <em>Minimizzazione dei Dati</em> (art. 5 del Regolamento UE 2016/679 - GDPR).{' '}
                  <strong>L'applicazione non raccoglie, non memorizza e non richiede alcun dato personale o identificativo dei partecipanti.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-teal-800" />
              <span>1. Nessuna Registrazione né Profilazione</span>
            </h4>
            <p>
              Per accedere e consultare la guida o per partecipare alle esercitazioni non è richiesta alcuna
              registrazione, creazione di account, né inserimento di nome, cognome, matricola, codice fiscale, indirizzo e-mail
              o numero telefonico. I discenti partecipano alle attività in modo completamente libero e disgiunto dalla propria identità anagrafica.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-800" />
              <span>2. Risposte al Laboratorio e Debriefing Anonimo</span>
            </h4>
            <p>
              Le scelte effettuate durante le simulazioni dei casi pratici (opzione "Verde · Corretta" o "Rossa · Da evitare / Cautela")
              sono trasmesse ed elaborate in <strong>forma rigorosamente anonima</strong>. I dati vengono sommati esclusivamente come
              conteggi statistici aggregati di aula (es. percentuali di risposte per ciascun dilemma) per consentire
              al docente la restituzione e la discussione collettiva (debriefing) durante la lezione.
              Nessun voto è riconducibile al singolo partecipante o al suo specifico dispositivo.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-800" />
              <span>3. Nessun Cookie di Tracciamento o Terze Parti</span>
            </h4>
            <p>
              L'applicazione non utilizza cookie pubblicitari, cookie di profilazione o strumenti di tracciamento invasivi
              (come Google Analytics, Meta Pixel o sistemi di retargeting).
            </p>
            <p>
              Viene utilizzato unicamente lo storage tecnico del browser dell'utente (<em>localStorage</em> e <em>sessionStorage</em>)
              per consentire il funzionamento dell'interfaccia: salvare provvisoriamente le risposte durante l'esercitazione sul proprio dispositivo
              e gestire la sessione protetta con PIN riservata al docente.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-800" />
              <span>4. Finalità Didattica e Titolare del Progetto</span>
            </h4>
            <p>
              Il presente strumento web è stato realizzato a fini esclusivamente didattici, divulgativi e di aggiornamento professionale
              sulle novità del Codice di Comportamento dei Dipendenti Pubblici (D.P.R. 62/2013 integrato dal D.P.R. 81/2023).
            </p>
            <p className="font-medium text-slate-800">
              Progetto formativo a cura di: <strong>Pietro Citarella</strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            Ho compreso e accetto
          </button>
        </div>
      </div>
    </div>
  );
};
