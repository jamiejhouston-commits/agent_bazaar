import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export async function POST(request: NextRequest) {
  const { nft_name, collection_type, transaction_id } = await request.json();

  try {
    if (!nft_name) {
      const errorMsg = 'NFT name is required';
      if (transaction_id) {
        await supabase
          .from('transactions')
          .update({ error_message: errorMsg })
          .eq('id', transaction_id);
      }
      return Response.json({ error: errorMsg }, { status: 400 });
    }

    const openai = getOpenAIClient();
    if (!openai) {
      const errorMsg = 'OpenAI API key not configured';
      if (transaction_id) {
        await supabase
          .from('transactions')
          .update({ error_message: errorMsg })
          .eq('id', transaction_id);
      }
      return Response.json({
        error: errorMsg,
        details: 'Please set OPENAI_API_KEY environment variable'
      }, { status: 500 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: `Generate NFT metadata for: ${nft_name}. Collection type: ${collection_type || 'Digital Art'}. Return ONLY valid JSON with name, description, and 5 attributes array with trait_type and value fields.`
      }],
      response_format: { type: "json_object" }
    });

    const metadata = JSON.parse(completion.choices[0].message.content || '{}');

    const outputData = {
      success: true,
      metadata,
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
    console.error('NFT MetaMind error:', error);
    const errorMsg = 'Failed to generate metadata: ' + error.message;

    // Update transaction with error_message
    if (transaction_id) {
      await supabase
        .from('transactions')
        .update({ error_message: errorMsg })
        .eq('id', transaction_id);
    }

    return Response.json({
      error: 'Failed to generate metadata',
      details: error.message
    }, { status: 500 });
  }
}
