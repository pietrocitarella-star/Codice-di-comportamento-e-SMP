import { AnonymousSubmission, CaseDebriefStats } from '../types';
import { TRAFFIC_LIGHT_CASES } from '../data/courseData';

const STORAGE_KEY = 'pa_social_anonymous_submissions';
const CHANNEL_NAME = 'pa_social_debriefing_channel';

// Pedagogical metadata for each case to guide Pietro's classroom debriefing
const DEBRIEF_METADATA: Record<
  string,
  {
    pitfall: string;
    question: string;
    legalFocus: string;
  }
> = {
  'case-1': {
    pitfall:
      'Alcuni dipendenti temono che qualsiasi critica tecnica sia vietata. In realtà, la critica costruttiva e misurata è tutelata dall\'art. 21 Cost.',
    question:
      '«Qual è il confine tra proporre un miglioramento procedurale e screditare pubblicamente la propria amministrazione?»',
    legalFocus: 'Canone di continenza verbale e pertinenza tecnica (Consiglio di Stato, n. 4112/2021).',
  },
  'case-2': {
    pitfall:
      'Spesso scambiata per propaganda. La condivisione di comunicazioni istituzionali ufficiali e link a bandi aperti è invece una buona prassi.',
    question:
      '«Perché condividere il link al sito istituzionale è sicuro, mentre commentarlo con opinioni soggettive può essere rischioso?»',
    legalFocus: 'Principio di trasparenza e sussidiarietà informativa nella comunicazione pubblica.',
  },
  'case-3': {
    pitfall:
      'Molti corsisti ritengono il "like" un\'azione passiva priva di rilievo. Per i giudici del lavoro equivale invece ad adesione consapevole e amplificazione.',
    question:
      '«Se mettete "Mi Piace" a un post di un cittadino che insulta un dirigente, siete responsabili anche voi?»',
    legalFocus:
      'Cassazione Civile Sez. Lavoro n. 27939/2021: il like o la reaction manifestano adesione al messaggio diffamatorio.',
  },
  'case-4': {
    pitfall:
      'Su LinkedIn o X si indica il nome dell\'ente nella bio ma non si inserisce il disclaimer, ingenerando confusione nell\'utenza.',
    question:
      '«Chi legge il vostro profilo deve capire all\'istante se parla il Comune o se parlate voi come privati cittadini: avete già inserito il disclaimer?»',
    legalFocus: 'Art. 11-bis comma 2, D.P.R. 62/2013 (introdotto dal D.P.R. 81/2023).',
  },
  'case-5': {
    pitfall:
      'Si crede che i gruppi WhatsApp siano sempre "privati". Nei gruppi con oltre 15-20 membri cade la garanzia di corrispondenza protetta.',
    question:
      '«Quante persone ci sono nel vostro gruppo WhatsApp di colleghi? Sapevate che oltre una certa soglia i messaggi possono costituire diffamazione?»',
    legalFocus:
      'Cassazione Penale n. 13653/2021: i gruppi numerosi perdono il carattere di riservatezza personale.',
  },
  'case-6': {
    pitfall:
      'Foto "innocenti" del compleanno o della scrivania piena che mostrano in secondo piano fascicoli con dati di cittadini o planimetrie.',
    question:
      '«Quando scattate una foto in ufficio, avete verificato cosa c\'è sullo schermo del PC o sui fogli stampati accanto al caffè?»',
    legalFocus: 'Violazione art. 5 GDPR (integrità e riservatezza) + violazione del segreto d\'ufficio.',
  },
  'case-7': {
    pitfall:
      'Sfogare la rabbia per il carico di lavoro nei commenti ai giornali locali. È l\'infrazione con il tasso più alto di procedimenti disciplinari.',
    question:
      '«Quali sono i canali corretti da attivare quando nell\'ente ci sono problemi organizzativi o carichi insostenibili?»',
    legalFocus:
      'Dovere di fedeltà e decoro (art. 54 Cost., art. 98 Cost., art. 13 D.P.R. 62/2013). Procedimento disciplinare e querela.',
  },
  'case-8': {
    pitfall:
      'Utilizzare lo stemma o il logo del Comune/ASL come immagine del proprio profilo personale o di un gruppo.',
    question:
      '«Chi ha l\'autorizzazione legale a usare i loghi istituzionali sui social network?»',
    legalFocus: 'Linee guida AGID e Codice di Comportamento: i loghi spettano solo ai canali ufficiali accreditati.',
  },
};

// Singleton BroadcastChannel for cross-tab sync in the browser
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    broadcastChannel = null;
  }
}

