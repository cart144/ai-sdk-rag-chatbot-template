# AI SDK RAG Starter 🤖

Un sistema completo di chatbot con Retrieval-Augmented Generation (RAG) costruito con Next.js, AI SDK, e PostgreSQL con pgvector.

## 🎯 Caratteristiche Principali

- **RAG Intelligente**: Sistema di recupero semantico per informazioni personalizzate
- **Gestione Multi-Agent**: Supporto per diversi agenti con knowledge base separate
- **Upsert Basato su Categorie**: Previene duplicati e mantiene informazioni aggiornate
- **Embeddings Vettoriali**: Ricerca semantica ad alta precisione con OpenAI embeddings
- **Interface Moderna**: UI pulita e responsiva con componenti shadcn/ui
- **Configurazione Flessibile**: Gestione completa di settings e modelli AI

## 🛠️ Stack Tecnologico

- **Framework**: Next.js 14 con TypeScript
- **AI**: AI SDK (Vercel) + OpenAI GPT-4
- **Database**: PostgreSQL con pgvector extension
- **ORM**: Drizzle ORM
- **Embeddings**: OpenAI text-embedding-ada-002 (1536 dimensioni)
- **UI**: Tailwind CSS + shadcn/ui
- **Package Manager**: pnpm

## 📦 Installazione

### Prerequisiti

- Node.js 18+ 
- PostgreSQL con estensione pgvector
- Account OpenAI con API key

### 1. Clona il Repository

```bash
git clone <repository-url>
cd ai-sdk-rag-starter
```

### 2. Installa le Dipendenze

```bash
pnpm install
```

### 3. Configura il Database PostgreSQL

Installa l'estensione pgvector nel tuo database PostgreSQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Configura le Variabili d'Ambiente

Crea un file `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key-here"

# App (opzionale)
NEXTAUTH_SECRET="your-secret-key-for-sessions"
```

### 5. Esegui le Migrazioni del Database

```bash
# Genera le migrazioni (se necessario)
pnpm db:generate

# Esegui le migrazioni
pnpm db:migrate

# Visualizza il database (opzionale)
pnpm db:studio
```

### 6. Avvia l'Applicazione

```bash
# Modalità sviluppo
pnpm dev

# Build per produzione
pnpm build
pnpm start
```

L'app sarà disponibile su `http://localhost:3000`

## 🚀 Come Usarlo

### Creazione di un Agent

1. Vai alla sezione "Agents" nell'interfaccia
2. Crea un nuovo agent con:
   - Nome e descrizione
   - System prompt personalizzato
   - Configurazioni specifiche

### Caricamento della Knowledge Base

Il sistema supporta diversi metodi per popolare la knowledge base:

**Tramite Chat**:
```
User: "Il mio nome è Marco e lavoro come sviluppatore"
System: Salva automaticamente l'informazione nella categoria "user_info"
```

**Tramite File** (se implementato):
- Documenti PDF
- File di testo
- CSV e altri formati strutturati

### Interrogazione della Knowledge Base

L'AI usa automaticamente la knowledge base per rispondere:

```
User: "Come mi chiamo?"
AI: "Il tuo nome è Marco" (recuperato dalla knowledge base)
```

## 🧠 Sistema RAG - Come Funziona

### 1. Storage delle Informazioni

Quando l'AI riceve nuove informazioni:

1. **Categorizzazione**: Classifica l'informazione (es: `user_name`, `preferences`)
2. **Chunking**: Divide il testo in frasi per embeddings ottimali  
3. **Embedding**: Genera vettori con OpenAI text-embedding-ada-002
4. **Upsert**: Aggiorna informazioni esistenti o crea nuove

### 2. Retrieval delle Informazioni

Per ogni query utente:

1. **Embedding Query**: Genera vettore della domanda
2. **Ricerca Vettoriale**: Trova contenuti simili (soglia: 0.5 cosine similarity)
3. **Ranking**: Ordina per rilevanza
4. **Integrazione**: Combina risultati con la risposta AI

### 3. Gestione Categorie

Le categorie prevengono duplicati e organizzano le informazioni:

