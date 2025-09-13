# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Retrieval-Augmented Generation (RAG) chatbot built with the Vercel AI SDK. The application allows users to create a knowledge base by storing content that gets embedded and can be retrieved to answer questions.

## Core Architecture

- **Frontend**: Next.js 14 with App Router, shadcn-ui components, TailwindCSS
- **AI**: Vercel AI SDK with OpenAI integration for embeddings (`text-embedding-ada-002`)
- **Database**: PostgreSQL with pgvector extension for vector similarity search
- **ORM**: Drizzle ORM with migrations and schema management

### Key Components

- **Resources** (`lib/db/schema/resources.ts`): Stores the original content submitted by users
- **Embeddings** (`lib/db/schema/embeddings.ts`): Stores vector embeddings of chunked content with HNSW index for fast similarity search
- **Embedding Generation** (`lib/ai/embedding.ts`): Chunks content by sentences and generates embeddings using OpenAI
- **Server Actions** (`lib/actions/resources.ts`): Handles resource creation and embedding storage

### Data Flow

1. User submits content via the frontend
2. Content is stored in the `resources` table
3. Content is chunked (by sentences) and embedded using OpenAI
4. Embeddings are stored in the `embeddings` table with vector index
5. Future queries can use vector similarity search to retrieve relevant content

## Development Commands

```bash
# Development
npm run dev              # Start development server

# Database Operations
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio for database management
npm run db:drop          # Drop database tables
npm run db:pull          # Introspect existing database
npm run db:check         # Check migration consistency

# Build and Deploy
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

## Environment Configuration

The project uses `@t3-oss/env-nextjs` for type-safe environment variables. Required variables are defined in `lib/env.mjs`:
- `DATABASE_URL`: PostgreSQL connection string (must have pgvector extension)
- `NODE_ENV`: Environment (development/test/production)

## Database Schema

The database uses two main tables with a one-to-many relationship:
- `resources`: Stores original content with timestamps
- `embeddings`: Stores chunked content with vector embeddings, references resources via foreign key

The embeddings table uses an HNSW index on the vector column for efficient similarity search.