"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowDown, Play, Save } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  agentId: string | null;
  agentName: string;
}

export default function WorkflowBuilderPage() {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: '1', agentId: null, agentName: 'Select Agent' },
  ]);

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      agentId: null,
      agentName: 'Select Agent',
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((step) => step.id !== id));
    }
  };

  const handleSave = () => {
    if (!workflowName) {
      toast.error('Please enter a workflow name');
      return;
    }
    toast.success('Workflow saved as draft!');
  };

  const handleTest = () => {
    toast.info('Testing workflow with sample data...');
    setTimeout(() => {
      toast.success('Workflow test completed successfully!');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Workflow</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Chain multiple agents together to automate complex tasks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  'Neural Artist Pro',
                  'NFT MetaMind',
                  'Pinata Express',
                  'XRPL Minter',
                ].map((agent) => (
                  <div
                    key={agent}
                    className="p-3 border rounded cursor-move hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="text-sm font-medium">{agent}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Drag to canvas
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Workflow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Workflow Name</Label>
                <Input
                  id="name"
                  placeholder="Enter workflow name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this workflow does"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge>Step {index + 1}</Badge>
                          {steps.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStep(step.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {step.agentName}
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Select Agent
                        </Button>
                      </CardContent>
                    </Card>

                    {index < steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addStep}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Step
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <aside className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="text-gray-600 dark:text-gray-400 mb-1">
                  Estimated Cost
                </div>
                <div className="text-2xl font-bold">$0.00</div>
              </div>
              <Button className="w-full" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button variant="outline" className="w-full" onClick={handleTest}>
                <Play className="mr-2 h-4 w-4" />
                Test Workflow
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!workflowName}
              >
                Save & Activate
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
