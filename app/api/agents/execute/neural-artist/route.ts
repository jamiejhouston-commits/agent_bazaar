import Replicate from 'replicate';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

const getReplicateClient = () => {
  if (!process.env.REPLICATE_API_TOKEN) {
    return null;
  }
  return new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });
};

export async function POST(request: NextRequest) {
  const { prompt, style, transaction_id } = await request.json();

  try {
    if (!prompt) {
      const errorMsg = 'Prompt is required';
      if (transaction_id) {
        await supabase
          .from('transactions')
          .update({ error_message: errorMsg })
          .eq('id', transaction_id);
      }
      return Response.json({ error: errorMsg }, { status: 400 });
    }

    const replicate = getReplicateClient();
    if (!replicate) {
      const errorMsg = 'Replicate API token not configured';
      if (transaction_id) {
        await supabase
          .from('transactions')
          .update({ error_message: errorMsg })
          .eq('id', transaction_id);
      }
      return Response.json({
        error: errorMsg,
        details: 'Please set REPLICATE_API_TOKEN environment variable'
      }, { status: 500 });
    }

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          style_preset: style || "digital-art"
        }
      }
    );

    const outputData = {
      success: true,
      image_url: output,
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
    console.error('Neural Artist error:', error);
    const errorMsg = 'Failed to generate image: ' + error.message;

    // Update transaction with error_message
    if (transaction_id) {
      await supabase
        .from('transactions')
        .update({ error_message: errorMsg })
        .eq('id', transaction_id);
    }

    return Response.json({
      error: 'Failed to generate image',
      details: error.message
    }, { status: 500 });
  }
}
