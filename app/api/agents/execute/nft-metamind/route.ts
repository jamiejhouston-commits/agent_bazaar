import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export async function POST(request: NextRequest) {
  try {
    const { nft_name, collection_type, transaction_id } = await request.json();

    if (!nft_name) {
      return Response.json({ error: 'NFT name is required' }, { status: 400 });
    }

    const openai = getOpenAIClient();
    if (!openai) {
      return Response.json({
        error: 'OpenAI API key not configured',
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

    return Response.json({
      success: true,
      metadata,
      transaction_id
    });
  } catch (error: any) {
    console.error('NFT MetaMind error:', error);
    return Response.json({
      error: 'Failed to generate metadata',
      details: error.message
    }, { status: 500 });
  }
}
