export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
}

export interface Conversation {
  id: string;
  title: string;
  agentId: string;
  lastMessage: string;
  timestamp: Date | string;
  messageCount: number;
  messages?: ConversationMessage[];
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    title: "Strategia di Marketing 2025",
    agentId: "advisor",
    lastMessage: "Analizza questi dati di mercato per la nostra prossima campagna...",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min fa
    messageCount: 12
  },
  {
    id: "conv-2", 
    title: "Sviluppo Competenze Leadership",
    agentId: "mentor",
    lastMessage: "Come posso migliorare le mie capacità di comunicazione con il team?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 ore fa
    messageCount: 8
  },
  {
    id: "conv-3",
    title: "Idee per App Innovativa",
    agentId: "innovator", 
    lastMessage: "Pensiamo a una soluzione rivoluzionaria per il fitness...",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 ore fa
    messageCount: 15
  },
  {
    id: "conv-4",
    title: "Report Performance Q4",
    agentId: "analyst",
    lastMessage: "I KPI mostrano un trend interessante nelle vendite...",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 giorno fa
    messageCount: 6
  },
  {
    id: "conv-5",
    title: "Piano Implementazione Sistema",
    agentId: "executor",
    lastMessage: "Definiamo i passaggi concreti per il rollout...",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 giorni fa
    messageCount: 20
  },
  {
    id: "conv-6",
    title: "Analisi Competitor",
    agentId: "advisor",
    lastMessage: "Quali sono i punti di forza dei nostri concorrenti?",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 giorni fa
    messageCount: 9
  },
  {
    id: "conv-7",
    title: "Crescita Personale",
    agentId: "mentor",
    lastMessage: "Ho bisogno di consigli per gestire meglio lo stress...",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 giorni fa
    messageCount: 14
  }
];

