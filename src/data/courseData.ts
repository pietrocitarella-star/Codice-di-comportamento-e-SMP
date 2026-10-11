import { TrafficLightCase, QuizQuestion, RoleResponsibility } from '../types';

export const CORE_PRINCIPLES = [
  {
    icon: 'MessageSquare',
    title: 'Libertà di Parola',
    subtitle: 'Sempre garantita',
    description: 'Il dipendente può esprimere opinioni e critiche con toni educati, continenza verbale e fatti verificati.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Fiducia dei Cittadini',
    subtitle: 'Bene comune primario',
    description: 'L\'autorevolezza e l\'immagine dell\'amministrazione dipendono dal decoro di chi vi lavora ogni giorno.',
  },
  {
    icon: 'ThumbsUp',
    title: 'Like & Condivisioni',
    subtitle: 'Hanno un valore giuridico',
    description: 'Anche le interazioni passive (like, retweet, reaction) possono essere intese come adesione a contenuti lesivi.',
  },
  {
    icon: 'Lock',
    title: 'Privacy & Riservatezza',
    subtitle: 'Dati e atti d\'ufficio',
    description: 'Divieto assoluto di pubblicare atti interni, bozze, comunicazioni di servizio o dettagli identificativi di utenti.',
  },
];

export const CANONS_DATA = [
  {
    id: 1,
    title: 'Verità dei Fatti',
    tagline: 'Accertarsi sempre prima di parlare',
    description: 'Prima di criticare un servizio, una circolare o un operato, verificare con esattezza le informazioni. La diffusione di notizie non verificate o parziali mina la trasparenza pubblica.',
    practicalTip: 'Se non conosci l\'intero iter procedurale di una pratica, evita di giudicarla in piazza virtuale.',
    badge: 'Precisione',
  },
  {
    id: 2,
    title: 'Linguaggio Misurato',
    tagline: 'Continenza verbale e rispetto personale',
    description: 'È legittimo esprimere dissenso o proporre soluzioni, ma senza ricorrere a insulti, sarcasmo denigratorio, attacchi personali verso colleghi, dirigenti o amministratori.',
    practicalTip: 'Chiediti sempre: "Pronuncerei queste identiche parole in un\'assemblea pubblica aperta al pubblico?"',
    badge: 'Continenza',
  },
  {
    id: 3,
    title: 'Disclaimer sul Profilo',
    tagline: 'Distinguere l\'opinione personale dal ruolo',
    description: 'Se nel profilo social o nella biografia menzioni il tuo ente o la tua professione pubblica, specifica in modo inequivocabile che le opinioni espresse impegnano solo te.',
    practicalTip: 'Inserisci: "Opinioni personali. Non impegnano l\'amministrazione di appartenenza".',
    badge: 'Trasparenza',
  },
  {
    id: 4,
    title: 'Riservatezza di Servizio',
    tagline: 'Segreto d\'ufficio e tutela dei dati',
    description: 'Non pubblicare mai foto di scrivanie con pratiche visibili, schermate del gestionale, bozze di delibere o conversazioni interne, anche se prive di nomi evidenti.',
    practicalTip: 'Attenzione alle foto di gruppo o auguri natalizi scattate negli uffici con cartelle sullo sfondo.',
    badge: 'Segreto d\'Ufficio',
  },
];

export const CONTEXT_COMPARISON = {
  private: {
    title: 'Chat Private e Gruppi Chiusi',
    platforms: 'WhatsApp personale, Telegram, Signal, DM privati',
    status: 'Corrispondenza Riservata',
    scope: 'Tutelata dall\'art. 15 della Costituzione sulla libertà e segretezza della corrispondenza.',
    rules: [
      'I messaggi scambiati tra poche persone fidate non costituiscono diffusione pubblica.',
      'Resta comunque sconsigliato diffondere documenti d\'ufficio riservati o diffamare terzi.',
      'I messaggi possono essere inoltrati all\'esterno da altri partecipanti rompendo la riservatezza.',
    ],
    alert: 'Attenzione ai gruppi WhatsApp molto numerosi (oltre 15-20 membri): per la giurisprudenza possono perdere il carattere di segretezza!',
  },
  public: {
    title: 'Bacheche Pubbliche e Profili Aperti',
    platforms: 'Facebook, Instagram, LinkedIn, TikTok, X (Twitter), YouTube, Blog',
    status: 'Diffusione Pubblica a Mezzo Stampa',
    scope: 'Equiparata a un discorso pubblico o a un articolo di giornale ad amplissima diffusione.',
    rules: [
      'Ogni commento, post, video o reaction è permanente e potenzialmente indicizzabile.',
      'Le critiche all\'amministrazione devono rispettare i limiti di continenza e veridicità.',
      'La lesione del decoro e dell\'immagine dell\'ente ha rilievo disciplinare immediato.',
    ],
    alert: 'Anche se il tuo profilo ha impostazione "Solo amici", chiunque può fare uno screenshot e diffonderlo!',
  },
};

