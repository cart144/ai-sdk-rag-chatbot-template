import { openai } from '@ai-sdk/openai';
import { getOpenAIApiKey } from '@/lib/actions/settings-simple';

// Create OpenAI client with dynamic API key from settings
export async function createOpenAIClient() {
  const apiKey = await getOpenAIApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API Key non configurata. Vai nelle impostazioni per configurarla.');
  }
  
  return openai.provider({
    apiKey: apiKey,
  });
}

// Create embedding model with dynamic API key
export async function createEmbeddingModel() {
  const client = await createOpenAIClient();
  return client.embedding('text-embedding-ada-002');
}

// Create chat model with dynamic API key
export async function createChatModel(modelName: string = 'gpt-4o') {
  const client = await createOpenAIClient();
  return client.languageModel(modelName);
}