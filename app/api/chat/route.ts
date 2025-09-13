import { addMessage } from '@/lib/actions/agents';
import { getAgentWithConfigById, getDefaultAgentWithConfig } from '@/lib/agents/config';
import { generateChatResponse } from '@/lib/chat/utils';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Chat API received body:', JSON.stringify(body, null, 2));
    
    const { messages, agentId } = body;
    
    // Get the selected agent or default (with database config)
    const agent = agentId ? await getAgentWithConfigById(agentId) : await getDefaultAgentWithConfig();
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Ensure messages is an array
    const messageArray = Array.isArray(messages) ? messages : [];
    console.log('Processing messages:', messageArray.length, 'messages');
    
    // Use centralized chat function
    const chatResponse = await generateChatResponse(
      messageArray,
      agent.systemPrompt,
      agent.id
    );

    if (!chatResponse.success) {
      return new Response(JSON.stringify({
        error: 'Chat generation failed',
        details: chatResponse.error
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      messages: [...messageArray, { role: 'assistant', content: chatResponse.message }]
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}