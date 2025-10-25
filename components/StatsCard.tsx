import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = 'text-blue-600'
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </div>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {subtitle && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </div>
        )}
        {trend && (
          <div className="text-sm text-green-600 dark:text-green-400 mt-2">
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
