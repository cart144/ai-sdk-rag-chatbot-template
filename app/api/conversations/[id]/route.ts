import { NextRequest, NextResponse } from 'next/server';
import { updateConversationTitle } from '@/lib/actions/agents';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title } = await request.json();
    const conversationId = params.id;

    if (!title) {
      return NextResponse.json(
        { error: 'Missing title field' },
        { status: 400 }
      );
    }

    const result = await updateConversationTitle(conversationId, title);
    return NextResponse.json({ message: result });
  } catch (error) {
    console.error('Error updating conversation title:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation title' },
      { status: 500 }
    );
  }
}