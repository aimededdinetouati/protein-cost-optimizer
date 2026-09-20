import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, saveUserProfile } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const profile = await getUserProfile(email);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();
    if (!email || !body.foods || !Array.isArray(body.foods)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updatedProfile = await saveUserProfile(body);
    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Failed to save user profile:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
