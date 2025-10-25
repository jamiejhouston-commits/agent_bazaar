import { Client, Wallet, xrpToDrops } from 'xrpl';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { metadata_uri, recipient_address, transaction_id } = await request.json();

    if (!metadata_uri) {
      return Response.json({ error: 'Metadata URI is required' }, { status: 400 });
    }

    const client = new Client(process.env.XRPL_NETWORK || 'wss://xrplcluster.com');
    await client.connect();

    const wallet = Wallet.fromSeed(process.env.XRPL_ADMIN_SEED!);

    const mintTx: any = {
      TransactionType: 'NFTokenMint',
      Account: wallet.address,
      URI: Buffer.from(metadata_uri).toString('hex'),
      Flags: 8,
      TransferFee: 7500,
      NFTokenTaxon: 0,
    };

    const response = await client.submitAndWait(mintTx, { wallet });

    const meta = response.result.meta as any;
    let nftokenID = '';

    for (const node of meta.AffectedNodes) {
      if (node.CreatedNode?.LedgerEntryType === 'NFTokenPage') {
        nftokenID = node.CreatedNode.NewFields.NFTokens[0].NFToken.NFTokenID;
        break;
      }
    }

    await client.disconnect();

    return Response.json({
      success: true,
      nftoken_id: nftokenID,
      explorer_url: `https://livenet.xrpl.org/transactions/${response.result.hash}`,
      transaction_id
    });
  } catch (error: any) {
    console.error('XRPL Minter error:', error);
    return Response.json({
      error: 'Failed to mint NFT on XRPL',
      details: error.message
    }, { status: 500 });
  }
}
