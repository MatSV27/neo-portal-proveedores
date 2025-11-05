import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      
      // Esperar un momento para que el token se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Obtener el rol del usuario (forzar refresh del token)
      const user = auth.currentUser;
      if (user) {
        const tokenResult = await user.getIdTokenResult(true); // Force refresh
        const userRole = tokenResult.claims.role as string;
        
        console.log('🔑 Rol del usuario:', userRole); // Debug
        
        toast.success('Inicio de sesión exitoso');
        
        // Redirigir según el rol
        if (userRole === 'admin') {
          console.log('➡️ Redirigiendo a /admin'); // Debug
          navigate('/admin');
        } else {
          console.log('➡️ Redirigiendo a /dashboard'); // Debug
          navigate('/dashboard');
        }
      }
    } catch (error: unknown) {
      console.error('Error al iniciar sesión:', error);
      const authError = error as { message?: string };
      toast.error(authError.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Portal de Proveedores</CardTitle>
          <CardDescription>Inicie sesión con su cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="su-email@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              ¿No tiene cuenta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Crear cuenta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
