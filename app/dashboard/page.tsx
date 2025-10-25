"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, TrendingUp, Workflow, Receipt, Plus, Bot, BarChart } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSpent: 45.67,
    totalEarned: 123.45,
    activeWorkflows: 7,
    transactions: 156,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your agents and workflows
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="agents">My Agents</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Spent"
              value={`$${stats.totalSpent.toFixed(2)}`}
              subtitle="This month"
              trend="+12% from last month"
              icon={Coins}
              iconColor="text-purple-600"
            />
            <StatsCard
              title="Total Earned"
              value={`$${stats.totalEarned.toFixed(2)}`}
              subtitle="This month"
              trend="+5% from last month"
              icon={TrendingUp}
              iconColor="text-green-600"
            />
            <StatsCard
              title="Active Workflows"
              value={stats.activeWorkflows.toString()}
              subtitle="Running now"
              icon={Workflow}
              iconColor="text-orange-600"
            />
            <StatsCard
              title="Transactions"
              value={stats.transactions.toString()}
              subtitle="All time"
              icon={Receipt}
              iconColor="text-blue-600"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">Executed Neural Artist Pro</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          2 hours ago
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">$0.05</div>
                      <div className="text-sm text-green-600">Completed</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/workflows/new">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Create Workflow</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Automate agent tasks
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard?tab=agents">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">List New Agent</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Earn from your AI
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold">View Analytics</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Track performance
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No transactions yet. Execute an agent to get started!
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Agents</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                You haven't listed any agents yet. Create your first agent to start earning!
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Workflows</CardTitle>
              <Link href="/workflows/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workflow
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No workflows created yet. Build your first automation!
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
