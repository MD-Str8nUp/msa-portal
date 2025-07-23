import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scoutId = searchParams.get('scoutId');
    const type = searchParams.get('type');
    
    let query = supabase
      .from('achievements')
      .select(`
        *,
        scout:scouts(id, first_name, last_name)
      `);

    if (scoutId) {
      query = query.eq('scout_id', scoutId);
    }
    
    if (type) {
      query = query.eq('type', type);
    }

    const { data: achievements, error } = await query.order('date_earned', { ascending: false });

    if (error) {
      console.error('❌ Error fetching achievements:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch achievements'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: achievements || []
    });

  } catch (error) {
    console.error('❌ Error in achievements GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scoutId, title, description, type = 'BADGE', dateEarned } = body;

    if (!scoutId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Scout ID and title are required'
      }, { status: 400 });
    }

    const { data: newAchievement, error } = await supabase
      .from('achievements')
      .insert({
        scout_id: scoutId,
        title,
        description,
        type,
        date_earned: dateEarned || new Date().toISOString()
      })
      .select(`
        *,
        scout:scouts(id, first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('❌ Error creating achievement:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create achievement'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Achievement created successfully',
      data: newAchievement
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in achievements POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
