import Replicate from 'replicate';
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

const getReplicateClient = () => {
  if (!process.env.REPLICATE_API_TOKEN) {
    return null;
  }
  return new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });
};

export async function POST(request: NextRequest) {
  let transaction_id: string | undefined;

  try {
    const body = await request.json();
    const { prompt, transaction_id: txId } = body;
    transaction_id = txId;

    console.log('[Neural Artist] Starting execution:', { prompt, transaction_id });

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      const errorMsg = 'Valid prompt required';
      console.error('[Neural Artist] Validation error:', errorMsg);

      if (transaction_id) {
        await supabaseAdmin
          .from('transactions')
          .update({
            status: 'failed',
            error_message: errorMsg,
          })
          .eq('id', transaction_id);
      }

      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Check Replicate API token
    const replicate = getReplicateClient();
    if (!replicate) {
      const errorMsg = 'Replicate API token not configured';
      console.error('[Neural Artist] Configuration error:', errorMsg);

      if (transaction_id) {
        await supabaseAdmin
          .from('transactions')
          .update({
            status: 'failed',
            error_message: errorMsg,
          })
          .eq('id', transaction_id);
      }

      return NextResponse.json({
        error: errorMsg,
        details: 'Please set REPLICATE_API_TOKEN environment variable'
      }, { status: 500 });
    }

    console.log('[Neural Artist] Running SDXL model on Replicate...');

    // Run SDXL model on Replicate
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt.trim(),
          negative_prompt: "ugly, blurry, low quality, distorted, deformed",
          width: 1024,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: 25,
          guidance_scale: 7.5,
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    console.log('[Neural Artist] Image generated successfully:', imageUrl);

    const outputData = {
      success: true,
      image_url: imageUrl,
      prompt: prompt.trim(),
      model: 'Stable Diffusion XL',
      timestamp: new Date().toISOString(),
    };

    // Update transaction with results
    if (transaction_id) {
      await supabaseAdmin
        .from('transactions')
        .update({
          output_data: outputData,
          status: 'completed',
        })
        .eq('id', transaction_id);

      console.log('[Neural Artist] Transaction updated successfully');
    }

    return NextResponse.json({
      success: true,
      data: outputData,
      transaction_id,
    });

  } catch (error: any) {
    console.error('[Neural Artist] Execution error:', error);
    const errorMsg = error.message || 'Failed to generate image';

    // Update transaction with error using transaction_id from line 29 (already in scope)
    if (transaction_id) {
      try {
        await supabaseAdmin
          .from('transactions')
          .update({
            status: 'failed',
            error_message: errorMsg,
          })
          .eq('id', transaction_id);
        console.log('[Neural Artist] Transaction marked as failed');
      } catch (dbError) {
        console.error('[Neural Artist] Failed to update transaction:', dbError);
      }
    }

    return NextResponse.json({
      error: 'Failed to generate image',
      details: errorMsg,
    }, { status: 500 });
  }
}
