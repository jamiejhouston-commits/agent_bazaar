"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Clock, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  to_agent_id: string;
  amount: number;
  created_at: string;
  status: string;
  agents: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export default function MyAgentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalExecutions: 0,
    uniqueAgents: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    } else if (user) {
      fetchTransactions();
    }
  }, [user, authLoading, router]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions?user_id=${user?.id}`);
      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        setTransactions([]);
        setStats({ totalSpent: 0, totalExecutions: 0, uniqueAgents: 0 });
        return;
      }
      const data = await response.json();
      setTransactions(data || []);

      const totalSpent = Array.isArray(data) ? data.reduce((sum: number, t: Transaction) => sum + t.amount, 0) : 0;
      const uniqueAgents = Array.isArray(data) ? new Set(data.map((t: Transaction) => t.to_agent_id)).size : 0;

      setStats({
        totalSpent,
        totalExecutions: Array.isArray(data) ? data.length : 0,
        uniqueAgents,
      });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
      setStats({ totalSpent: 0, totalExecutions: 0, uniqueAgents: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const uniqueAgents = Array.from(
    new Map(
      transactions.map((t) => [t.to_agent_id, t.agents])
    ).values()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Agents</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your purchased agents and view usage analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</p>
                <p className="text-3xl font-bold">${stats.totalSpent.toFixed(3)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Executions</p>
                <p className="text-3xl font-bold">{stats.totalExecutions}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unique Agents</p>
                <p className="text-3xl font-bold">{stats.uniqueAgents}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList>
          <TabsTrigger value="agents">Purchased Agents</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          {uniqueAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueAgents.map((agent) => {
                const agentTransactions = transactions.filter(
                  (t) => t.to_agent_id === agent.id
                );
                const totalSpent = agentTransactions.reduce(
                  (sum, t) => sum + t.amount,
                  0
                );

                return (
                  <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={agent.avatar_url || undefined} alt={agent.name} />
                          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{agent.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {agentTransactions.length} executions
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                          <span className="font-medium">${totalSpent.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Last Used</span>
                          <span className="font-medium">
                            {new Date(agentTransactions[0].created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Link href={`/agents/${agent.id}`}>
                        <Button className="w-full" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-gray-500 mb-4">You haven't purchased any agents yet</p>
                <Link href="/agents">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Explore Agents
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {transactions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={transaction.agents.avatar_url || undefined}
                            alt={transaction.agents.name}
                          />
                          <AvatarFallback>
                            {transaction.agents.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{transaction.agents.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${transaction.amount.toFixed(3)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-gray-500">No transactions yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
