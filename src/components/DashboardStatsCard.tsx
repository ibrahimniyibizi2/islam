import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
}

export default function DashboardStatsCard({ title, value, description, icon: Icon }: DashboardStatsCardProps) {
  return (
    <Card className="shadow-soft">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
