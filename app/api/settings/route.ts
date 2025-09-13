import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, setSetting, deleteSetting } from '@/lib/actions/settings-simple';

const SETTING_KEYS = {
  OPENAI_API_KEY: 'openai_api_key',
  APP_TITLE: 'app_title',
  OPENAI_MODEL: 'openai_model',
} as const;

export async function GET(request: NextRequest) {
  try {
    const settings = await getAllSettings();
    
    // Don't return sensitive data like API keys in full
    const publicSettings = {
      ...settings,
      [SETTING_KEYS.OPENAI_API_KEY]: settings[SETTING_KEYS.OPENAI_API_KEY] 
        ? '***[CONFIGURED]***'
        : null
    };
    
    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'key and value are required' },
        { status: 400 }
      );
    }

    // Validate key
    const validKeys = Object.values(SETTING_KEYS);
    if (!validKeys.includes(key)) {
      return NextResponse.json(
        { error: 'Invalid setting key' },
        { status: 400 }
      );
    }

    const result = await setSetting(key, value, description);
    return NextResponse.json({ message: result });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json(
      { error: 'Failed to save setting' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'key parameter is required' },
        { status: 400 }
      );
    }

    // Validate key
    const validKeys = Object.values(SETTING_KEYS);
    if (!validKeys.includes(key as any)) {
      return NextResponse.json(
        { error: 'Invalid setting key' },
        { status: 400 }
      );
    }

    const result = await deleteSetting(key as any);
    return NextResponse.json({ message: result });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}