export const debriefingService = {
  // Record single anonymous answer
  recordAnswer(caseId: string, choice: 'Verde' | 'Giallo' | 'Rosso'): void {
    if (typeof window === 'undefined') return;

    const submission: AnonymousSubmission = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      caseId,
      choice,
      timestamp: Date.now(),
    };

    const current = this.getSubmissions();
    current.push(submission);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('pa_debriefing_update', { detail: submission }));
      broadcastChannel?.postMessage({ type: 'NEW_SUBMISSION', submission });
    } catch (e) {
      console.warn('Impossibile salvare sottomissione anonima in localStorage', e);
    }
  },

  // Get raw submissions list
  getSubmissions(): AnonymousSubmission[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as AnonymousSubmission[];
    } catch {
      return [];
    }
  },

  // Subscribe to live updates
  onUpdate(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleCustom = () => callback();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) callback();
    };
    const handleBroadcast = (msg: MessageEvent) => {
      if (msg.data?.type === 'NEW_SUBMISSION' || msg.data?.type === 'RESET') {
        callback();
      }
    };

    window.addEventListener('pa_debriefing_update', handleCustom);
    window.addEventListener('storage', handleStorage);
    broadcastChannel?.addEventListener('message', handleBroadcast);

    return () => {
      window.removeEventListener('pa_debriefing_update', handleCustom);
      window.removeEventListener('storage', handleStorage);
      broadcastChannel?.removeEventListener('message', handleBroadcast);
    };
  },

  // Compute aggregated stats for each case
  getDebriefStats(): {
    cases: CaseDebriefStats[];
    totalSubmissions: number;
    totalParticipantsEstimated: number;
    overallAccuracy: number;
  } {
    const submissions = this.getSubmissions();
    const totalSubmissions = submissions.length;

    // Estimate participants (max answers for any case or average)
    const countsPerCase: Record<string, number> = {};
    submissions.forEach((s) => {
      countsPerCase[s.caseId] = (countsPerCase[s.caseId] || 0) + 1;
    });
    const totalParticipantsEstimated = Math.max(0, ...Object.values(countsPerCase));

    let correctTotal = 0;

    const cases: CaseDebriefStats[] = TRAFFIC_LIGHT_CASES.map((c) => {
      const caseSubmissions = submissions.filter((s) => s.caseId === c.id);
      const totalAnswers = caseSubmissions.length;

      const counts = {
        Verde: 0,
        Giallo: 0,
        Rosso: 0,
      };

      caseSubmissions.forEach((s) => {
        if (s.choice in counts) {
          counts[s.choice] += 1;
        }
      });

      const percentages = {
        Verde: totalAnswers > 0 ? Math.round((counts.Verde / totalAnswers) * 100) : 0,
        Giallo: totalAnswers > 0 ? Math.round((counts.Giallo / totalAnswers) * 100) : 0,
        Rosso: totalAnswers > 0 ? Math.round((counts.Rosso / totalAnswers) * 100) : 0,
      };

      const correctCount = counts[c.category] || 0;
      correctTotal += correctCount;

      const correctPercentage = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

      const meta = DEBRIEF_METADATA[c.id] || {
        pitfall: 'Valutazione della continenza verbale e dell\'identificazione.',
        question: 'Come vi sareste comportati in una situazione simile?',
        legalFocus: 'D.P.R. 62/2013 integrato dal D.P.R. 81/2023.',
      };

      return {
        caseId: c.id,
        title: c.title,
        context: c.context,
        correctCategory: c.category,
        quote: c.quote,
        totalAnswers,
        counts,
        percentages,
        correctPercentage,
        mostCommonPitfall: meta.pitfall,
        discussionQuestion: meta.question,
        legalFocus: meta.legalFocus,
      };
    });

    const overallAccuracy =
      totalSubmissions > 0 ? Math.round((correctTotal / totalSubmissions) * 100) : 0;

    return {
      cases,
      totalSubmissions,
      totalParticipantsEstimated,
      overallAccuracy,
    };
  },

  // Seed sample cohort of ~24-30 participants with realistic classroom distribution
  seedSampleClassroom(targetParticipants = 26): void {
    const mockSubmissions: AnonymousSubmission[] = [];

    // Distribution patterns for each case (Verde %, Giallo %, Rosso %)
    const distributions: Record<string, [number, number, number]> = {
      'case-1': [70, 20, 10], // Verde: 70% correct, 20% yellow, 10% red
      'case-2': [85, 10, 5],  // Verde: 85% correct
      'case-3': [25, 45, 30], // Giallo: 45% correct, 25% think it's harmless Verde!
      'case-4': [15, 60, 25], // Giallo: 60% correct
      'case-5': [20, 55, 25], // Giallo: 55% correct
      'case-6': [5, 15, 80],  // Rosso: 80% correct
      'case-7': [5, 10, 85],  // Rosso: 85% correct
      'case-8': [10, 25, 65], // Rosso: 65% correct
    };

    TRAFFIC_LIGHT_CASES.forEach((c) => {
      const dist = distributions[c.id] || [33, 33, 34];
      const count = targetParticipants;

      for (let i = 0; i < count; i++) {
        const rand = Math.random() * 100;
        let choice: 'Verde' | 'Giallo' | 'Rosso' = 'Verde';
        if (rand < dist[0]) {
          choice = 'Verde';
        } else if (rand < dist[0] + dist[1]) {
          choice = 'Giallo';
        } else {
          choice = 'Rosso';
        }

        mockSubmissions.push({
          id: `seed-${c.id}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          caseId: c.id,
          choice,
          timestamp: Date.now() - Math.floor(Math.random() * 3600000),
        });
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSubmissions));
    window.dispatchEvent(new CustomEvent('pa_debriefing_update'));
    broadcastChannel?.postMessage({ type: 'NEW_SUBMISSION' });
  },

  // Clear data for next class
  clearSubmissions(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('pa_debriefing_update'));
    broadcastChannel?.postMessage({ type: 'RESET' });
  },
};
