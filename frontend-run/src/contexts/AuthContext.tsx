import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  idToken: string | null;
  role: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para refrescar el rol manualmente
  const refreshRole = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken(true); // Force refresh
        const tokenResult = await currentUser.getIdTokenResult(true);
        const userRole = tokenResult.claims.role as string || 'proveedor';
        
        setIdToken(token);
        setRole(userRole);
        localStorage.setItem('idToken', token);
        localStorage.setItem('userRole', userRole);
        
        console.log('🔄 Rol actualizado:', userRole);
      } catch (error) {
        console.error('Error refrescando rol:', error);
      }
    }
  };

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('idToken');
    if (storedToken) {
      setIdToken(storedToken);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        const tokenResult = await currentUser.getIdTokenResult(true);
        const userRole = tokenResult.claims.role as string || 'proveedor';
        
        setIdToken(token);
        setRole(userRole);
        localStorage.setItem('idToken', token);
        localStorage.setItem('userRole', userRole);
      } else {
        setIdToken(null);
        setRole(null);
        localStorage.removeItem('idToken');
        localStorage.removeItem('userRole');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh del rol cada 5 minutos si hay usuario logueado
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshRole();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    setIdToken(token);
    localStorage.setItem('idToken', token);
  };

  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    setIdToken(token);
    localStorage.setItem('idToken', token);
  };

  const logout = async () => {
    await signOut(auth);
    setIdToken(null);
    localStorage.removeItem('idToken');
    localStorage.removeItem('userProfile');
  };

  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{ user, idToken, role, isAdmin, login, register, logout, refreshRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
