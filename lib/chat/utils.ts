import { createResource, upsertResource } from '@/lib/actions/resources';
import { findRelevantContent } from '@/lib/ai/embedding';
import { getOpenAIModel } from '@/lib/actions/settings-simple';
import { openai } from '@ai-sdk/openai';
import { generateText, streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  success: boolean;
  error?: string;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  systemPrompt: string,
  agentId: string
): Promise<ChatResponse> {
  try {
    // Handle undefined or null messages array
    if (!messages || !Array.isArray(messages)) {
      return {
        message: 'Ciao! Come posso aiutarti oggi?',
        success: true
      };
    }

    // Validate and format messages
    const validMessages = messages
      .filter(msg => msg.role && msg.content && typeof msg.content === 'string')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content.trim()
      }))
      .filter(msg => msg.content.length > 0);

    if (validMessages.length === 0) {
      return {
        message: 'Ciao! Come posso aiutarti oggi?',
        success: true
      };
    }

    console.log('Generating response for', validMessages.length, 'messages');
    console.log('System prompt length:', systemPrompt.length);
    console.log('Agent ID:', agentId);

    // Get the user's last message for RAG search
    const lastMessage = validMessages[validMessages.length - 1];
    const isUserMessage = lastMessage?.role === 'user';
    console.log('Last message is user message:', isUserMessage);

    console.log('Starting streamText call...');
    
    // Get configured OpenAI model
    const configuredModel = await getOpenAIModel();
    console.log('Using OpenAI model:', configuredModel);
    
    const result = await streamText({
      model: openai(configuredModel),
      system: systemPrompt,
      messages: validMessages,
      maxTokens: 1500,
      temperature: 0.7,
      stopWhen: stepCountIs(5),
      tools: {
        getInformation: tool({
          description: 'get information from your knowledge base to answer questions.',
          inputSchema: z.object({
            question: z.string().describe('the users question')
          }),
          execute: async ({ question }) => {
            try {
              console.log('RAG search started for:', question);
              
              const relevantContent = await findRelevantContent(question, agentId);
              
              console.log('RAG search completed, found:', relevantContent?.length || 0, 'results');
              
              if (relevantContent && Array.isArray(relevantContent) && relevantContent.length > 0) {
                const content = relevantContent
                  .slice(0, 3)
                  .map(c => c.name)
                  .join('\n\n');
                
                console.log('RAG tool returning content:', content);
                
                return content;
              }
              
              return 'No relevant information found.';
            } catch (error) {
              console.error('RAG search error:', error);
              return 'Unable to search knowledge base.';
            }
          },
        }),
        saveInformation: tool({
          description: 'Save important information from user messages to the knowledge base for future reference',
          inputSchema: z.object({
            content: z.string().describe('The important information to save'),
            category: z.string().optional().describe('Category or type of information (e.g., company_info, preferences, facts)')
          }),
          execute: async ({ content, category }) => {
            try {
              console.log('Tool saveInformation called with:', { content, category, agentId });
              
              const result = await createResource({
                content: content,
                agentId: agentId,
                category: category
              });
              
              console.log('createResource returned:', result);
              
              return 'Informazione salvata con successo nella knowledge base.';
            } catch (error) {
              console.error('Error in saveInformation tool:', error);
              return 'Errore nel salvare l\'informazione.';
            }
          },
        }),
        updateInformation: tool({
          description: 'Update or save information that might replace existing data in the same category (e.g., user name, preferences, personal details)',
          inputSchema: z.object({
            content: z.string().describe('The information to save or update - include context and full description'),
            category: z.string().describe('Category of information - will replace existing info in same category (e.g., user_name, user_preferences, user_location, user_interests)')
          }),
          execute: async ({ content, category }) => {
            try {
              console.log('Tool updateInformation called with:', { content, category, agentId });
              
              const result = await upsertResource({
                content: content,
                agentId: agentId,
                category: category
              });
              
              console.log('upsertResource returned:', result);
              
              return `Informazione "${category}" aggiornata con successo nella knowledge base.`;
            } catch (error) {
              console.error('Error in updateInformation tool:', error);
              return 'Errore nell\'aggiornare l\'informazione.';
            }
          },
        })
      },
    });

    console.log('streamText completed successfully');
    const fullText = await result.text;
    console.log('Response length:', fullText.length);

    return {
      message: fullText,
      success: true
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    return {
      message: 'Mi dispiace, ho avuto un problema nel processare la tua richiesta. Potresti riprovare?',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}