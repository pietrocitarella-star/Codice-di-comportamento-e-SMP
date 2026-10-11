import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/courseData';
import { CertificateData } from '../types';
import { PrintableCertificate } from './PrintableCertificate';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface QuizSectionProps {
  onQuizCompleted: () => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ onQuizCompleted }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCertificateView, setShowCertificateView] = useState(false);

  // Learner input data for certificate
  const [studentName, setStudentName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Istruttore Amministrativo');
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

  const activeQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const selectedOptionId = answers[activeQuestion.id];

  const handleSelectOption = (optionId: string) => {
    if (answers[activeQuestion.id]) return; // prevent changing after seeing feedback

    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: optionId,
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const selected = answers[q.id];
      const correctOption = q.options.find((opt) => opt.isCorrect);
      if (selected && correctOption && selected === correctOption.id) {
        correctCount += 1;
      }
    });
    return Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // finish quiz
      setIsSubmitted(true);
      const score = calculateScore();
      if (score >= 70) {
        onQuizCompleted();
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas confetti fails in environment
        }
      }
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setShowCertificateView(false);
    setCertificateData(null);
  };

  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !organization.trim()) return;

    const score = calculateScore();
    const uniqueId = `PA-SM-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const today = new Date().toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const cert: CertificateData = {
      studentName,
      organization,
      role,
      issueDate: today,
      score,
      certificateCode: uniqueId,
    };

    setCertificateData(cert);
    setShowCertificateView(true);
  };

  if (showCertificateView && certificateData) {
    return (
      <PrintableCertificate
        data={certificateData}
        onBack={() => setShowCertificateView(false)}
      />
    );
  }

  const score = calculateScore();
  const passed = score >= 70;

  return (
    <div className="space-y-8 pb-16">
      {/* Quiz Introduction Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold mb-1">
              <span>Verifica di Apprendimento</span>
              <span aria-hidden="true">·</span>
              <span>Test Finale Formativo</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Test di Autovalutazione & Attestato di Frequenza
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Rispondi a 6 quesiti basati su casi reali e sulle norme del D.P.R. 81/2023. Con un punteggio
              pari o superiore al 70% potrai generare e stampare il tuo Attestato Formativo Nominativo.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600">Progresso:</span>
            <span className="font-mono font-bold text-xs text-teal-900">
              {Object.keys(answers).length} / {QUIZ_QUESTIONS.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
          <div
            className="h-full bg-teal-800 transition-all duration-300"
            style={{
              width: `${(Object.keys(answers).length / QUIZ_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {!isSubmitted ? (
        /* Active Question Card */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
            <span className="font-bold text-teal-800">
              Domanda {currentQuestionIndex + 1} di {QUIZ_QUESTIONS.length}
            </span>
            <span>Ambito: {activeQuestion.context}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 leading-snug">
            {activeQuestion.question}
          </h3>

          {/* Options list */}
          <div className="space-y-3 mb-6">
            {activeQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const hasAnswered = Boolean(selectedOptionId);

              let optionClasses = 'bg-slate-50 border-slate-200 hover:bg-slate-100';
              if (hasAnswered) {
                if (option.isCorrect) {
                  optionClasses = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium';
                } else if (isSelected && !option.isCorrect) {
                  optionClasses = 'bg-rose-50 border-rose-300 text-rose-950';
                } else {
                  optionClasses = 'bg-slate-50 border-slate-200 opacity-60';
                }
              }

              return (
                <button
                  key={option.id}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(option.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${optionClasses} ${
                    !hasAnswered ? 'cursor-pointer hover:border-teal-400' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5 ${
                      hasAnswered && option.isCorrect
                        ? 'bg-emerald-700 text-white'
                        : hasAnswered && isSelected && !option.isCorrect
                        ? 'bg-rose-700 text-white'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    {option.id}
                  </span>
                  <div className="flex-1 text-xs sm:text-sm text-slate-800">
                    <p>{option.text}</p>
                    {hasAnswered && (isSelected || option.isCorrect) && (
                      <p className="mt-2 text-xs text-slate-600 bg-white/70 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        <strong>
                          {option.isCorrect ? 'Perché è corretta:' : 'Perché non è corretta:'}
                        </strong>{' '}
                        {option.explanation}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next / Submit question action */}
          {selectedOptionId && (
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
              >
                <span>
                  {currentQuestionIndex < QUIZ_QUESTIONS.length - 1
                    ? 'Prossima Domanda'
                    : 'Visualizza Risultato Finale'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Results and Certificate Generator */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 text-center">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {passed ? <Award className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              {passed ? 'Complimenti! Hai superato la verifica.' : 'Verifica non superata.'}
            </h3>

            <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
              Hai risposto correttamente al{' '}
              <strong className="text-slate-900 font-mono text-base">{score}%</strong> delle domande.
              {passed
                ? ' Hai dimostrato una solida conoscenza delle regole di comportamento online per i dipendenti pubblici.'
                : ' È richiesto almeno il 70% per ottenere l\'attestato. Ti suggeriamo di ripassare la guida e riprovare!'}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ripeti il Test</span>
              </button>
            </div>
          </div>

          {/* If passed: Certificate Generation Form */}
          {passed && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold mb-1">
                <span>Rilascio Attestato</span>
                <span aria-hidden="true">·</span>
                <span>Documento Formativo</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Genera il tuo Attestato di Partecipazione
              </h3>
              <p className="text-xs text-slate-600 mb-6">
                Inserisci i tuoi dati per stampare o salvare in PDF l'attestato ufficiale con il tuo nome,
                l'amministrazione di servizio e il punteggio conseguito.
              </p>

              <form onSubmit={handleGenerateCertificate} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome e Cognome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Mario Rossi"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amministrazione / Ente di Appartenenza *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Comune di Milano / ASL Napoli 1 Centro / Ministero dell'Interno"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qualifica o Ruolo Professionale
                  </label>
                  <input
                    type="text"
                    placeholder="Es. Istruttore Amministrativo, Funzionario Tecnico, ecc."
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors mt-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Visualizza e Stampa Attestato</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
