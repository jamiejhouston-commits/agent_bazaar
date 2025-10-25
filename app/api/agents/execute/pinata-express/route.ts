import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { file_url, transaction_id } = await request.json();

    if (!file_url) {
      return Response.json({ error: 'File URL is required' }, { status: 400 });
    }

    const fileResponse = await fetch(file_url);
    if (!fileResponse.ok) {
      return Response.json({ error: 'Failed to fetch file' }, { status: 400 });
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
      return Response.json({
        error: 'Failed to upload to IPFS',
        details: errorData
      }, { status: 500 });
    }

    const { IpfsHash } = await pinataResponse.json();

    return Response.json({
      success: true,
      ipfs_hash: IpfsHash,
      gateway_url: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
      transaction_id
    });
  } catch (error: any) {
    console.error('Pinata Express error:', error);
    return Response.json({
      error: 'Failed to upload to IPFS',
      details: error.message
    }, { status: 500 });
  }
}
