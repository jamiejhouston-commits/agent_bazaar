import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        to_agent_id: agent_id,
        from_user_id: user_id,
        amount,
        currency: 'USDC',
        status: 'completed',
        ap2_receipt: {
          transaction_id: transactionId,
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
      console.error('Transaction creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create transaction' },
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

    let query = supabase
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
