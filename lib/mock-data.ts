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
    title: "Marketing Strategy 2025",
    agentId: "advisor",
    lastMessage: "Analyze this market data for our next campaign...",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    messageCount: 12
  },
  {
    id: "conv-2", 
    title: "Leadership Skills Development",
    agentId: "mentor",
    lastMessage: "How can I improve my communication skills with the team?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    messageCount: 8
  },
  {
    id: "conv-3",
    title: "Innovative App Ideas",
    agentId: "innovator", 
    lastMessage: "Let's think of a revolutionary solution for fitness...",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    messageCount: 15
  },
  {
    id: "conv-4",
    title: "Report Performance Q4",
    agentId: "analyst",
    lastMessage: "The KPIs show an interesting trend in sales...",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    messageCount: 6
  },
  {
    id: "conv-5",
    title: "System Implementation Plan",
    agentId: "executor",
    lastMessage: "Let's define the concrete steps for the rollout...",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    messageCount: 20
  },
  {
    id: "conv-6",
    title: "Competitor Analysis",
    agentId: "advisor",
    lastMessage: "What are our competitors' strengths?",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    messageCount: 9
  },
  {
    id: "conv-7",
    title: "Personal Growth",
    agentId: "mentor",
    lastMessage: "I need advice on better managing stress...",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
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
      return 'Unknown time';
    }
    
    // Check if date is valid
    if (!targetDate || isNaN(targetDate.getTime())) {
      return 'Unknown time';
    }
  } catch (error) {
    return 'Unknown time';
  }
  
  const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
}

// Mock messages for conversations
const MOCK_MESSAGES: Record<string, ConversationMessage[]> = {
  "conv-1": [
    {
      id: "msg-1",
      role: "user",
      content: "Hello! I'd like to analyze the marketing strategy for 2025. What are the main trends to consider?",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: "msg-2", 
      role: "assistant",
      content: "Great question! For the 2025 marketing strategy, I see three fundamental trends:\n\n1. **AI-Driven Personalization**: Extreme personalization using behavioral data\n2. **Sustainable Marketing**: Focus on sustainability and social responsibility\n3. **Video-First Strategy**: Short video content for Gen Z and Alpha\n\nWould you like us to dive deeper into one of these aspects?",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2 * 60 * 1000)
    },
    {
      id: "msg-3",
      role: "user", 
      content: "Perfect! Let's focus on AI-Driven Personalization. How can we implement it in our company?",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
    },
    {
      id: "msg-4",
      role: "assistant",
      content: "Excellent focus! Implementing AI-Driven Personalization requires a structured approach:\n\n**Phase 1 - Data Collection**\n- Customer journey mapping\n- Integrated behavioral tracking\n- First-party data strategy\n\n**Phase 2 - Technology**\n- Intelligent CRM with ML\n- Dynamic content engine\n- Predictive analytics\n\n**Phase 3 - Content**\n- Personalized messages per segment\n- Dynamic product recommendations\n- Adaptive email marketing\n\nWhat's your budget and timeline for this project?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    }
  ],
  "conv-2": [
    {
      id: "msg-5",
      role: "user",
      content: "I have difficulty communicating effectively with my team. I often feel that messages don't come across as I'd like.",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      id: "msg-6",
      role: "assistant", 
      content: "I completely understand your concern. Effective communication is a skill that develops with practice. Here are some strategies that can help you:\n\n🎯 **Message Clarity**\n- Structure: Main point → Details → Action items\n- Use concrete examples\n- Avoid technical jargon when unnecessary\n\n💬 **Active Listening**\n- Ask clarifying questions\n- Summarize what you've heard\n- Show genuine interest\n\n🤝 **Adapt Your Style**\n- Recognize your team's communication styles\n- Some prefer details, others summaries\n\nWhat types of situations create the most difficulty for you?",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 3 * 60 * 1000)
    }
  ],
  "conv-3": [
    {
      id: "msg-7",
      role: "user",
      content: "I'm looking for ideas for an innovative fitness app. Something that doesn't exist in the market yet.",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: "msg-8",
      role: "assistant",
      content: "Fantastic! Innovation in fitness is a constantly evolving sector. Here are some disruptive ideas:\n\n🧠 **NeuroFit**: App that uses EEG to optimize workouts based on mental state\n- Adapts intensity based on stress/energy\n- Active meditation during cardio\n- Real-time biofeedback\n\n🌍 **EcoFit**: Gamification for sustainability\n- Convert burned calories to green credits\n- Challenges with real environmental impact\n- Partner with reforestation projects\n\n👥 **MirrorFit**: Social fitness with AR\n- Train with friends in augmented reality\n- Realistic virtual personal trainers\n- Real-time posture correction\n\nWhich of these directions inspires you most?",
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