import { NextRequest, NextResponse } from 'next/server';
import { saveAgentConfig, getAgentConfig } from '@/lib/actions/agents';

export async function POST(request: NextRequest) {
  try {
    const { agentId, systemPrompt, name, avatar } = await request.json();

    if (!agentId || !systemPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, systemPrompt' },
        { status: 400 }
      );
    }

    const result = await saveAgentConfig({ agentId, systemPrompt, name, avatar });

    if (result === 'Agent configuration saved successfully.') {
      return NextResponse.json({ message: result });
    } else {
      return NextResponse.json({ error: result }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in agent config API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const config = await getAgentConfig(agentId);

    if (!config) {
      return NextResponse.json(
        { error: 'Agent configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error in agent config API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}