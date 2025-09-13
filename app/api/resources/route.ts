import { NextRequest, NextResponse } from 'next/server';
import { getResourcesByAgent, createResource, deleteResource } from '@/lib/actions/resources';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId parameter is required' },
        { status: 400 }
      );
    }

    const resources = await getResourcesByAgent(agentId);
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, agentId } = body;

    if (!content || !agentId) {
      return NextResponse.json(
        { error: 'content and agentId are required' },
        { status: 400 }
      );
    }

    const result = await createResource({ content, agentId });
    return NextResponse.json({ message: result });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');

    if (!resourceId) {
      return NextResponse.json(
        { error: 'resourceId parameter is required' },
        { status: 400 }
      );
    }

    const result = await deleteResource(resourceId);
    return NextResponse.json({ message: result });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}