import { NextResponse } from 'next/server';
import { userService } from '@/lib/services/supabaseService';

export async function GET() {
  try {
    const users = await userService.getAllUsers();
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status
      }))
    });
  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}