import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/ProfileForm';
import { InvoiceUpload } from '@/components/InvoiceUpload';
import { InvoicesTable } from '@/components/InvoicesTable';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Portal de Proveedores</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <ProfileForm />
        <InvoiceUpload onUploadSuccess={handleUploadSuccess} />
        <InvoicesTable refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
};

export default Dashboard;
