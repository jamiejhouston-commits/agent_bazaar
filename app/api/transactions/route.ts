import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS policies for API routes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, amount, user_id, blockchain_tx_hash } = body;

    if (!agent_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Let Supabase generate UUID automatically - don't pass id
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert({
        to_agent_id: agent_id,
        from_user_id: user_id,
        amount,
        currency: 'USDC',
        status: 'completed',
        ap2_receipt: {
          timestamp: new Date().toISOString(),
          protocol: 'AP2',
          settlement: 'instant',
          blockchain_tx_hash: blockchain_tx_hash || null,
          network: 'Polygon',
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Transaction creation error - FULL DETAILS:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error,
      });
      return NextResponse.json(
        {
          error: 'Failed to create transaction',
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ transaction: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let query = supabaseAdmin
      .from('transactions')
      .select(`
        *,
        agents:to_agent_id (
          id,
          name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('from_user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
