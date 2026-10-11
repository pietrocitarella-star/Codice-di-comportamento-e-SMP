import React, { useState } from 'react';
import { DISCLAIMER_TEMPLATES } from '../data/courseData';
import {
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';

export const PostChecker: React.FC = () => {
  const [postDraft, setPostDraft] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Custom Disclaimer generator state
  const [selectedEnte, setSelectedEnte] = useState('Comune');
  const [selectedRole, setSelectedRole] = useState('Istruttore Amministrativo');
  const [selectedPlatform, setSelectedPlatform] = useState('Generale');
  const [customCopied, setCustomCopied] = useState(false);

  const sampleDrafts = [
    {
      title: 'Critica Costruttiva (Corretto)',
      text: 'Pubblicata la graduatoria per i contributi affitto sul sito del Comune. Per chi ha dubbi sulla documentazione ISEE, lo sportello sociale riceve su appuntamento il martedì.',
    },
    {
      title: 'Sfogatoio & Accusa (Violazione)',
      text: 'In questo comune scaldano le sedie e nessuno ha voglia di lavorare! Tutti fannulloni e dirigenti incapaci. #Vergogna #ComuneScandalo',
    },
    {
      title: 'Foto con Rischio Privacy (Grave)',
      text: 'Finalmente pausa caffè dopo aver protocollato 50 pratiche edilizie della ditta Rossi S.r.l.! Ecco la montagna di carte sulla mia scrivania 📸',
    },
    {
      title: 'Opinione Personale da Perfezionare (Serve Disclaimer)',
      text: 'Da funzionario ritengo che la delibera approvata ieri dalla giunta comunale sia un errore strategico per la viabilità del quartiere.',
    },
  ];

  // Analysis logic
  const analyzeDraft = (text: string) => {
    if (!text.trim()) return null;

    const lower = text.toLowerCase();

    // Check aggressive words
    const insults = ['incapaci', 'fannulloni', 'scaldano', 'rubano', 'vergogna', 'incompetenti', 'schifo', 'ladri'];
    const hasInsult = insults.some((w) => lower.includes(w));

    // Check privacy words
    const privacyWords = ['pratiche', 'cartelle', 'foto', 'scrivania', 'documenti', 'bozza', 's.r.l.', 'nominativo', 'codice fiscale'];
    const hasPrivacyRisk = privacyWords.some((w) => lower.includes(w));

    // Check personal vs official ambiguity
    const officialRoleWords = ['da funzionario', 'noi del comune', 'il mio ufficio', 'nostro ente'];
    const mentionsRole = officialRoleWords.some((w) => lower.includes(w));
    const hasDisclaimer = lower.includes('opinioni personali') || lower.includes('parlo a titolo personale');

    let score = 90;
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (hasInsult) {
      score -= 50;
      issues.push('Linguaggio denigratorio o aggressivo verso l\'ente/colleghi.');
      suggestions.push('Sostituisci gli attacchi generici con proposte concrete o usa i canali interni.');
    }

    if (hasPrivacyRisk) {
      score -= 35;
      issues.push('Potenziale violazione di riservatezza (riferimenti a pratiche o documenti d\'ufficio).');
      suggestions.push('Non menzionare mai procedimenti specifici, società o dettagli di lavoro visibili sulla scrivania.');
    }

    if (mentionsRole && !hasDisclaimer) {
      score -= 20;
      issues.push('Parli spendendo la tua qualifica pubblica senza chiarire che è un\'opinione personale.');
      suggestions.push('Aggiungi la precisazione: "Esprimo un pensiero strettamente personale a titolo individuale".');
    }

    let status: 'Verde' | 'Giallo' | 'Rosso' = 'Verde';
    if (score < 50) status = 'Rosso';
    else if (score < 80) status = 'Giallo';

    return {
      score,
      status,
      issues,
      suggestions,
      wordCount: text.trim().split(/\s+/).length,
    };
  };

  const analysis = analyzeDraft(postDraft);

  const handleCopyTemplate = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateCustomDisclaimer = () => {
    switch (selectedPlatform) {
      case 'LinkedIn':
        return `${selectedRole} presso ${selectedEnte} | Le opinioni espresse su questo profilo sono strettamente personali e non riflettono la posizione ufficiale dell'ente.`;
      case 'X (Twitter)':
        return `Dipendente ${selectedEnte} (${selectedRole}). I post riflettono opinioni personali e non impegnano l'amministrazione.`;
      case 'Instagram/Facebook':
        return `Spazio personale. Lavoro presso ${selectedEnte}, ma tutte le opinioni qui condivise sono esclusivamente a titolo individuale.`;
      default:
        return `Profilo personale di ${selectedRole} (${selectedEnte}). I contenuti, commenti e opinioni espresse sono strettamente personali e non impegnano né rappresentano l'amministrazione di appartenenza.`;
    }
  };

  const customDisclaimer = generateCustomDisclaimer();

  const handleCopyCustomDisclaimer = () => {
    navigator.clipboard.writeText(customDisclaimer);
    setCustomCopied(true);
    setTimeout(() => setCustomCopied(false), 2000);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Tool 1: Post Risk Checker */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold mb-1">
            <span>Strumento 1</span>
            <span aria-hidden="true">·</span>
            <span>Audit Preventivo del Contenuto</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Analizzatore di Testo: "Verifica Prima di Pubblicare"
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl">
            Incolla la bozza di un post o di un commento che vorresti pubblicare sui social per
            verificarne la conformità rispetto ai 4 canoni del Codice di Comportamento.
          </p>
        </div>

        {/* Sample clickers */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-700 block mb-2">
            Oppure prova uno di questi esempi tipici della PA:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {sampleDrafts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setPostDraft(s.text)}
                className="p-2.5 text-left rounded-lg bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-400 text-xs text-slate-700 transition-colors"
              >
                <span className="font-bold block text-slate-900 mb-0.5 truncate">{s.title}</span>
                <span className="line-clamp-2 text-slate-500 text-[11px]">{s.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative mb-4">
          <textarea
            rows={4}
            value={postDraft}
            onChange={(e) => setPostDraft(e.target.value)}
            placeholder="Scrivi o incolla qui il testo del tuo post o commento..."
            className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-y"
          />
          {postDraft && (
            <button
              onClick={() => setPostDraft('')}
              className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-600"
              title="Pulisci testo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Audit Results */}
        {analysis ? (
          <div
            className={`p-5 rounded-xl border animate-fadeIn ${
              analysis.status === 'Verde'
                ? 'bg-emerald-50/60 border-emerald-300'
                : analysis.status === 'Giallo'
                ? 'bg-amber-50/60 border-amber-300'
                : 'bg-rose-50/60 border-rose-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                {analysis.status === 'Verde' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {analysis.status === 'Giallo' && (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                {analysis.status === 'Rosso' && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Esito Analisi: {analysis.status} -{' '}
                    {analysis.status === 'Verde'
                      ? 'Testo Adeguato e Rispettoso'
                      : analysis.status === 'Giallo'
                      ? 'Richiede Cautela o Integrazione'
                      : 'Alto Rischio Disciplinare'}
                  </h4>
                  <span className="text-xs text-slate-500">
                    Indice di Sicurezza:{' '}
                    <strong className="font-mono">{analysis.score} / 100</strong>
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  analysis.status === 'Verde'
                    ? 'bg-emerald-200 text-emerald-900'
                    : analysis.status === 'Giallo'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-rose-200 text-rose-900'
                }`}
              >
                Semaforo {analysis.status}
              </span>
            </div>

            {/* Checklist of canons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-2 uppercase tracking-wide">
                  Criticità Rilevate:
                </span>
                {analysis.issues.length === 0 ? (
                  <p className="text-emerald-800 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Nessun elemento lesivo o denigratorio riscontrato.</span>
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-slate-700">
                    {analysis.issues.map((iss, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">✕</span>
                        <span>{iss}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-2 uppercase tracking-wide">
                  Consigli di Riscrittura:
                </span>
                {analysis.suggestions.length === 0 ? (
                  <p className="text-slate-600">
                    Il messaggio rispetta i principi di continenza verbale e non compromette il decoro dell'amministrazione.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-slate-700">
                    {analysis.suggestions.map((sug, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-teal-700 font-bold">›</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            Scrivi una frase o scegli un esempio in alto per avviare il controllo automatico.
          </div>
        )}
      </section>

      {/* Tool 2: Bio Disclaimer Generator */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold mb-1">
            <span>Strumento 2</span>
            <span aria-hidden="true">·</span>
            <span>Tutela del Profilo Personale</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Generatore di Disclaimer per Bio Social
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl">
            Il D.P.R. 81/2023 raccomanda di inserire un'avvertenza (disclaimer) nella bio dei propri
            profili personali quando viene menzionata l'attività lavorativa in una Pubblica Amministrazione.
            Personalizza e copia il testo pronto all'uso con un click.
          </p>
        </div>

        {/* Configuration inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo di Amministrazione:
            </label>
            <select
              value={selectedEnte}
              onChange={(e) => setSelectedEnte(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="Comune">Comune / Città Metropolitana</option>
              <option value="Regione">Regione / Provincia Autonoma</option>
              <option value="Azienda Sanitaria (ASL/AO)">Azienda Sanitaria (ASL / AO)</option>
              <option value="Ministero">Ministero / Agenzia Fiscale</option>
              <option value="Scuola o Università">Scuola / Istituto Scolastico / Università</option>
              <option value="Ente Pubblico non Economico (INPS/INAIL)">Ente Previdenziale (INPS / INAIL)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ruolo o Area Professionale:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="Istruttore Amministrativo">Istruttore Amministrativo</option>
              <option value="Funzionario Specialista">Funzionario / Elevata Qualificazione</option>
              <option value="Agente di Polizia Locale">Agente Polizia Locale</option>
              <option value="Insegnante / Docente">Docente / Personale ATA</option>
              <option value="Personale Sanitario">Infermiere / Medico / Sanitario</option>
              <option value="Dipendente Pubblico">Dipendente Pubblico (Generico)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Piattaforma Destinazione:
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="Generale">Generale (Adatta a tutte)</option>
              <option value="LinkedIn">LinkedIn (Profilo Professionale)</option>
              <option value="X (Twitter)">X / Twitter (Bio Breve)</option>
              <option value="Instagram/Facebook">Instagram / Facebook</option>
            </select>
          </div>
        </div>

        {/* Generated Disclaimer Box */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              Testo Generato per {selectedPlatform}:
            </span>
            <button
              onClick={handleCopyCustomDisclaimer}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              {customCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copiato negli appunti!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copia Testo</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 bg-white p-3.5 rounded-lg border border-slate-200 font-mono">
            {customDisclaimer}
          </p>
        </div>

        {/* Standard templates repository */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
            Altri Modelli Standard di Disclaimer:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DISCLAIMER_TEMPLATES.map((tmpl, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-1">
                    {tmpl.platform}
                  </span>
                  <p className="text-xs text-slate-600 mb-3 italic">«{tmpl.text}»</p>
                </div>
                <button
                  onClick={() => handleCopyTemplate(tmpl.text, idx)}
                  className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 py-1 px-2.5 rounded-md self-end transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copiato</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copia Modello</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
