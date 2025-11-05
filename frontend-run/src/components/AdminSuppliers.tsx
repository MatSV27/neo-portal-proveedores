import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiGet } from '@/utils/api';
import { Users, RefreshCw } from 'lucide-react';

interface Supplier {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: number;
  role?: string;
  profile?: {
    ruc?: string;
    razonSocial?: string;
    representanteLegal?: string;
    direccion?: string;
  };
}

export const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/suppliers');
      setSuppliers(data.suppliers || []);
    } catch (error: unknown) {
      console.error('Error cargando proveedores:', error);
      const apiError = error as { status?: number };
      if (apiError.status !== 401) {
        toast.error('No se pudieron cargar los proveedores');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Cargando proveedores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Proveedores Registrados
            </CardTitle>
            <CardDescription>Lista de todos los proveedores en el sistema</CardDescription>
          </div>
          <Button onClick={fetchSuppliers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refrescar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay proveedores registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>RUC</TableHead>
                  <TableHead>Razón Social</TableHead>
                  <TableHead>Representante Legal</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.uid}>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.role === 'admin' ? 'default' : 'secondary'}>
                        {supplier.role || 'proveedor'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {supplier.profile?.ruc || <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={supplier.profile?.razonSocial}>
                      {supplier.profile?.razonSocial || <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={supplier.profile?.representanteLegal}>
                      {supplier.profile?.representanteLegal || <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={supplier.profile?.direccion}>
                      {supplier.profile?.direccion || <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(supplier.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