export const RISK_CHART_DATA = [
  { name: 'Chat tra 2 amici (WhatsApp)', value: 1.5, color: '#10b981', note: 'Ambito privato protetto' },
  { name: 'Gruppo WhatsApp colleghi (6 pers.)', value: 3.5, color: '#06b6d4', note: 'Semi-privato, rischio inoltri' },
  { name: 'Profilo personale con Disclaimer', value: 5.0, color: '#0f766e', note: 'Opinione lecita con cautela' },
  { name: 'Commento su pagina pubblica/giornale', value: 8.0, color: '#f59e0b', note: 'Alta visibilità e rilevanza' },
  { name: 'Post con offese o foto dell\'ufficio', value: 9.8, color: '#f43f5e', note: 'Violazione disciplinare certa' },
];

export const SOURCES_CHART_DATA = [
  { label: 'Insulti o sarcasmo verso l\'Ente / Superiori', percentage: 35, color: '#f43f5e' },
  { label: 'Foto di atti, schermi o dati riservati', percentage: 25, color: '#0f766e' },
  { label: 'Uso improprio del logo o identità istituzionale', percentage: 15, color: '#f59e0b' },
  { label: 'Like o condivisione di post diffamatori', percentage: 15, color: '#06b6d4' },
  { label: 'Sfoghi aggressivi su turni e colleghi', percentage: 10, color: '#64748b' },
];

export const ROLE_RESPONSIBILITIES: RoleResponsibility[] = [
  {
    role: 'Operatori e Collaboratori',
    badge: 'Area Operatori',
    generalDuty: 75,
    exemplarityDuty: 25,
    description: 'Rispetto delle norme base di correttezza, divieto di divulgare informazioni di cui vengono a conoscenza durante le mansioni operative.',
    guidelines: [
      'Evitare commenti sull\'utenza incontrata allo sportello o sul territorio.',
      'Non fotografare mezzi di servizio in situazioni equivoche.',
      'Mantenere un linguaggio civile nei gruppi e sui profili aperti.',
    ],
  },
  {
    role: 'Istruttori Amministrativi e Tecnici',
    badge: 'Area Istruttori',
    generalDuty: 60,
    exemplarityDuty: 40,
    description: 'Gestione diretta di atti e procedimenti: rigoroso riserbo sullo stato delle pratiche e sulle valutazioni tecniche dell\'ufficio.',
    guidelines: [
      'Nessuna anticipazione sugli esiti di bandi, autorizzazioni o gare.',
      'Non esprimere pareri personali non richiesti sull\'attività degli uffici.',
      'Doverosa chiarezza sul fatto che i pareri social non hanno valore istruttorio.',
    ],
  },
  {
    role: 'Funzionari ed Elevate Qualificazioni (EQ)',
    badge: 'Funzionari / EQ',
    generalDuty: 40,
    exemplarityDuty: 60,
    description: 'Ruolo di coordinamento e responsabilità di procedimento: dovere rafforzato di misura, non ostacolare la coesione del gruppo.',
    guidelines: [
      'Non screditare l\'operato dei colleghi o dei collaboratori coordinati.',
      'Attenzione all\'uso di canali social professionali (LinkedIn) quando si citano progetti.',
      'Esempio positivo nel trasmettere compostezza e cultura della privacy.',
    ],
  },
  {
    role: 'Dirigenti e Figure di Vertice',
    badge: 'Dirigenza',
    generalDuty: 20,
    exemplarityDuty: 80,
    description: 'Massimo grado di identificazione con l\'amministrazione: ogni dichiarazione pubblica viene percepita come indirizzo dell\'ente.',
    guidelines: [
      'Standard di riserbo ed equilibrio istituzionale massimo.',
      'Astensione totale da polemiche pubbliche relative all\'amministrazione.',
      'Supervisione sull\'applicazione del Codice di Comportamento integrato (DPR 81/2023).',
    ],
  },
];

