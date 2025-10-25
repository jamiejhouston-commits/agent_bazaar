import { Client, Wallet, xrpToDrops } from 'xrpl';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { metadata_uri, recipient_address, transaction_id } = await request.json();
  let client: Client | null = null;

  try {
    if (!metadata_uri) {
      const errorMsg = 'Metadata URI is required';
      if (transaction_id) {
        await supabase
          .from('transactions')
          .update({ error_message: errorMsg })
          .eq('id', transaction_id);
      }
      return Response.json({ error: errorMsg }, { status: 400 });
    }

    client = new Client(process.env.XRPL_NETWORK || 'wss://xrplcluster.com');
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

    const outputData = {
      success: true,
      nft_token_id: nftokenID,
      tx_hash: response.result.hash,
      explorer_url: `https://livenet.xrpl.org/transactions/${response.result.hash}`,
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
    console.error('XRPL Minter error:', error);
    const errorMsg = 'Failed to mint NFT on XRPL: ' + error.message;

    if (client) {
      try {
        await client.disconnect();
      } catch (e) {
        console.error('Failed to disconnect XRPL client:', e);
      }
    }

    // Update transaction with error_message
    if (transaction_id) {
      await supabase
        .from('transactions')
        .update({ error_message: errorMsg })
        .eq('id', transaction_id);
    }

    return Response.json({
      error: 'Failed to mint NFT on XRPL',
      details: error.message
    }, { status: 500 });
  }
}