- `user_name` - Informazioni personali
- `user_preferences` - Preferenze e gusti
- `company_info` - Dati aziendali
- `user_location` - Informazioni geografiche
- `user_interests` - Hobby e interessi
- `facts` - Fatti generali

## 📁 Struttura del Progetto

```
ai-sdk-rag-starter/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── page.tsx           # Homepage
├── components/            # Componenti React
│   └── ui/               # Componenti UI base
├── lib/
│   ├── actions/          # Server actions
│   │   └── resources.ts  # Gestione knowledge base
│   ├── ai/               # Logica AI e embeddings
│   │   └── embedding.ts  # Generazione embeddings
│   ├── chat/             # Sistema chat e tools
│   │   └── utils.ts      # Chat utilities e AI tools
│   └── db/               # Database layer
│       ├── schema/       # Schemi Drizzle
│       └── migrations/   # Migrazioni DB
└── README.md             # Questa documentazione
```

## 🔧 Configurazione Avanzata

### Personalizzazione Embeddings

Per modificare la strategia di chunking o il modello di embedding, edita `lib/ai/embedding.ts`:

```typescript
// Strategia di chunking personalizzata
const generateChunks = (input: string): string[] => {
    // La tua logica qui
    return chunks;
};

// Modello di embedding diverso
const embeddingModel = openai.embedding('text-embedding-3-large');
```

### Soglia di Similarità

Per regolare la precisione della ricerca semantica, modifica la soglia in `lib/ai/embedding.ts`:

```typescript
// Più rigida (solo risultati molto rilevanti)
.where(gt(similarity, 0.7))

// Più permissiva (più risultati)
.where(gt(similarity, 0.3))
```

### Tools AI Personalizzati

Aggiungi nuovi strumenti AI in `lib/chat/utils.ts`:

```typescript
customTool: tool({
  description: 'Descrizione del tuo tool',
  inputSchema: z.object({
    param: z.string()
  }),
  execute: async ({ param }) => {
    // La tua logica
    return result;
  }
})
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Verifica la connessione
pnpm db:studio

# Reset delle migrazioni (ATTENZIONE: cancella i dati)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm db:migrate
```

### Embedding Generation Errors

- Verifica che la OPENAI_API_KEY sia corretta
- Controlla i limiti di rate della tua API key
- Verifica la connessione internet per le chiamate API

### Memory Issues con Embeddings

Per progetti con molti dati:

1. Implementa batch processing
2. Usa un database di embeddings dedicato
3. Considera l'uso di modelli di embedding locali

## 📊 Monitoraggio e Debug

### Database Studio

```bash
pnpm db:studio
```

Visualizza e modifica i dati direttamente nel browser.

### Logs di Debug

Il sistema include logging dettagliato:

- Creazione risorse: `lib/actions/resources.ts`
- Generazione embeddings: `lib/ai/embedding.ts` 
- Chat e AI tools: `lib/chat/utils.ts`

### Metriche RAG

Monitora le performance del sistema:

- Similarità media delle ricerche
- Tempo di risposta embedding generation
- Efficacia delle categorizzazioni

## 🚀 Deployment

### Vercel (Consigliato)

```bash
# Deploy su Vercel
vercel deploy

# Configura le variabili d'ambiente su Vercel dashboard
# Assicurati che il database sia accessibile pubblicamente
```

### Docker

```dockerfile
# Dockerfile di esempio per deployment container
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 🤝 Contribuire

1. Fork del repository
2. Crea feature branch (`git checkout -b feature/nuova-funzionalita`)
3. Commit delle modifiche (`git commit -m 'Aggiungi nuova funzionalità'`)
4. Push al branch (`git push origin feature/nuova-funzionalita`)
5. Apri una Pull Request

## 📝 License

MIT License - vedi `LICENSE` file per dettagli.

## 🆘 Supporto

- **Issues**: Usa GitHub Issues per bug report
- **Discussions**: Per domande e discussioni generali
- **Documentation**: Consulta la [Vercel AI SDK Guide](https://sdk.vercel.ai/docs/guides/rag-chatbot)

---

**Sviluppato con ❤️ per la community AI italiana**
