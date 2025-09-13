import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { nanoid } from "@/lib/utils";

export const settings = pgTable("settings", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for settings - used to validate API requests
export const insertSettingSchema = createSelectSchema(settings)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Type for settings - used to type API request params and within Components
export type NewSettingParams = z.infer<typeof insertSettingSchema>;

// Predefined setting keys
export const SETTING_KEYS = {
  OPENAI_API_KEY: 'openai_api_key',
  APP_TITLE: 'app_title',
} as const;

export type SettingKey = typeof SETTING_KEYS[keyof typeof SETTING_KEYS];