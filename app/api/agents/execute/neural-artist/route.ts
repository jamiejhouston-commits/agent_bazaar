import Replicate from 'replicate';
import { NextRequest } from 'next/server';

const getReplicateClient = () => {
  if (!process.env.REPLICATE_API_TOKEN) {
    return null;
  }
  return new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, transaction_id } = await request.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const replicate = getReplicateClient();
    if (!replicate) {
      return Response.json({
        error: 'Replicate API token not configured',
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

    return Response.json({
      success: true,
      image_url: output,
      transaction_id
    });
  } catch (error: any) {
    console.error('Neural Artist error:', error);
    return Response.json({
      error: 'Failed to generate image',
      details: error.message
    }, { status: 500 });
  }
}
