'use server';

import postgres from 'postgres';

// Create a direct postgres connection for settings
const client = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ragtutorial');

export const getSetting = async (key: string): Promise<string | null> => {
  try {
    const result = await client`SELECT value FROM settings WHERE key = ${key} LIMIT 1`;
    
    return result[0]?.value || null;
  } catch (error) {
    console.error('Error fetching setting:', error);
    return null;
  }
};

export const getAllSettings = async () => {
  try {
    const result = await client`SELECT key, value FROM settings`;
    
    const settingsMap: Record<string, string> = {};
    result.forEach((row: any) => {
      settingsMap[row.key] = row.value;
    });
    
    return settingsMap;
  } catch (error) {
    console.error('Error fetching all settings:', error);
    return {};
  }
};

export const setSetting = async (key: string, value: string, description?: string) => {
  try {
    // Check if setting already exists
    const existing = await client`SELECT id FROM settings WHERE key = ${key} LIMIT 1`;
    
    if (existing.length > 0) {
      // Update existing setting
      await client`UPDATE settings SET value = ${value}, updated_at = NOW() WHERE key = ${key}`;
    } else {
      // Create new setting
      const id = Math.random().toString(36).substr(2, 9);
      await client`INSERT INTO settings (id, key, value, description, created_at, updated_at) VALUES (${id}, ${key}, ${value}, ${description || null}, NOW(), NOW())`;
    }
    
    return 'Setting saved successfully.';
  } catch (error) {
    console.error('Error saving setting:', error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error saving setting.';
  }
};

export const deleteSetting = async (key: string) => {
  try {
    await client`DELETE FROM settings WHERE key = ${key}`;
    
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
  return await getSetting('openai_api_key');
};

export const setOpenAIApiKey = async (apiKey: string): Promise<string> => {
  return await setSetting('openai_api_key', apiKey, 'OpenAI API Key for AI responses');
};

export const getAppTitle = async (): Promise<string> => {
  const title = await getSetting('app_title');
  return title || 'Multi-Agent RAG Chatbot'; // Default title
};

export const setAppTitle = async (title: string): Promise<string> => {
  return await setSetting('app_title', title, 'Application title displayed in the header');
};

export const getOpenAIModel = async (): Promise<string> => {
  const model = await getSetting('openai_model');
  return model || 'gpt-4o'; // Default model
};

export const setOpenAIModel = async (model: string): Promise<string> => {
  return await setSetting('openai_model', model, 'OpenAI model for AI responses');
};