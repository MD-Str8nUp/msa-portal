import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('👋 User logout');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Error in logout:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
