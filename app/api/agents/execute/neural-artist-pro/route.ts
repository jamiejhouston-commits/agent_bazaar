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

    console.log('[Neural Artist] Generating image with Pollinations.ai...');

    // FREE image generation using Pollinations.ai
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&nologo=true`;

    console.log('[Neural Artist] Image URL generated:', imageUrl);

    const outputData = {
      success: true,
      image_url: imageUrl,
      prompt: prompt.trim(),
      model: 'Pollinations.ai',
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

    // Update transaction with error
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
