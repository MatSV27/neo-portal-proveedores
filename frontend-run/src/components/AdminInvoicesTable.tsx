import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { apiGet, apiPatch, apiPost } from '@/utils/api';
import { Sparkles, RefreshCw } from 'lucide-react';

interface Invoice {
  invoiceId: string;
  originalFilename: string;
  status: string;
  storagePath: string;
  supplierUid: string;
  supplierEmail?: string;
  supplierRuc?: string;
  createdAt?: string;
  processed?: boolean;
  es_factura?: boolean;
  resumen?: string;
  monto_total?: string;
  moneda?: string;
  ruc_emisor?: string;
  razon_social_emisor?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  numero_factura?: string;
  concepto?: string;
  confidence?: number;
}

interface AdminInvoicesTableProps {
  refreshTrigger?: number;
}

export const AdminInvoicesTable = ({ refreshTrigger }: AdminInvoicesTableProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [refreshTrigger]);

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

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      await apiPatch(`/invoices/${invoiceId}/status`, { status: newStatus });
      toast.success('Estado actualizado');
      fetchInvoices(); // Refrescar lista
    } catch (error: unknown) {
      console.error('Error actualizando estado:', error);
      toast.error('No se pudo actualizar el estado');
    }
  };

  const handleProcessWithAI = async (invoiceId: string) => {
    setProcessingId(invoiceId);
    try {
      const result = await apiPost(`/invoices/${invoiceId}/process`, {});
      toast.success('Factura procesada con IA', {
        description: `Extraídos: ${Object.keys(result.extracted_data || {}).length} campos`
      });
      fetchInvoices(); // Refrescar para mostrar datos extraídos
    } catch (error: unknown) {
      console.error('Error procesando con IA:', error);
      const apiError = error as { message?: string };
      toast.error('Error al procesar con IA', {
        description: apiError.message || 'Intente nuevamente'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Recibida': 'default',
      'Por Pagar': 'secondary',
      'Pagada': 'outline',
      'Vencida': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Todas las Facturas</CardTitle>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Todas las Facturas</CardTitle>
            <CardDescription>Gestión completa de facturas del sistema</CardDescription>
          </div>
          <Button onClick={fetchInvoices} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refrescar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay facturas en el sistema</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Factura</TableHead>
                  <TableHead>RUC / Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>RUC Emisor</TableHead>
                  <TableHead>Razón Social</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Comentarios / Descripción IA</TableHead>
                  <TableHead>IA</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.invoiceId}>
                    <TableCell className="font-medium">
                      {invoice.originalFilename || 'factura.pdf'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {invoice.supplierRuc || invoice.supplierEmail || invoice.supplierUid.substring(0, 8) + '...'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={invoice.status}
                        onValueChange={(value) => handleStatusChange(invoice.invoiceId, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Recibida">Recibida</SelectItem>
                          <SelectItem value="Por Pagar">Por Pagar</SelectItem>
                          <SelectItem value="Pagada">Pagada</SelectItem>
                          <SelectItem value="Vencida">Vencida</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {invoice.monto_total ? (
                        <span className="font-medium">{invoice.monto_total} {invoice.moneda || ''}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {invoice.ruc_emisor || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={invoice.razon_social_emisor}>
                      {invoice.razon_social_emisor || <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {invoice.fecha_vencimiento || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="max-w-md">
                      {invoice.processed ? (
                        <div className="text-xs whitespace-normal">
                          {invoice.es_factura ? (
                            <div className="space-y-1">
                              <div><span className="font-semibold">Tipo:</span> Factura</div>
                              {invoice.numero_factura && <div><span className="font-semibold">N°:</span> {invoice.numero_factura}</div>}
                              {invoice.concepto && <div><span className="font-semibold">Concepto:</span> {invoice.concepto}</div>}
                              {invoice.fecha_emision && <div><span className="font-semibold">Emisión:</span> {invoice.fecha_emision}</div>}
                            </div>
                          ) : (
                            <div className="text-muted-foreground italic">
                              {invoice.resumen || 'Documento procesado sin resumen'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sin procesar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {invoice.processed ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          ✓ {invoice.confidence}%
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleProcessWithAI(invoice.invoiceId)}
                          disabled={processingId === invoice.invoiceId}
                          className="h-7"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          {processingId === invoice.invoiceId ? 'Procesando...' : 'IA'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}
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

