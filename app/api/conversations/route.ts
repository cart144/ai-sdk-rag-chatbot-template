import { NextRequest, NextResponse } from 'next/server';
import { createConversation, getConversationsByAgent, deleteConversation } from '@/lib/actions/agents';

export async function POST(request: NextRequest) {
  try {
    const { title, agentId } = await request.json();

    if (!title || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, agentId' },
        { status: 400 }
      );
    }

    const conversation = await createConversation({ title, agentId });
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId parameter' },
        { status: 400 }
      );
    }

    const conversations = await getConversationsByAgent(agentId);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    return NextResponse.json(
      { error: 'Failed to get conversations' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversation id' },
        { status: 400 }
      );
    }

    const result = await deleteConversation(conversationId);
    return NextResponse.json({ message: result });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}