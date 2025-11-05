import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiGet } from '@/utils/api';
import { Building2, Save } from 'lucide-react';

interface ProfileData {
  ruc: string;
  razonSocial: string;
  representanteLegal: string;
  direccion: string;
  status?: string;
}

export const ProfileForm = () => {
  const [profile, setProfile] = useState<ProfileData>({
    ruc: '',
    razonSocial: '',
    representanteLegal: '',
    direccion: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/profile');
      if (data && data.ruc) {
        setProfile({
          ruc: data.ruc || '',
          razonSocial: data.razonSocial || '',
          representanteLegal: data.representanteLegal || '',
          direccion: data.direccion || ''
        });
        setHasProfile(true);
      }
    } catch (error: unknown) {
      console.log('No hay perfil creado aún');
      // No mostrar error si no existe perfil
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación
    if (!profile.ruc || !profile.razonSocial || !profile.representanteLegal || !profile.direccion) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`
        },
        body: JSON.stringify({
          ruc: profile.ruc,
          razonSocial: profile.razonSocial,
          representanteLegal: profile.representanteLegal,
          direccion: profile.direccion,
          status: 'activo'
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar el perfil');
      }

      toast.success(hasProfile ? 'Perfil actualizado exitosamente' : 'Perfil creado exitosamente');
      setHasProfile(true);
      fetchProfile();
    } catch (error: unknown) {
      console.error('Error guardando perfil:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Cargando perfil...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <div>
            <CardTitle>Mi Perfil Empresarial</CardTitle>
            <CardDescription>
              {hasProfile 
                ? 'Actualiza la información de tu empresa' 
                : 'Completa la información de tu empresa'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC *</Label>
              <Input
                id="ruc"
                type="text"
                placeholder="20123456789"
                value={profile.ruc}
                onChange={(e) => setProfile({ ...profile, ruc: e.target.value })}
                required
                maxLength={11}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="razonSocial">Razón Social *</Label>
              <Input
                id="razonSocial"
                type="text"
                placeholder="Mi Empresa S.A.C."
                value={profile.razonSocial}
                onChange={(e) => setProfile({ ...profile, razonSocial: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="representanteLegal">Representante Legal *</Label>
              <Input
                id="representanteLegal"
                type="text"
                placeholder="Juan Pérez García"
                value={profile.representanteLegal}
                onChange={(e) => setProfile({ ...profile, representanteLegal: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                type="text"
                placeholder="Av. Principal 123, Lima"
                value={profile.direccion}
                onChange={(e) => setProfile({ ...profile, direccion: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : (hasProfile ? 'Actualizar Perfil' : 'Guardar Perfil')}
            </Button>
          </div>

          {!hasProfile && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Importante:</strong> Completa tu perfil para que el administrador 
                pueda identificar tu empresa correctamente.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
