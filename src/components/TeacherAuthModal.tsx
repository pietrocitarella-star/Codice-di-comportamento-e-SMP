import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff, X } from 'lucide-react';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PIN_STORAGE_KEY = 'pa_social_teacher_pin';

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  if (!isOpen) return null;

  const getStoredPin = () => {
    const stored = localStorage.getItem(PIN_STORAGE_KEY);
    if (!stored || stored === '1234') {
      localStorage.setItem(PIN_STORAGE_KEY, '2204');
      return '2204';
    }
    return stored;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getStoredPin();

    if (pin.trim() === correctPin) {
      setError(false);
      sessionStorage.setItem('pa_social_teacher_authenticated', 'true');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-teal-900 font-bold">
            <div className="p-2 bg-teal-50 rounded-lg border border-teal-200">
              <Lock className="w-4 h-4 text-teal-800" />
            </div>
            <span className="text-sm">Accesso Riservato Docente</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Questa sezione è visibile solo al formatore (Pietro Citarella) per analizzare le risposte
          anonime e guidare la restituzione finale in aula.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inserisci PIN di Sicurezza:
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="PIN (es. 2204)"
                autoFocus
                className={`w-full text-center text-lg tracking-widest font-mono p-2.5 rounded-lg border ${
                  error
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 ring-1 ring-rose-400'
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:ring-1 focus:ring-teal-600'
                } focus:outline-none`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>PIN non corretto. Riprova.</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
              (PIN riservato per il formatore: <strong className="text-slate-600 font-mono">2204</strong>)
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors shadow-sm"
            >
              Accedi al Debriefing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