export function getConversationsByAgent(agentId: string): Conversation[] {
  return MOCK_CONVERSATIONS.filter(conv => conv.agentId === agentId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function formatTimestamp(date: Date | string): string {
  const now = new Date();
  let targetDate: Date;
  
  try {
    if (typeof date === 'string') {
      targetDate = new Date(date);
    } else if (date instanceof Date) {
      targetDate = date;
    } else {
      return 'Ora sconosciuta';
    }
    
    // Check if date is valid
    if (!targetDate || isNaN(targetDate.getTime())) {
      return 'Ora sconosciuta';
    }
  } catch (error) {
    return 'Ora sconosciuta';
  }
  
  const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Ora';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m fa`;
  } else if (diffInMinutes < 1440) { // 24 ore
    return `${Math.floor(diffInMinutes / 60)}h fa`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}g fa`;
  }
}

// Mock messages per le conversazioni
const MOCK_MESSAGES: Record<string, ConversationMessage[]> = {
  "conv-1": [
    {
      id: "msg-1",
      role: "user",
      content: "Ciao! Vorrei analizzare la strategia di marketing per il 2025. Quali sono i trend principali da considerare?",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: "msg-2", 
      role: "assistant",
      content: "Ottima domanda! Per la strategia marketing 2025, vedo tre trend fondamentali:\n\n1. **AI-Driven Personalization**: Personalizzazione estrema usando dati comportamentali\n2. **Sustainable Marketing**: Focus su sostenibilità e responsabilità sociale\n3. **Video-First Strategy**: Contenuti video brevi per Gen Z e Alpha\n\nVorresti che approfondiamo uno di questi aspetti?",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2 * 60 * 1000)
    },
    {
      id: "msg-3",
      role: "user", 
      content: "Perfetto! Concentramoci sull'AI-Driven Personalization. Come possiamo implementarla nella nostra azienda?",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
    },
    {
      id: "msg-4",
      role: "assistant",
      content: "Eccellente focus! L'implementazione dell'AI-Driven Personalization richiede un approccio strutturato:\n\n**Fase 1 - Raccolta Dati**\n- Customer journey mapping\n- Behavioral tracking integrato\n- First-party data strategy\n\n**Fase 2 - Tecnologia**\n- CRM intelligente con ML\n- Dynamic content engine\n- Predictive analytics\n\n**Fase 3 - Contenuti**\n- Messaggi personalizzati per segmento\n- Product recommendations dinamiche\n- Email marketing adattivo\n\nQual è il vostro budget e timeline per questo progetto?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    }
  ],
  "conv-2": [
    {
      id: "msg-5",
      role: "user",
      content: "Ho difficoltà a comunicare efficacemente con il mio team. Spesso sento che i messaggi non arrivano come vorrei.",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      id: "msg-6",
      role: "assistant", 
      content: "Capisco perfettamente la tua preoccupazione. La comunicazione efficace è una skill che si sviluppa con la pratica. Ecco alcune strategie che possono aiutarti:\n\n🎯 **Chiarezza del Messaggio**\n- Struttura: Punto principale → Dettagli → Action items\n- Usa esempi concreti\n- Evita il gergo tecnico quando non necessario\n\n💬 **Ascolto Attivo**\n- Fai domande di chiarimento\n- Riassumi quello che hai sentito\n- Mostra interesse genuino\n\n🤝 **Adatta il Tuo Stile**\n- Riconosci gli stili di comunicazione del team\n- Alcuni preferiscono dettagli, altri sintesi\n\nChe tipo di situazioni ti creano più difficoltà?",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 3 * 60 * 1000)
    }
  ],
  "conv-3": [
    {
      id: "msg-7",
      role: "user",
      content: "Sto cercando idee per un'app fitness innovativa. Qualcosa che non esiste ancora sul mercato.",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: "msg-8",
      role: "assistant",
      content: "Fantastico! L'innovazione nel fitness è un settore in continua evoluzione. Ecco alcune idee disruptive:\n\n🧠 **NeuroFit**: App che usa EEG per ottimizzare gli allenamenti in base allo stato mentale\n- Adatta intensità in base allo stress/energia\n- Meditazione attiva durante cardio\n- Biofeedback real-time\n\n🌍 **EcoFit**: Gamification per sostenibilità\n- Converti calorie bruciate in crediti green\n- Challenge con impatto ambientale reale\n- Partner con progetti di riforestazione\n\n👥 **MirrorFit**: Fitness sociale con AR\n- Allena con amici in realtà aumentata\n- Personal trainer virtuali realistici\n- Correzione postura in tempo reale\n\nQuali di queste direzioni ti ispira di più?",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000 + 4 * 60 * 1000)
    }
  ]
};

export function getConversationMessages(conversationId: string): ConversationMessage[] {
  return MOCK_MESSAGES[conversationId] || [];
}

// RAG Documents interface and mock data
export interface RagDocument {
  id: string;
  filename: string;
  type: 'pdf' | 'markdown';
  size: number; // in bytes
  uploadDate: Date;
  agentId: string;
  url?: string; // For download
}

export const MOCK_RAG_DOCUMENTS: RagDocument[] = [
  {
    id: "doc-1",
    filename: "Marketing_Strategy_2024.pdf",
    type: "pdf",
    size: 2480000, // ~2.5MB
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    agentId: "advisor",
    url: "#"
  },
  {
    id: "doc-2",
    filename: "Business_Framework.md",
    type: "markdown",
    size: 45000, // ~45KB
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    agentId: "advisor",
    url: "#"
  },
  {
    id: "doc-3",
    filename: "Leadership_Guide.pdf",
    type: "pdf", 
    size: 1800000, // ~1.8MB
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    agentId: "mentor",
    url: "#"
  },
  {
    id: "doc-4",
    filename: "Soft_Skills_Development.md",
    type: "markdown",
    size: 32000, // ~32KB
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    agentId: "mentor",
    url: "#"
  },
  {
    id: "doc-5",
    filename: "Tech_Innovations_2025.pdf",
    type: "pdf",
    size: 3200000, // ~3.2MB
    uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    agentId: "innovator",
    url: "#"
  },
  {
    id: "doc-6",
    filename: "Market_Analysis_Q4.pdf",
    type: "pdf",
    size: 1200000, // ~1.2MB
    uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    agentId: "analyst",
    url: "#"
  },
  {
    id: "doc-7",
    filename: "Project_Templates.md",
    type: "markdown",
    size: 28000, // ~28KB
    uploadDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    agentId: "executor",
    url: "#"
  }
];

export function getRagDocumentsByAgent(agentId: string): RagDocument[] {
  return MOCK_RAG_DOCUMENTS.filter(doc => doc.agentId === agentId)
    .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}