export const TRAFFIC_LIGHT_CASES: TrafficLightCase[] = [
  {
    id: 'case-1',
    category: 'Verde',
    title: 'Critica Tecnica Propositiva',
    context: 'LinkedIn',
    quote: '«In merito alla digitalizzazione dei procedimenti SUAP, credo che un tavolo congiunto tra tecnici e comuni limitrofi permetterebbe di uniformare la modulistica e ridurre i tempi di attesa per le imprese.»',
    verdict: 'Pienamente Legittimo e Costruttivo',
    legalBasis: 'Esercizio della libertà di espressione nel rispetto del canone di continenza verbale e dell\'interesse al miglioramento dell\'azione amministrativa.',
    practicalAdvice: 'Toni pacati, proposta fattibile, nessun attacco personale, argomentazione tecnica utile.',
    iconName: 'CheckCircle2',
  },
  {
    id: 'case-2',
    category: 'Verde',
    title: 'Condivisione di Notizie Ufficiali',
    context: 'Bacheca Pubblica',
    quote: '«Aperte le iscrizioni per i nidi comunali fino al 30 aprile. Trovate il bando e i requisiti completi sul sito istituzionale a questo link.»',
    verdict: 'Attività Positiva e Favorita',
    legalBasis: 'Promozione della trasparenza e diffusione di informazioni di pubblica utilità già rese note ufficialmente.',
    practicalAdvice: 'Condividi sempre il link istituzionale ufficiale senza aggiungere commenti distorti.',
    iconName: 'Share2',
  },
  {
    id: 'case-3',
    category: 'Giallo',
    title: 'Like e Reaction a Post Polemici',
    context: 'Bacheca Pubblica',
    quote: 'Un cittadino scrive: «Dirigenti comunali fannulloni e incapaci di gestire il piano neve! Vergogna!». Tu metti "Mi Piace" o "Condividi".',
    verdict: 'Comportamento a Rischio Disciplinare',
    legalBasis: 'La giurisprudenza ha chiarito che il "like" o la ricondivisione manifestano adesione e amplificano la portata offensiva del messaggio.',
    practicalAdvice: 'Evita di approvare post denigratori verso la tua amministrazione o verso i tuoi colleghi.',
    iconName: 'AlertTriangle',
  },
  {
    id: 'case-4',
    category: 'Giallo',
    title: 'Uso del Nome dell\'Ente senza Disclaimer',
    context: 'LinkedIn',
    quote: 'Profilo personale con foto ufficiale: «Funzionario presso Comune di XYZ». Poi nei post si pubblicano opinioni accese su questioni politiche o su bandi comunali.',
    verdict: 'Richiede Integrazione Immediata',
    legalBasis: 'Rischio di ingenerare nei cittadini l\'erroneo convincimento che si tratti della posizione ufficiale dell\'Ente.',
    practicalAdvice: 'Aggiungi subito nella bio: "Opinioni strettamente personali che non impegnano l\'amministrazione".',
    iconName: 'Info',
  },
  {
    id: 'case-5',
    category: 'Giallo',
    title: 'Gruppo WhatsApp Numeroso con Colleghi',
    context: 'Gruppo WhatsApp',
    quote: 'In un gruppo con 35 dipendenti dell\'ente: «La nuova circolare sugli orari non ha senso, il direttore generale fa solo danni».',
    verdict: 'Area Grigia Pericolosa',
    legalBasis: 'Quando un gruppo supera un ristretto numero di partecipanti, la riservatezza cessa di essere garantita e i messaggi possono costituire diffamazione.',
    practicalAdvice: 'Nei gruppi di lavoro mantieni sempre professionalità; esponi le critiche nei canali sindacali.',
    iconName: 'Users',
  },
  {
    id: 'case-6',
    category: 'Rosso',
    title: 'Foto con Dati di Utenti o Pratiche',
    context: 'Foto & Storie',
    quote: 'Foto su Instagram Stories: «Giornatina piena oggi alla scrivania! 📚☕» con sullo sfondo una cartella aperta con nome, cognome e codice fiscale del cittadino richiedente.',
    verdict: 'Violazione Grave (GDPR + Codice di Comportamento)',
    legalBasis: 'Violazione dell\'art. 5 GDPR (riservatezza dati personali) e del segreto d\'ufficio (D.P.R. 62/2013 e D.P.R. 81/2023).',
    practicalAdvice: 'Divieto assoluto di fotografare documenti o postazioni di lavoro contenenti dati sensibili.',
    iconName: 'XCircle',
  },
  {
    id: 'case-7',
    category: 'Rosso',
    title: 'Insulti e Denigrazione dell\'Amministrazione',
    context: 'Commenti ai Media',
    quote: 'Sotto l\'articolo del quotidiano locale: «In quel comune sono tutti corrotti e incompetenti, scaldano le sedie e rubano lo stipendio!» firmato con nome e cognome.',
    verdict: 'Infrazione Disciplinare e Rischio Querela',
    legalBasis: 'Lesione grave dell\'immagine e del decoro dell\'amministrazione di appartenenza (illecito disciplinare e diffamazione aggravata).',
    practicalAdvice: 'Non confondere la libertà di espressione con il diritto di diffamare il proprio datore di lavoro.',
    iconName: 'AlertOctagon',
  },
  {
    id: 'case-8',
    category: 'Rosso',
    title: 'Uso del Logo dell\'Ente per Profili Personali',
    context: 'Bacheca Pubblica',
    quote: 'Creare una pagina o un account Facebook usando lo stemma araldico o il logo ufficiale dell\'amministrazione come propria immagine di profilo.',
    verdict: 'Uso Improprio di Segni Istituzionali',
    legalBasis: 'Violazione delle norme sull\'uso dei simboli ufficiali e induzione in errore dell\'utenza.',
    practicalAdvice: 'I simboli istituzionali possono essere utilizzati unicamente dai canali social ufficiali accreditati dall\'Ente.',
    iconName: 'ShieldAlert',
  },
];

