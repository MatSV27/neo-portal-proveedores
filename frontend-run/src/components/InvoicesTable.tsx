import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiGet } from '@/utils/api';
import { FileText } from 'lucide-react';

interface Invoice {
  invoiceId: string;
  originalFilename: string;
  status: string;
  storagePath: string;
  createdAt?: string;
}

interface InvoicesTableProps {
  refreshTrigger: number;
}

export const InvoicesTable = ({ refreshTrigger }: InvoicesTableProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/invoices');
      setInvoices(data.items || []);
    } catch (error: unknown) {
      console.error('Error al cargar facturas:', error);
      const apiError = error as { status?: number };
      if (apiError.status !== 401) {
        toast.error('No se pudieron cargar las facturas');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Cargando facturas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Facturas</CardTitle>
        <CardDescription>Lista de facturas subidas</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay facturas subidas aún</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Subida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.invoiceId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{invoice.originalFilename || 'factura.pdf'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
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
