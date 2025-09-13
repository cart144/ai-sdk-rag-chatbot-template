import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable, json } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "@/lib/utils";

// Agent configurations table
export const agentConfigs = pgTable("agent_configs", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  agentId: varchar("agent_id", { length: 50 })
    .notNull()
    .unique(),
  systemPrompt: text("system_prompt").notNull(),
  name: varchar("name", { length: 100 }),
  avatar: varchar("avatar", { length: 10 }),
  
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Conversations table
export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  conversationId: varchar("conversation_id", { length: 191 })
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar("role", { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

// Schema validation
export const insertAgentConfigSchema = z.object({
  agentId: z.string(),
  systemPrompt: z.string(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export const insertConversationSchema = createSelectSchema(conversations)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const insertMessageSchema = createSelectSchema(messages)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
  });

// Types
export type NewAgentConfigParams = z.infer<typeof insertAgentConfigSchema>;
export type NewConversationParams = z.infer<typeof insertConversationSchema>;
export type NewMessageParams = z.infer<typeof insertMessageSchema>;
export type AgentConfig = typeof agentConfigs.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;