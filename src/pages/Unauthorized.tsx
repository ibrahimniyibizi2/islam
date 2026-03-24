import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldX } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { getDashboardPath } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <ShieldX className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
        <Button onClick={() => navigate(getDashboardPath())} className="bg-gradient-primary">
          Go to My Dashboard
        </Button>
      </div>
    </div>
  );
}
