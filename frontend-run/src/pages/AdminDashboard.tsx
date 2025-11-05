import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStats } from '@/components/AdminStats';
import { AdminInvoicesTable } from '@/components/AdminInvoicesTable';
import { AdminSuppliers } from '@/components/AdminSuppliers';
import { LogOut, LayoutDashboard, FileText, Users } from 'lucide-react';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              Panel de Administración
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Portal de Proveedores Neo</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-6">
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full max-w-[600px] grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Facturas
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Proveedores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <AdminStats />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <AdminInvoicesTable refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <AdminSuppliers />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

