'use server';

import {
  NewSettingParams,
  insertSettingSchema,
  settings,
  SETTING_KEYS,
  SettingKey,
} from '@/lib/db/schema/settings';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export const getSetting = async (key: SettingKey): Promise<string | null> => {
  try {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    
    return result[0]?.value || null;
  } catch (error) {
    console.error('Error fetching setting:', error);
    return null;
  }
};

export const getAllSettings = async () => {
  try {
    const result = await db
      .select()
      .from(settings);
    
    const settingsMap: Record<string, string> = {};
    result.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });
    
    return settingsMap;
  } catch (error) {
    console.error('Error fetching all settings:', error);
    return {};
  }
};

export const setSetting = async (key: SettingKey, value: string, description?: string) => {
  try {
    const validatedInput = insertSettingSchema.parse({ key, value, description });
    
    // Check if setting already exists
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing setting
      await db
        .update(settings)
        .set({ 
          value: validatedInput.value,
          description: validatedInput.description,
          updatedAt: new Date()
        })
        .where(eq(settings.key, key));
    } else {
      // Create new setting
      await db
        .insert(settings)
        .values(validatedInput);
    }
    
    return 'Setting saved successfully.';
  } catch (error) {
    console.error('Error saving setting:', error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error saving setting.';
  }
};

export const deleteSetting = async (key: SettingKey) => {
  try {
    await db
      .delete(settings)
      .where(eq(settings.key, key));
    
    return 'Setting deleted successfully.';
  } catch (error) {
    console.error('Error deleting setting:', error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error deleting setting.';
  }
};

// Helper functions for specific settings
export const getOpenAIApiKey = async (): Promise<string | null> => {
  return await getSetting(SETTING_KEYS.OPENAI_API_KEY);
};

export const setOpenAIApiKey = async (apiKey: string): Promise<string> => {
  return await setSetting(SETTING_KEYS.OPENAI_API_KEY, apiKey, 'OpenAI API Key for AI responses');
};

export const getAppTitle = async (): Promise<string> => {
  const title = await getSetting(SETTING_KEYS.APP_TITLE);
  return title || 'Multi-Agent RAG Chatbot'; // Default title
};

export const setAppTitle = async (title: string): Promise<string> => {
  return await setSetting(SETTING_KEYS.APP_TITLE, title, 'Application title displayed in the header');
};