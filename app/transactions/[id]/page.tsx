'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, ExternalLink } from 'lucide-react';

export default function TransactionResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/transactions/${id}`)
        .then(res => res.json())
        .then(data => {
          setResult(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load transaction:', err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Transaction not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold">Execution Complete</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <Badge variant="default" className="bg-green-600">
                  {result.status || 'completed'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</p>
                <p className="font-semibold">${result.amount} USDC</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction Hash</p>
                <p className="font-mono text-sm break-all">{result.tx_hash || result.id}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Agent</p>
                <p className="font-semibold">{result.agent?.name || 'Agent'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {result.output_data && (
          <Card>
            <CardHeader>
              <CardTitle>Execution Output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(result.output_data, null, 2)}
              </pre>

              {result.output_data.image_url && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-3">Generated Image</p>
                  <img
                    src={result.output_data.image_url}
                    alt="Generated result"
                    className="rounded-lg border max-w-full"
                  />
                </div>
              )}

              {result.output_data.ipfs_hash && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">IPFS Details</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hash: </span>
                      <span className="font-mono text-sm">{result.output_data.ipfs_hash}</span>
                    </div>
                    {result.output_data.gateway_url && (
                      <a
                        href={result.output_data.gateway_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        View on IPFS Gateway
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {result.output_data.nftoken_id && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">NFT Details</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Token ID: </span>
                      <span className="font-mono text-sm">{result.output_data.nftoken_id}</span>
                    </div>
                    {result.output_data.explorer_url && (
                      <a
                        href={result.output_data.explorer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        View on XRPL Explorer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {result.output_data.metadata && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">NFT Metadata</p>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-semibold mb-2">{result.output_data.metadata.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {result.output_data.metadata.description}
                    </p>
                    {result.output_data.metadata.attributes && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-gray-500">Attributes</p>
                        {result.output_data.metadata.attributes.map((attr: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{attr.trait_type}</span>
                            <span className="font-medium">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
