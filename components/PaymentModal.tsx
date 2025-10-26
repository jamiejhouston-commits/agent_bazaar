"use client";

import { useState, useEffect } from 'react';
import { Agent } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { CircleCheck as CheckCircle2, Loader as Loader2, Shield, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  agent: Agent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (transactionId: string) => void;
}

type PaymentState = 'form' | 'processing' | 'confirming' | 'success' | 'error';

// USDC contract address on Polygon
const USDC_CONTRACT_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as const;

// Platform wallet address
const PLATFORM_WALLET = '0x08b8a56F89C4cFe2e90B9443b198fb00deD7f8D9' as const;

// Platform fee (7%)
const PLATFORM_FEE_PERCENT = 0.07;

// ERC20 ABI for transfer function
const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

export function PaymentModal({ agent, open, onOpenChange, onSuccess }: PaymentModalProps) {
  const [state, setState] = useState<PaymentState>('form');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [blockchainTxHash, setBlockchainTxHash] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculate total with 7% platform fee
  const agentPrice = agent.pricing.per_task;
  const platformFee = agentPrice * PLATFORM_FEE_PERCENT;
  const totalAmount = agentPrice + platformFee;

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to execute agents',
        variant: 'destructive',
      });
      router.push('/auth/signin');
      return;
    }

    if (!isConnected || !address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to continue',
        variant: 'destructive',
      });
      return;
    }

    try {
      setState('processing');

      // Convert amount to USDC (6 decimals)
      const amountInUSDC = parseUnits(totalAmount.toFixed(6), 6);

      // Call USDC contract transfer function
      writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [PLATFORM_WALLET, amountInUSDC],
      });

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setState('error');
      toast({
        title: 'Payment failed',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
    }
  };

  const handleBlockchainSuccess = async (txHash: `0x${string}`) => {
    try {
      setBlockchainTxHash(txHash);

      // Record transaction in database with blockchain tx hash
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agent.id,
          amount: totalAmount,
          user_id: user?.id,
          blockchain_tx_hash: txHash,
        }),
      });

      const data = await response.json();

      if (response.ok && data.transaction) {
        setTransactionId(data.transaction.id);

        // Trigger agent execution after successful payment
        try {
          const agentSlug = agent.name.toLowerCase().replace(/\s+/g, '-');
          const executeResponse = await fetch(`/api/agents/execute/${agentSlug}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transaction_id: data.transaction.id,
              prompt: 'a beautiful sunset over mountains',
              nft_name: 'My NFT',
              collection_type: 'Digital Art',
              file_url: 'https://via.placeholder.com/500',
              metadata_uri: 'ipfs://example',
              wallet_address: address,
            }),
          });

          const executeResult = await executeResponse.json();

          if (!executeResponse.ok) {
            console.error('Agent execution error:', executeResult);
          }
        } catch (executeError) {
          console.error('Failed to execute agent:', executeError);
          // Continue anyway - payment was successful
        }

        setState('success');

        toast({
          title: 'Payment successful!',
          description: 'Your transaction has been confirmed on the blockchain',
        });

        if (onSuccess) {
          onSuccess(data.transaction.id);
        }

        // Redirect to transaction details page after 2 seconds
        setTimeout(() => {
          router.push(`/transactions/${data.transaction.id}`);
        }, 2000);
      } else {
        setState('error');
        toast({
          title: 'Database error',
          description: data.error || 'Failed to record transaction',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Transaction recording error:', error);
      setState('error');
      toast({
        title: 'Error',
        description: 'Payment succeeded but failed to record transaction',
        variant: 'destructive',
      });
    }
  };

  const resetAndClose = () => {
    setState('form');
    setAgreedToTerms(false);
    setTransactionId('');
    setBlockchainTxHash('');
    onOpenChange(false);
  };

  // Watch for transaction confirmation
  useEffect(() => {
    if (isConfirming && state !== 'confirming') {
      setState('confirming');
    }
  }, [isConfirming, state]);

  // Handle successful blockchain confirmation
  useEffect(() => {
    if (isConfirmed && hash && state === 'confirming') {
      handleBlockchainSuccess(hash);
    }
  }, [isConfirmed, hash, state]);

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Required</DialogTitle>
          <DialogDescription>
            Pay with USDC on Polygon to execute this agent
          </DialogDescription>
        </DialogHeader>

        {state === 'form' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={agent.avatar_url || undefined} alt={agent.name} />
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {agent.category}
                </p>
              </div>
            </div>

            <div className="border-t border-b py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Agent Fee</span>
                <span className="font-medium">${agentPrice.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Platform Fee (7%)</span>
                <span className="font-medium">${platformFee.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">${totalAmount.toFixed(3)}</div>
                  <Badge variant="secondary" className="text-xs">USDC on Polygon</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Secured by Blockchain</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      On-chain payment with cryptographic proof
                    </div>
                  </div>
                </div>
              </div>

              {!isConnected ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Connect your wallet to continue with payment
                  </div>
                  <div className="flex justify-center">
                    <ConnectButton
                      label="Connect Wallet"
                      showBalance={false}
                      accountStatus="address"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Connected Wallet</div>
                        <div className="text-sm">
                          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                        </div>
                      </div>
                      <ConnectButton
                        showBalance={true}
                        accountStatus="address"
                        chainStatus="icon"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions
                    </label>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="lg"
                    onClick={handlePayment}
                    disabled={!agreedToTerms}
                  >
                    Pay ${totalAmount.toFixed(3)} USDC
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {state === 'processing' && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Approve in Wallet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please approve the transaction in your wallet
            </p>
          </div>
        )}

        {state === 'confirming' && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Confirming on Blockchain</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Waiting for transaction confirmation...
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your agent will now execute. Transaction ID: {transactionId}
            </p>
            {blockchainTxHash && (
              <a
                href={`https://polygonscan.com/tx/${blockchainTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
              >
                View on Polygonscan
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <Button onClick={resetAndClose} className="w-full mt-4">
              View Receipt
            </Button>
          </div>
        )}

        {state === 'error' && (
          <div className="py-12 text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
              <span className="text-2xl">✕</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              There was an error processing your payment
            </p>
            <Button onClick={() => setState('form')} className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
