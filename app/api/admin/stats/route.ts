import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const total_transactions = transactions?.length || 0;
    const total_volume = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    const total_revenue = total_volume * 0.07;

    return Response.json({
      total_transactions,
      total_revenue,
      total_volume,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
