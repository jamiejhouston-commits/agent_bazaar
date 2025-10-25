"use client";

import { useState } from 'react';
import { Agent } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
import { CheckCircle2, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  agent: Agent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (transactionId: string) => void;
}

type PaymentState = 'form' | 'processing' | 'success' | 'error';

export function PaymentModal({ agent, open, onOpenChange, onSuccess }: PaymentModalProps) {
  const [state, setState] = useState<PaymentState>('form');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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

    setState('processing');

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agent.id,
          amount: agent.pricing.per_task,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.transaction) {
        setTransactionId(data.transaction.id);
        setState('success');
        toast({
          title: 'Payment successful!',
          description: 'Your agent is now executing',
        });
        if (onSuccess) {
          onSuccess(data.transaction.id);
        }
      } else {
        setState('error');
        toast({
          title: 'Payment failed',
          description: data.error || 'An error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setState('error');
      toast({
        title: 'Payment failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const resetAndClose = () => {
    setState('form');
    setAgreedToTerms(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Required</DialogTitle>
          <DialogDescription>
            Complete payment to execute this agent
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
                <span className="text-sm text-gray-600 dark:text-gray-400">Service Fee</span>
                <span className="font-medium">${agent.pricing.per_task.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">${agent.pricing.per_task.toFixed(3)}</div>
                  <Badge variant="secondary" className="text-xs">USDC</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Secured by AP2 Protocol</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Instant settlement with cryptographic receipts
                    </div>
                  </div>
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
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
              onClick={handlePayment}
              disabled={!agreedToTerms}
            >
              Pay with USDC
            </Button>
          </div>
        )}

        {state === 'processing' && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we process your transaction...
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your agent is now executing. Transaction ID: {transactionId}
            </p>
            <Button onClick={resetAndClose} className="w-full">
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
