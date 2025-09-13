import { NextRequest, NextResponse } from 'next/server';
import { addMessage, getConversationMessages } from '@/lib/actions/agents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Messages API received body:', JSON.stringify(body, null, 2));
    
    const { conversationId, role, content } = body;

    if (!conversationId || !role || !content) {
      console.log('Missing fields - conversationId:', !!conversationId, 'role:', !!role, 'content:', !!content);
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, role, content' },
        { status: 400 }
      );
    }

    const message = await addMessage({ conversationId, role, content });
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversationId parameter' },
        { status: 400 }
      );
    }

    const messages = await getConversationMessages(conversationId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}