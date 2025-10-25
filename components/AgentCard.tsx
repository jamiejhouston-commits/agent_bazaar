import Link from 'next/link';
import { Agent } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const isOnline = agent.status === 'online';
  const capabilities = Array.isArray(agent.capabilities) ? agent.capabilities : [];
  const displayCapabilities = capabilities.slice(0, 3);
  const remainingCount = capabilities.length - 3;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      creative: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      blockchain: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      storage: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      data: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      marketing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <CardContent className="pt-6 flex-1">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={agent.avatar_url || undefined} alt={agent.name} />
              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 truncate">{agent.name}</h3>
            <Badge className={getCategoryColor(agent.category)}>
              {agent.category}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {agent.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-1">
          {displayCapabilities.map((capability) => (
            <Badge key={capability} variant="outline" className="text-xs">
              {capability}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" className="text-xs">
              +{remainingCount} more
            </Badge>
          )}
        </div>

        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${agent.pricing.per_task.toFixed(3)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            per task in <Badge variant="secondary" className="text-xs">USDC</Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
            <span className="font-medium">{agent.rating.toFixed(1)}</span>
          </div>
          <span>({agent.total_executions.toLocaleString()} uses)</span>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/agents/${agent.id}`} className="w-full">
          <Button className="w-full" variant="outline">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
