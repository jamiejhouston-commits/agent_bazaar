import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { wallet_address, transaction_id } = await request.json();

  try {
    if (!wallet_address) {
      const errorMsg = 'Wallet address is required';
      if (transaction_id) {
        await supabase
          .from('transactions')
          .update({ error_message: errorMsg })
          .eq('id', transaction_id);
      }
      return Response.json({ error: errorMsg }, { status: 400 });
    }

    // NOTE: This is demo data. In production, this would fetch real blockchain data
    const portfolioData = {
      total_nfts: 42,
      total_value_usd: 1250.00,
      top_collection: "Bored Ape Yacht Club",
      portfolio: [
        { asset: "Bored Ape Yacht Club", value: "$91.0", allocation: "4.8%" },
        { asset: "CryptoPunks", value: "$62.3", allocation: "5.0%" },
        { asset: "Art Blocks", value: "$4.0", allocation: "11.9%" },
      ],
      recommendations: [
        "Consider diversifying into Art Blocks",
        "Your CryptoPunks are undervalued by 15%",
        "BAYC floor price trending up 8% this week"
      ],
      wallet_address,
      demo_mode: true
    };

    const outputData = {
      success: true,
      ...portfolioData,
    };

    // Update transaction with output_data
    if (transaction_id) {
      await supabase
        .from('transactions')
        .update({ output_data: outputData })
        .eq('id', transaction_id);
    }

    return Response.json({
      ...outputData,
      transaction_id
    });
  } catch (error: any) {
    console.error('Collection Curator error:', error);
    const errorMsg = 'Failed to analyze collection: ' + error.message;

    // Update transaction with error_message
    if (transaction_id) {
      await supabase
        .from('transactions')
        .update({ error_message: errorMsg })
        .eq('id', transaction_id);
    }

    return Response.json({
      error: 'Failed to analyze collection',
      details: error.message
    }, { status: 500 });
  }
}
