import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiGet } from '@/utils/api';
import { FileText, CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';

interface Stats {
  total_invoices: number;
  by_status: {
    Recibida: number;
    'Por Pagar': number;
    Pagada: number;
    Vencida: number;
  };
  processed_count: number;
  total_suppliers: number;
}

export const AdminStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/dashboard/stats');
      setStats(data);
    } catch (error: unknown) {
      console.error('Error cargando estadísticas:', error);
      const apiError = error as { status?: number };
      if (apiError.status !== 401) {
        toast.error('No se pudieron cargar las estadísticas');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Facturas',
      value: stats.total_invoices,
      icon: FileText,
      description: 'Facturas en el sistema',
      color: 'text-blue-600'
    },
    {
      title: 'Por Pagar',
      value: stats.by_status['Por Pagar'],
      icon: Clock,
      description: 'Pendientes de pago',
      color: 'text-orange-600'
    },
    {
      title: 'Pagadas',
      value: stats.by_status.Pagada,
      icon: CheckCircle,
      description: 'Facturas pagadas',
      color: 'text-green-600'
    },
    {
      title: 'Proveedores',
      value: stats.total_suppliers,
      icon: Users,
      description: 'Proveedores activos',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estados de Facturas</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Recibidas
                </span>
                <span className="text-sm font-medium">{stats.by_status.Recibida}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  Por Pagar
                </span>
                <span className="text-sm font-medium">{stats.by_status['Por Pagar']}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  Pagadas
                </span>
                <span className="text-sm font-medium">{stats.by_status.Pagada}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  Vencidas
                </span>
                <span className="text-sm font-medium">{stats.by_status.Vencida}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Procesamiento IA</CardTitle>
            <CardDescription>Facturas procesadas automáticamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.processed_count}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.total_invoices > 0 
                ? `${Math.round((stats.processed_count / stats.total_invoices) * 100)}% del total`
                : '0% del total'
              }
            </p>
            <div className="mt-4 w-full bg-muted rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${stats.total_invoices > 0 ? (stats.processed_count / stats.total_invoices) * 100 : 0}%` 
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

