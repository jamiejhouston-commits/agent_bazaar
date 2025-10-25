import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { file_url, transaction_id } = await request.json();

  try {
    if (!file_url) {
      const errorMsg = 'File URL is required';
      if (transaction_id) {
        await supabase
          .from('transactions')
          .update({ error_message: errorMsg })
          .eq('id', transaction_id);
      }
      return Response.json({ error: errorMsg }, { status: 400 });
    }

    const fileResponse = await fetch(file_url);
    if (!fileResponse.ok) {
      const errorMsg = 'Failed to fetch file';
      if (transaction_id) {
        await supabase
          .from('transactions')
          .update({ error_message: errorMsg })
          .eq('id', transaction_id);
      }
      return Response.json({ error: errorMsg }, { status: 400 });
    }

    const fileBlob = await fileResponse.blob();

    const formData = new FormData();
    formData.append('file', fileBlob);

    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formData,
    });

    if (!pinataResponse.ok) {
      const errorData = await pinataResponse.json();
      const errorMsg = 'Failed to upload to IPFS';
      if (transaction_id) {
        await supabase
          .from('transactions')
          .update({ error_message: errorMsg })
          .eq('id', transaction_id);
      }
      return Response.json({
        error: errorMsg,
        details: errorData
      }, { status: 500 });
    }

    const { IpfsHash } = await pinataResponse.json();

    const outputData = {
      success: true,
      ipfs_hash: IpfsHash,
      gateway_url: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
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
    console.error('Pinata Express error:', error);
    const errorMsg = 'Failed to upload to IPFS: ' + error.message;

    // Update transaction with error_message
    if (transaction_id) {
      await supabase
        .from('transactions')
        .update({ error_message: errorMsg })
        .eq('id', transaction_id);
    }

    return Response.json({
      error: 'Failed to upload to IPFS',
      details: error.message
    }, { status: 500 });
  }
}
