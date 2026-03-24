import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardRedirect() {
  const { user, role, loading, getDashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath()} replace />;
}
