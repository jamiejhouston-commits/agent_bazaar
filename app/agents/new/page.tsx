"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Bot, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateAgentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'data',
    api_endpoint: '',
    avatar_url: '',
    per_task_price: '',
    per_hour_price: '',
    capabilities: '',
    response_time_ms: '2000',
    uptime_pct: '99.5',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create an agent',
        variant: 'destructive',
      });
      router.push('/auth/signin');
      return;
    }

    setLoading(true);

    try {
      const capabilities = formData.capabilities
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      if (capabilities.length === 0) {
        toast({
          title: 'Capabilities required',
          description: 'Please add at least one capability',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('agents')
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          api_endpoint: formData.api_endpoint,
          avatar_url: formData.avatar_url || 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
          owner_id: user.id,
          status: 'online',
          pricing: {
            per_task: parseFloat(formData.per_task_price),
            per_hour: parseFloat(formData.per_hour_price),
            currency: 'USDC',
          },
          capabilities,
          sla: {
            response_time_ms: parseInt(formData.response_time_ms),
            uptime_pct: parseFloat(formData.uptime_pct),
          },
          rating: 0,
          total_executions: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Agent creation error:', error);
        toast({
          title: 'Failed to create agent',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Agent created successfully!',
        description: 'Your agent is now live on the marketplace.',
      });

      router.push('/my-agents');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Create New Agent</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-16">
            List your AI agent on the marketplace and start earning
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Details</CardTitle>
            <CardDescription>
              Provide information about your AI agent's capabilities and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Neural Artist Pro"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your agent does and its key features..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data">Data Processing</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="blockchain">Blockchain</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_endpoint">API Endpoint *</Label>
                <Input
                  id="api_endpoint"
                  type="url"
                  placeholder="https://api.youragent.com/v1"
                  value={formData.api_endpoint}
                  onChange={(e) => handleChange('api_endpoint', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL (optional)</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder="https://images.pexels.com/..."
                  value={formData.avatar_url}
                  onChange={(e) => handleChange('avatar_url', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Leave blank to use default avatar
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="per_task_price">Price per Task (USDC) *</Label>
                  <Input
                    id="per_task_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.05"
                    value={formData.per_task_price}
                    onChange={(e) => handleChange('per_task_price', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="per_hour_price">Price per Hour (USDC) *</Label>
                  <Input
                    id="per_hour_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="2.50"
                    value={formData.per_hour_price}
                    onChange={(e) => handleChange('per_hour_price', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capabilities">Capabilities *</Label>
                <Input
                  id="capabilities"
                  placeholder="Image Generation, Style Transfer, Logo Design"
                  value={formData.capabilities}
                  onChange={(e) => handleChange('capabilities', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Separate multiple capabilities with commas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response_time_ms">Response Time (ms)</Label>
                  <Input
                    id="response_time_ms"
                    type="number"
                    placeholder="2000"
                    value={formData.response_time_ms}
                    onChange={(e) => handleChange('response_time_ms', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uptime_pct">Uptime (%)</Label>
                  <Input
                    id="uptime_pct"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="99.5"
                    value={formData.uptime_pct}
                    onChange={(e) => handleChange('uptime_pct', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Agent...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Create Agent
                    </>
                  )}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
