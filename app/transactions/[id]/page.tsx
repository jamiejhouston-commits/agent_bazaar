'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CircleCheck as CheckCircle2, ExternalLink, Download, Image as ImageIcon, FileJson, Link as LinkIcon, Coins, ChartBar as BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  ap2_receipt: {
    blockchain_tx_hash?: string;
    network?: string;
  };
  output_data?: any;
  error_message?: string;
  agent: {
    name: string;
    avatar_url: string;
    category: string;
  };
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    fetchTransaction();
  }, [params.id, user]);

  const fetchTransaction = async () => {
    try {
      const response = await fetch(\`/api/transactions/\${params.id}\`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Transaction not found');
        } else {
          setError('Failed to load transaction');
        }
        return;
      }

      const data = await response.json();
      setTransaction(data);
    } catch (err) {
      console.error('Error fetching transaction:', err);
      setError('Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!transaction) return;

    const receipt = {
      transaction_id: transaction.id,
      agent: transaction.agent.name,
      amount: \`\${transaction.amount} \${transaction.currency}\`,
      status: transaction.status,
      timestamp: transaction.created_at,
      blockchain_tx: transaction.ap2_receipt?.blockchain_tx_hash,
      network: transaction.ap2_receipt?.network,
    };

    const blob = new Blob([JSON.stringify(receipt, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`receipt-\${transaction.id}.json\`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderAgentOutput = () => {
    if (!transaction?.output_data) {
      if (transaction?.error_message) {
        return (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600">Execution Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {transaction.error_message}
              </p>
            </CardContent>
          </Card>
        );
      }

      return (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <p>Agent execution in progress or no output available</p>
          </CardContent>
        </Card>
      );
    }

    const agentName = transaction.agent.name.toLowerCase();
    const output = transaction.output_data;

    // Neural Artist - Display generated image
    if (agentName.includes('neural') || agentName.includes('artist')) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Generated Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {output.image_url && (
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={Array.isArray(output.image_url) ? output.image_url[0] : output.image_url}
                  alt="Generated artwork"
                  className="w-full h-auto"
                />
              </div>
            )}
            {output.image_url && (
              <a
                href={Array.isArray(output.image_url) ? output.image_url[0] : output.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
              >
                View Full Size
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </CardContent>
        </Card>
      );
    }

    // NFT MetaMind - Display metadata JSON
    if (agentName.includes('nft') && agentName.includes('meta')) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              NFT Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(output.metadata || output, null, 2)}
            </pre>
          </CardContent>
        </Card>
      );
    }

    // Pinata Express - Display IPFS hash and link
    if (agentName.includes('pinata')) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              IPFS Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {output.ipfs_hash && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">IPFS Hash:</p>
                <code className="bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded text-sm block break-all">
                  {output.ipfs_hash}
                </code>
              </div>
            )}
            {output.gateway_url && (
              <a
                href={output.gateway_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
              >
                View on IPFS Gateway
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </CardContent>
        </Card>
      );
    }

    // XRPL Minter - Display NFT token info
    if (agentName.includes('xrpl') || agentName.includes('minter')) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              NFT Minted on XRPL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {output.nft_token_id && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">NFT Token ID:</p>
                <code className="bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded text-sm block break-all">
                  {output.nft_token_id}
                </code>
              </div>
            )}
            {output.tx_hash && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Transaction Hash:</p>
                <code className="bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded text-sm block break-all">
                  {output.tx_hash}
                </code>
              </div>
            )}
            {output.explorer_url && (
              <a
                href={output.explorer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
              >
                View on XRPL Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </CardContent>
        </Card>
      );
    }

    // Collection Curator - Display portfolio analysis
    if (agentName.includes('collection') || agentName.includes('curator')) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Portfolio Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {output.portfolio && Array.isArray(output.portfolio) ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">Asset</th>
                      <th className="text-right py-2">Value</th>
                      <th className="text-right py-2">Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {output.portfolio.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{item.asset || item.name}</td>
                        <td className="text-right">{item.value || 'N/A'}</td>
                        <td className="text-right">{item.allocation || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(output, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      );
    }

    // Default - Display raw JSON
    return (
      <Card>
        <CardHeader>
          <CardTitle>Execution Result</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(output, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="py-8 text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
              <span className="text-2xl">✕</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {error || 'Transaction not found'}
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction Receipt</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Transaction ID: <code className="text-sm">{transaction.id}</code>
        </p>
      </div>

      <div className="space-y-6">
        {/* Transaction Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={transaction.agent.avatar_url} alt={transaction.agent.name} />
                <AvatarFallback>{transaction.agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{transaction.agent.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {transaction.agent.category}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  \${transaction.amount.toFixed(3)}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {transaction.currency}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {transaction.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date</p>
                <p className="font-medium">
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {transaction.ap2_receipt?.blockchain_tx_hash && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Blockchain Transaction
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded text-sm truncate">
                    {transaction.ap2_receipt.blockchain_tx_hash}
                  </code>
                  <a
                    href={\`https://polygonscan.com/tx/\${transaction.ap2_receipt.blockchain_tx_hash}\`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 whitespace-nowrap"
                  >
                    View on Polygonscan
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button onClick={downloadReceipt} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Agent Output Card */}
        {renderAgentOutput()}
      </div>
    </div>
  );
}

      )
    }
  }
}
      )
    }
  }
}