import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const RouteGuard = ({ children, requireAdmin = false }: RouteGuardProps) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere admin y el usuario no es admin, redirigir al dashboard normal
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
