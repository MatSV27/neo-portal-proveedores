import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiPostForm } from '@/utils/api';

interface InvoiceUploadProps {
  onUploadSuccess: () => void;
}

export const InvoiceUpload = ({ onUploadSuccess }: InvoiceUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Seleccione un archivo PDF');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await apiPostForm('/invoices', formData);
      
      toast.success('Factura subida exitosamente', {
        description: `ID: ${result.invoiceId} - Estado: ${result.status}`,
      });

      setFile(null);
      // Reset file input
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';
      
      onUploadSuccess();
    } catch (error: unknown) {
      console.error('Error al subir factura:', error);
      const apiError = error as { status?: number; message?: string };
      if (apiError.status === 401) {
        toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else {
        toast.error('No se pudo subir el PDF', {
          description: apiError.message || 'Intente nuevamente',
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir Factura (PDF)</CardTitle>
        <CardDescription>Sube tu factura en formato PDF</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-input">Archivo PDF</Label>
            <Input
              id="file-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>
          <Button type="submit" disabled={uploading || !file}>
            {uploading ? 'Subiendo...' : 'Subir factura'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
