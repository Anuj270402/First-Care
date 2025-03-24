import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Please Sign In</h1>
        <p className="text-muted-foreground">
          You need to be signed in to access this page
        </p>
        <AuthModal />
      </div>
    );
  }

  return children;
}