export const VADEMECUM_ROWS = [
  {
    area: 'Profilo Personale & Bio',
    consentito: 'Indicare la propria professione inserendo il disclaimer: «Opinioni strettamente personali».',
    vietato: 'Utilizzare il logo, stemma o dicitura ufficiale come foto avatar o intestazione.',
    consiglio: 'Mantieni separati profili privati e account dedicati all\'attività professionale.',
  },
  {
    area: 'Commenti & Dibattiti',
    consentito: 'Esprimere considerazioni su temi generali o tecnici con toni equilibrati e civili.',
    vietato: 'Insulti, sarcasmo denigratorio verso colleghi, dirigenti, amministratori o cittadini.',
    consiglio: 'Prima di inviare, rileggi il testo immaginando di leggerlo davanti al tuo responsabile.',
  },
  {
    area: 'Documenti & Luogo di Lavoro',
    consentito: 'Condividere comunicati stampa, bandi aperti e notizie pubbliche già pubblicate dall\'ente.',
    vietato: 'Fotografare bozze di atti non approvati, registri, o schermi con dati anagrafici.',
    consiglio: 'Rispetta la riservatezza dell\'ufficio anche nelle videochiamate e nelle "stories".',
  },
  {
    area: 'Interazioni di Terzi (Like / Share)',
    consentito: 'Condividere iniziative culturali, informative o di utilità sociale con commenti educati.',
    vietato: 'Mettere reaction favorevoli o ricondividere post diffamatori, offensivi o discriminatori.',
    consiglio: 'Il "Mi piace" è considerato dai tribunali una forma di adesione consapevole.',
  },
  {
    area: 'Dispositivi e Orario d\'Ufficio',
    consentito: 'Uso occasionale e brevissimo per motivate urgenze personali che non pregiudichi il servizio.',
    vietato: 'Navigazione prolungata sui social o streaming video durante l\'orario di servizio.',
    consiglio: 'I log di rete aziendali possono rilevare l\'utilizzo anomalo della banda.',
  },
  {
    area: 'Dissenso Organizzativo',
    consentito: 'Segnalare problemi al responsabile di settore o rivolgersi alle rappresentanze sindacali (RSU).',
    vietato: 'Usare Facebook o TikTok come cassa di risonanza per screditare l\'ente o i colleghi.',
    consiglio: 'I canali interni e le piattaforme di Whistleblowing garantiscono tutela e serietà.',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Sei un dipendente comunale e leggi un post su Facebook in cui un cittadino insulta pesantemente l\'ufficio anagrafe. Qual è il comportamento corretto?',
    context: 'Comportamento su bacheche aperte',
    options: [
      {
        id: 'A',
        text: 'Rispondere subito dal proprio profilo privato insultando a propria volta il cittadino per difendere l\'ufficio.',
        isCorrect: false,
        explanation: 'Sbagliato: i dipendenti non devono ingaggiare polemiche personali o usare toni aggressivi. Le risposte ufficiali spettano all\'Ufficio Comunicazione/Social Media Manager.'
      },
      {
        id: 'B',
        text: 'Astenersi dal polemizzare e, se opportuno, segnalare il post all\'ufficio comunicazione/URP dell\'ente per la gestione ufficiale.',
        isCorrect: true,
        explanation: 'Esatto! Le risposte a contestazioni pubbliche devono essere coordinate dai canali ufficiali dell\'ente con toni istituzionali.'
      },
      {
        id: 'C',
        text: 'Mettere "Mi Piace" al commento del cittadino per mostrare che anche tu sei d\'accordo con la critica.',
        isCorrect: false,
        explanation: 'Sbagliato: il like a un post ingiurioso verso il proprio ente costituisce condotta lesiva del decoro aziendale.'
      }
    ]
  },
  {
    id: 2,
    question: 'Nel tuo profilo LinkedIn scrivi: "Funzionario Istruttore presso Regione Lazio". È necessario inserire un disclaimer?',
    context: 'Trasparenza del profilo e identificazione',
    options: [
      {
        id: 'A',
        text: 'Sì, è fortemente raccomandato specificare che le opinioni espresse sono personali e non impegnano l\'amministrazione.',
        isCorrect: true,
        explanation: 'Esatto! Il Codice di Comportamento richiede di evitare che i cittadini scambino il pensiero personale del lavoratore per una presa di posizione dell\'ente.'
      },
      {
        id: 'B',
        text: 'No, perché LinkedIn è una piattaforma per professionisti e tutti sanno che i post sono personali.',
        isCorrect: false,
        explanation: 'Sbagliato: proprio per la sua natura professionale, l\'assenza di disclaimer aumenta il rischio di confusione tra ruolo personale e posizione ufficiale.'
      },
      {
        id: 'C',
        text: 'Solo se si hanno più di 10.000 collegamenti.',
        isCorrect: false,
        explanation: 'Sbagliato: la regola vale indipendentemente dal numero di follower o collegamenti.'
      }
    ]
  },
  {
    id: 3,
    question: 'Festeggi il compleanno di un collega in ufficio. Vuoi scattare una foto di gruppo per Instagram. A cosa devi prestare massima attenzione?',
    context: 'Foto e tutela della privacy (GDPR)',
    options: [
      {
        id: 'A',
        text: 'Verificare che la luce sia ottimale e che tutti abbiano un filtro fotografico.',
        isCorrect: false,
        explanation: 'Irrilevante ai fini della disciplina pubblica.'
      },
      {
        id: 'B',
        text: 'Assicurarsi che non siano visibili documenti, schermi di PC accesi con dati di utenti, cartelle con nominativi o planimetrie riservate, e avere il consenso dei colleghi.',
        isCorrect: true,
        explanation: 'Esatto! La pubblicazione involontaria di dati sensibili di cittadini o atti interni integra una violazione del GDPR e del dovere di riservatezza d\'ufficio.'
      },
      {
        id: 'C',
        text: 'Nessun problema, se la foto va solo sulle Instagram Stories che spariscono dopo 24 ore.',
        isCorrect: false,
        explanation: 'Sbagliato: anche una storia temporanea può essere catturata con uno screenshot e circolare ovunque.'
      }
    ]
  },
  {
    id: 4,
    question: 'Riscontri una grave anomalia organizzativa nel tuo settore che rallenta i pagamenti ai fornitori. Come devi procedere?',
    context: 'Canali interni vs sfoghi social',
    options: [
      {
        id: 'A',
        text: 'Scrivere un post indignato su Facebook taggando i giornali locali per fare pressione sulla dirigenza.',
        isCorrect: false,
        explanation: 'Sbagliato: i social non sono lo strumento per gestire dinamiche interne dell\'amministrazione e un simile post espone a sanzioni disciplinari.'
      },
      {
        id: 'B',
        text: 'Segnalare formalmente l\'anomalia al Dirigente, rivolgersi alle RSU/sindacati o, in presenza di illeciti, usare la piattaforma di Whistleblowing.',
        isCorrect: true,
        explanation: 'Esatto! L\'ordinamento prevede canali interni protetti e garanti per la risoluzione delle disfunzioni o la denuncia di irregolarità.'
      },
      {
        id: 'C',
        text: 'Creare un profilo anonimo su TikTok per svelare i retroscena dell\'ufficio.',
        isCorrect: false,
        explanation: 'Sbagliato: l\'anonimato online è fittizio e l\'autorità giudiziaria o l\'ente possono facilmente risalire all\'autore.'
      }
    ]
  },
  {
    id: 5,
    question: 'Che differenza c\'è, dal punto di vista disciplinare, tra una chat WhatsApp tra 3 colleghi fidati e un post pubblico su Facebook?',
    context: 'Mappa dei contesti online',
    options: [
      {
        id: 'A',
        text: 'Nessuna differenza: la legge punisce qualsiasi frase scritta ovunque.',
        isCorrect: false,
        explanation: 'Sbagliato: l\'ordinamento tutela la segretezza della corrispondenza privata tra pochi soggetti (art. 15 Cost.).'
      },
      {
        id: 'B',
        text: 'La chat tra pochi soggetti è corrispondenza privata; il post su Facebook è equiparato a una dichiarazione pubblica a mezzo stampa con immediato rilievo per il decoro dell\'ente.',
        isCorrect: true,
        explanation: 'Esatto! Le comunicazioni private sono coperte da riservatezza (salvo violazioni penali), mentre i post pubblici hanno impatto diretto sull\'immagine dell\'ente.'
      },
      {
        id: 'C',
        text: 'WhatsApp è illegale durante l\'orario di lavoro, mentre Facebook è sempre consentito.',
        isCorrect: false,
        explanation: 'Sbagliato e privo di fondamento.'
      }
    ]
  },
  {
    id: 6,
    question: 'Sei titolare di una Posizione Organizzativa / Elevata Qualificazione (EQ) o Dirigente. Il tuo dovere di moderazione sui social è:',
    context: 'Graduazione della responsabilità per ruolo',
    options: [
      {
        id: 'A',
        text: 'Identico a quello di qualsiasi operatore o stagista.',
        isCorrect: false,
        explanation: 'Sbagliato: i codici di comportamento e la giurisprudenza prevedono una responsabilità rafforzata per chi coordina o dirige.'
      },
      {
        id: 'B',
        text: 'Rafforzato: chi ha ruoli di responsabilità deve dare l\'esempio di compostezza istituzionale, perché le sue parole sono più facilmente assimilate all\'ente.',
        isCorrect: true,
        explanation: 'Esatto! Figure apicali ed EQ incarnano l\'ente all\'esterno: per loro il dovere di continenza ed equilibrio è massimo.'
      },
      {
        id: 'C',
        text: 'Minore, perché i dirigenti hanno maggiore libertà contrattuale.',
        isCorrect: false,
        explanation: 'Sbagliato: i dirigenti sono soggetti a un dovere di lealtà e decoro ancora più stringente.'
      }
    ]
  }
];

export const DISCLAIMER_TEMPLATES = [
  {
    platform: 'Generale / Tutte le piattaforme',
    text: 'Le opinioni espresse su questo profilo sono strettamente personali e non riflettono né impegnano in alcun modo l\'ente di appartenenza.',
  },
  {
    platform: 'LinkedIn (Professionale)',
    text: 'Dipendente pubblico | Opinioni a titolo esclusivamente personale | Nessuna correlazione ufficiale con le posizioni dell\'amministrazione.',
  },
  {
    platform: 'X / Twitter (Sintetico)',
    text: 'Opinioni 100% personali. Non impegnano il mio ente. RT e like ≠ approvazione automatica.',
  },
  {
    platform: 'Instagram / Facebook (Bio Social)',
    text: 'Spazio privato. I contenuti e i commenti qui condivisi rappresentano unicamente il mio pensiero personale.',
  },
];
