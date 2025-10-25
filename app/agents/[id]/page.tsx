"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Agent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentModal } from '@/components/PaymentModal';
import { Star, Clock, TrendingUp, Zap, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgentDetailPage() {
  const params = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAgent(params.id as string);
    }
  }, [params.id]);

  const fetchAgent = async (id: string) => {
    try {
      const response = await fetch(`/api/agents/${id}`);
      const data = await response.json();
      setAgent(data);
    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Agent not found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            The agent you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const isOnline = agent.status === 'online';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={agent.avatar_url || undefined} alt={agent.name} />
            <AvatarFallback className="text-2xl">{agent.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <Badge>{agent.category}</Badge>
              {isOnline && (
                <Badge variant="outline" className="border-green-500 text-green-600">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Online
                </Badge>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {agent.description}
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                <span className="font-semibold">{agent.rating.toFixed(1)}</span>
              </div>
              <div>{agent.total_executions.toLocaleString()} executions</div>
            </div>
          </div>

          <div>
            <Button
              size="lg"
              onClick={() => setPaymentModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={!isOnline}
            >
              Execute Agent
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="api">API Docs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(agent.capabilities) ? agent.capabilities : []).map((capability) => (
                      <Badge key={capability} variant="secondary">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">SLA Details</h3>
                  <div className="space-y-3">
                    {agent.sla.response_time_ms && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Response Time</span>
                        </div>
                        <span className="font-medium">
                          {agent.sla.response_time_ms / 1000}s
                        </span>
                      </div>
                    )}
                    {agent.sla.uptime_pct && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span>Uptime</span>
                        </div>
                        <span className="font-medium">{agent.sla.uptime_pct}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">Base Pricing</h3>
                  <div className="text-4xl font-bold mb-2">
                    ${agent.pricing.per_task.toFixed(3)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    per task in <Badge variant="secondary">USDC</Badge>
                  </p>

                  {agent.pricing.volume_discounts &&
                    agent.pricing.volume_discounts.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Volume Discounts</h4>
                        <div className="space-y-2">
                          {agent.pricing.volume_discounts.map((discount, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded"
                            >
                              <span>{discount.min}+ tasks</span>
                              <span className="font-medium">
                                ${discount.price.toFixed(3)} each
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All requests require authentication using your API key via the
                    Authorization header.
                  </p>
                  <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded text-sm overflow-x-auto">
                    {`Authorization: Bearer YOUR_API_KEY`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">Request Format</h3>
                  <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded text-sm overflow-x-auto">
                    {`POST /api/agents/${agent.id}/execute
Content-Type: application/json

{
  "input": "your_input_data",
  "options": {}
}`}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Executions
                  </span>
                  <span className="font-medium">
                    {agent.total_executions.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Success Rate
                  </span>
                  <span className="font-medium">98.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Last Updated
                  </span>
                  <span className="font-medium">
                    {new Date(agent.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Secured by AP2</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All transactions are secured by the AP2 protocol with cryptographic
                receipts and instant settlement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {agent && (
        <PaymentModal
          agent={agent}
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
        />
      )}
    </div>
  );
}
