import React, { useState } from 'react';
import {
  CORE_PRINCIPLES,
  CANONS_DATA,
  CONTEXT_COMPARISON,
  TRAFFIC_LIGHT_CASES,
  VADEMECUM_ROWS,
} from '../data/courseData';
import {
  RiskLevelsChart,
  SourcesDoughnutChart,
  ResponsibilityStackChart,
} from './InteractiveCharts';
import {
  MessageSquare,
  ShieldCheck,
  ThumbsUp,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TabType } from '../types';

interface GuideSectionProps {
  onGoToSimulator: () => void;
  onGoToQuiz: () => void;
  onOpenVademecum: () => void;
}

export const GuideSection: React.FC<GuideSectionProps> = ({
  onGoToSimulator,
  onGoToQuiz,
  onOpenVademecum,
}) => {
  const [selectedCanon, setSelectedCanon] = useState<number | null>(1);
  const [trafficFilter, setTrafficFilter] = useState<'All' | 'Verde' | 'Giallo' | 'Rosso'>('All');
  const [vademecumSearch, setVademecumSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Quick risk simulation state
  const [channelType, setChannelType] = useState<'chat' | 'group' | 'profile' | 'public'>('profile');
  const [hasMention, setHasMention] = useState<boolean>(true);
  const [hasDisclaimer, setHasDisclaimer] = useState<boolean>(false);
  const [postTone, setPostTone] = useState<'calm' | 'polemic' | 'aggressive'>('polemic');

  const calculateQuickRisk = () => {
    let score = 2;
    if (channelType === 'chat') score = 1;
    if (channelType === 'group') score = 3;
    if (channelType === 'profile') score = 5;
    if (channelType === 'public') score = 7;

    if (hasMention) score += 1.5;
    if (!hasDisclaimer && (channelType === 'profile' || channelType === 'public')) score += 1.5;
    if (postTone === 'polemic') score += 2;
    if (postTone === 'aggressive') score += 4;

    return Math.min(10, Math.max(1, score));
  };

  const riskScore = calculateQuickRisk();

  const filteredTrafficCases = TRAFFIC_LIGHT_CASES.filter((c) => {
    if (trafficFilter === 'All') return true;
    return c.category === trafficFilter;
  });

  const filteredVademecum = VADEMECUM_ROWS.filter(
    (row) =>
      row.area.toLowerCase().includes(vademecumSearch.toLowerCase()) ||
      row.consentito.toLowerCase().includes(vademecumSearch.toLowerCase()) ||
      row.vietato.toLowerCase().includes(vademecumSearch.toLowerCase())
  );

  const getPrincipleIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-teal-300" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-teal-300" />;
      case 'ThumbsUp':
        return <ThumbsUp className="w-5 h-5 text-teal-300" />;
      case 'Lock':
        return <Lock className="w-5 h-5 text-teal-300" />;
      default:
        return <MessageSquare className="w-5 h-5 text-teal-300" />;
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-teal-950 via-slate-900 to-teal-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg border border-teal-800/40">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-2">
              <span>Percorso Formativo PA</span>
              <span aria-hidden="true">·</span>
              <span>D.P.R. 62/2013 & D.P.R. 81/2023</span>
              <span aria-hidden="true">·</span>
              <span>Linee Guida Nazionali</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Social Media & Lavoro Pubblico
            </h1>
            <p className="text-teal-100 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
              Guida pratica e interattiva all'uso consapevole dei canali digitali: come esprimere
              le proprie opinioni in rete, interagire con i cittadini e tutelare l'immagine della
              propria amministrazione senza rischi disciplinari.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 min-w-[280px] lg:max-w-xs text-left w-full lg:w-auto shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                Esercitazione in Evidenza
              </span>
            </div>
            <span className="text-lg sm:text-xl font-extrabold text-white block leading-snug">
              Laboratorio Casi Pratici: Il Semaforo
            </span>
            <p className="text-xs text-teal-100 mt-1.5 leading-relaxed">
              Mettiti alla prova sui dilemmi quotidiani della PA: scopri in diretta se un post, una foto o una chat sono Verde, Giallo o Rosso.
            </p>
            <div className="mt-4 pt-3 border-t border-white/20">
              <button
                onClick={onGoToSimulator}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Avvia Laboratorio Casi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          {CORE_PRINCIPLES.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl border border-white/10"
            >
              <div className="p-2 bg-teal-500/20 rounded-lg w-fit mb-3">
                {getPrincipleIcon(item.icon)}
              </div>
              <h3 className="font-bold text-white text-sm">{item.title}</h3>
              <p className="text-xs font-semibold text-teal-300 mt-0.5">{item.subtitle}</p>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 01. Perché esistono regole per i social network */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold mb-1">
            <span>Modulo 1</span>
            <span aria-hidden="true">·</span>
            <span>Fondamenti Giuridici e Deontologici</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            1. Perché Esistono Regole per i Social Network?
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl">
            Chi lavora al servizio delle istituzioni rappresenta la Pubblica Amministrazione anche nello
            spazio digitale. Le regole non servono a imbavagliare il pensiero, ma a proteggere la fiducia
            del cittadino nelle istituzioni democratiche.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>
              Ogni dipendente pubblico conserva intatto il diritto costituzionale alla libera
              manifestazione del pensiero (art. 21 Cost.). Tuttavia, quando si interviene in una piazza
              telematica pubblica, occorre evitare che la propria opinione personale venga scambiata per
              una presa di posizione ufficiale dell'ente.
            </p>
            <p>
              Il <strong>D.P.R. n. 81 del 2023</strong> ha integrato il Codice di Comportamento dei
              dipendenti pubblici introducendo una specifica disciplina per l'utilizzo dei social media.
              La norma richiede <em>trasparenza, sobrietà e rispetto</em>: distinguere la sfera personale
              da quella d'ufficio e tutelare l'integrità dei dati dei cittadini.
            </p>

            <div className="bg-teal-50/70 rounded-xl p-4 border border-teal-200/80">
              <h3 className="font-bold text-teal-950 text-sm mb-2">
                I Tre Valori Fondamentali in Rete
              </h3>
              <ul className="space-y-2 text-xs text-teal-900">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-700">1. Educazione e Misura:</span>
                  <span>Esporre opinioni e critiche senza scadere in insulti, sarcasmo o toni diffamatori.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-700">2. Trasparenza dell'Identità:</span>
                  <span>Chiarire se si parla a titolo personale e non a nome dell'ufficio attraverso un chiaro disclaimer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-700">3. Protezione dell'Istituzione:</span>
                  <span>I dissidi interni si risolvono tramite i canali istituzionali e sindacali, non con sfoghi pubblici.</span>
                </li>
              </ul>
            </div>

            {/* Interactive Live Risk Calculator widget */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Calcolatore Rapido di Rischio Espositivo
                </h4>
                <span className="text-[11px] text-slate-500">Simulatore istantaneo</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Dove stai pubblicando?</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setChannelType('chat')}
                      className={`py-1 px-2 rounded text-left border ${
                        channelType === 'chat'
                          ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Chat 1-a-1 privata
                    </button>
                    <button
                      onClick={() => setChannelType('group')}
                      className={`py-1 px-2 rounded text-left border ${
                        channelType === 'group'
                          ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Gruppo WhatsApp colleghi
                    </button>
                    <button
                      onClick={() => setChannelType('profile')}
                      className={`py-1 px-2 rounded text-left border ${
                        channelType === 'profile'
                          ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Profilo personale (FB/IG/X)
                    </button>
                    <button
                      onClick={() => setChannelType('public')}
                      className={`py-1 px-2 rounded text-left border ${
                        channelType === 'public'
                          ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Commento a pagina pubblica
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Menzione ente nel profilo?</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setHasMention(true)}
                        className={`flex-1 py-1 rounded text-center border ${
                          hasMention
                            ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        Sì
                      </button>
                      <button
                        onClick={() => setHasMention(false)}
                        className={`flex-1 py-1 rounded text-center border ${
                          !hasMention
                            ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Disclaimer presente?</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setHasDisclaimer(true)}
                        className={`flex-1 py-1 rounded text-center border ${
                          hasDisclaimer
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        Sì
                      </button>
                      <button
                        onClick={() => setHasDisclaimer(false)}
                        className={`flex-1 py-1 rounded text-center border ${
                          !hasDisclaimer
                            ? 'bg-rose-50 border-rose-600 text-rose-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tono del contenuto:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setPostTone('calm')}
                      className={`py-1 rounded text-center border ${
                        postTone === 'calm'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Misurato / Neutro
                    </button>
                    <button
                      onClick={() => setPostTone('polemic')}
                      className={`py-1 rounded text-center border ${
                        postTone === 'polemic'
                          ? 'bg-amber-50 border-amber-600 text-amber-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Polemico / Sarcastico
                    </button>
                    <button
                      onClick={() => setPostTone('aggressive')}
                      className={`py-1 rounded text-center border ${
                        postTone === 'aggressive'
                          ? 'bg-rose-50 border-rose-600 text-rose-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Offensivo / Sfogato
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">Livello di Rischio Stimato: </span>
                    <span
                      className={`font-bold font-mono ${
                        riskScore <= 3
                          ? 'text-emerald-700'
                          : riskScore <= 6
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {riskScore.toFixed(1)} / 10 (
                      {riskScore <= 3
                        ? 'Basso'
                        : riskScore <= 6
                        ? 'Moderato / Cautela'
                        : 'Elevato / Critico'}
                      )
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <RiskLevelsChart />
          </div>
        </div>
      </section>

      {/* 02. Mappa dei Contesti */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold mb-1">
            <span>Modulo 2</span>
            <span aria-hidden="true">·</span>
            <span>Spazio Privato vs Spazio Pubblico</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            2. Mappa dei Contesti: Dove Sei Quando Scrivi?
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl">
            Non tutte le piattaforme online sono equiparabili. Esiste un confine giuridico fondamentale
            tra una conversazione privata e una bacheca esposta al pubblico.
          </p>
        </div>

        {/* Private vs Public comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-teal-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {CONTEXT_COMPARISON.private.title}
                </h3>
                <span className="text-xs text-teal-700 font-medium">
                  {CONTEXT_COMPARISON.private.platforms}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {CONTEXT_COMPARISON.private.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {CONTEXT_COMPARISON.private.scope}
            </p>
            <div className="space-y-2 mb-4">
              {CONTEXT_COMPARISON.private.rules.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-900">Nota operativa: </strong>
              {CONTEXT_COMPARISON.private.alert}
            </div>
          </div>

          <div className="p-6 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-teal-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {CONTEXT_COMPARISON.public.title}
                </h3>
                <span className="text-xs text-rose-700 font-medium">
                  {CONTEXT_COMPARISON.public.platforms}
                </span>
              </div>
              <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {CONTEXT_COMPARISON.public.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {CONTEXT_COMPARISON.public.scope}
            </p>
            <div className="space-y-2 mb-4">
              {CONTEXT_COMPARISON.public.rules.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-900">Nota operativa: </strong>
              {CONTEXT_COMPARISON.public.alert}
            </div>
          </div>
        </div>

        {/* 4 Canons & Sources Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                I Quattro Canoni della Comunicazione Consapevole
              </h3>
              <span className="text-xs text-slate-500">Seleziona per dettagli</span>
            </div>

            <div className="space-y-3">
              {CANONS_DATA.map((canon) => {
                const isSelected = selectedCanon === canon.id;
                return (
                  <div
                    key={canon.id}
                    onClick={() => setSelectedCanon(isSelected ? null : canon.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/50 border-teal-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs font-bold font-mono">
                          {canon.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{canon.title}</h4>
                      </div>
                      <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded">
                        {canon.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {canon.description}
                    </p>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-teal-200/60 text-xs text-teal-900 bg-white/80 p-2.5 rounded-lg animate-fadeIn">
                        <strong>Consiglio pratico in servizio: </strong>
                        {canon.practicalTip}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6">
            <SourcesDoughnutChart />
          </div>
        </div>
      </section>

      {/* 03. Semaforo della Condotta Online */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold mb-1">
              <span>Modulo 3</span>
              <span aria-hidden="true">·</span>
              <span>Casi Operativi e Responsabilità</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              3. Semaforo della Condotta Online
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Esempi quotidiani concreti: cosa è pienamente consentito, cosa richiede cautela e cosa è vietato.
            </p>
          </div>

          {/* Traffic light category filter buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setTrafficFilter('All')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                trafficFilter === 'All'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tutti
            </button>
            <button
              onClick={() => setTrafficFilter('Verde')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                trafficFilter === 'Verde'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Verde
            </button>
            <button
              onClick={() => setTrafficFilter('Giallo')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                trafficFilter === 'Giallo'
                  ? 'bg-amber-500 text-white shadow-sm font-bold'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Giallo
            </button>
            <button
              onClick={() => setTrafficFilter('Rosso')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                trafficFilter === 'Rosso'
                  ? 'bg-rose-600 text-white shadow-sm font-bold'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Rosso
            </button>
          </div>
        </div>

        {/* Spotlight Banner to Interactive Cases Laboratory */}
        <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-emerald-500/10 border border-teal-300/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 bg-white/90 px-2 py-0.5 rounded border border-teal-200">
                Esercitazione Pratica Interattiva
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Laboratorio Casi Pratici: Il Semaforo della PA
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Vuoi testare in prima persona questi dilemmi e scoprire se avresti preso la decisione corretta?
            </p>
          </div>
          <button
            onClick={onGoToSimulator}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shrink-0 whitespace-nowrap"
          >
            <span>Avvia Laboratorio Casi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Traffic Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {filteredTrafficCases.map((item) => {
            const isGreen = item.category === 'Verde';
            const isYellow = item.category === 'Giallo';
            const isRed = item.category === 'Rosso';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  isGreen
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isYellow
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isGreen ? 'bg-emerald-600' : isYellow ? 'bg-amber-500' : 'bg-rose-600'
                        }`}
                      />
                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${
                          isGreen
                            ? 'text-emerald-800'
                            : isYellow
                            ? 'text-amber-800'
                            : 'text-rose-800'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                      {item.context}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-2">{item.title}</h3>
                  <div className="p-3 bg-white/90 rounded-lg border border-slate-200 mb-3 text-xs italic text-slate-700">
                    {item.quote}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mb-1">
                    Esito: {item.verdict}
                  </p>
                  <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                    <strong>Motivazione:</strong> {item.legalBasis}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-700 bg-white/60 p-2 rounded">
                  <span className="font-bold text-slate-900">Regola pratica: </span>
                  {item.practicalAdvice}
                </div>
              </div>
            );
          })}
        </div>

        {/* Roles Responsibility Chart + Alternative Official Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-slate-200">
          <div className="lg:col-span-7">
            <ResponsibilityStackChart />
          </div>

          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Se c'è un problema in ufficio: i 3 canali corretti
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Il Codice di Comportamento vieta di usare i social network per denigrare l'ente o i colleghi.
              Se riscontri inefficienze o illeciti, questi sono gli strumenti deputati:
            </p>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Segnalazione Gerarchica Interna
                </h4>
              </div>
              <p className="text-xs text-slate-600 ml-7">
                Comunica disfunzioni, carenze di risorse o problemi procedurali al tuo responsabile di
                settore, posizione organizzativa o dirigente di riferimento.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Rappresentanze Sindacali (RSU)
                </h4>
              </div>
              <p className="text-xs text-slate-600 ml-7">
                Per questioni attinenti all'organizzazione del lavoro, carichi, sicurezza, orari o accordi
                di secondo livello, il confronto avviene tramite i tavoli sindacali.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Whistleblowing (D.Lgs. 24/2023)
                </h4>
              </div>
              <p className="text-xs text-slate-600 ml-7">
                In caso di illeciti penali, corruzione, gravi violazioni o spreco di denaro pubblico, utilizza
                la piattaforma informatica crittografata dell'ente per la tutela assoluta dell'identità.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 04. Vademecum del Dipendente Consapevole */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold mb-1">
              <span>Modulo 4</span>
              <span aria-hidden="true">·</span>
              <span>Vademecum Operativo</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              4. Vademecum del Dipendente Consapevole
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Tabella di sintesi per consultazione immediata prima di qualsiasi pubblicazione online.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cerca argomento o azione..."
                value={vademecumSearch}
                onChange={(e) => setVademecumSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
            <button
              onClick={onOpenVademecum}
              className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap"
            >
              Stampa Scheda
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-800 border-b border-slate-200 font-bold">
                <th className="p-3.5 whitespace-nowrap">Ambito di Attività</th>
                <th className="p-3.5 text-emerald-800">Cosa è Consentito</th>
                <th className="p-3.5 text-rose-800">Cosa è Vietato</th>
                <th className="p-3.5 text-slate-700 hidden lg:table-cell">Consiglio Pratico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredVademecum.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap align-top">
                    {row.area}
                  </td>
                  <td className="p-3.5 text-slate-700 align-top">
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{row.consentito}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-700 align-top">
                    <div className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">✕</span>
                      <span>{row.vietato}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-500 align-top hidden lg:table-cell italic">
                    {row.consiglio}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Motivational summary card */}
        <div className="p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-xl text-center">
          <p className="text-sm sm:text-base font-bold mb-1.5">
            «La reputazione dell'amministrazione è costruita ogni giorno dal lavoro di ciascuno di noi.»
          </p>
          <p className="text-xs text-teal-200 max-w-2xl mx-auto leading-relaxed">
            La trasparenza, la misura e il rispetto sul web non tutelano solo l'amministrazione,
            ma prima di tutto la dignità professionale del lavoro pubblico al servizio della collettività.
          </p>
        </div>
      </section>
    </div>
  );
};
