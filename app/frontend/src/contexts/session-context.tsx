import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { createClient, isProfileComplete } from '../lib/auth';

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      const currentSession = data.session ?? null;
      setSession(currentSession);
      setIsLoading(false);

      if (!currentSession) {
        navigate('/login', { replace: true });
        return;
      }

      if (!isProfileComplete(currentSession)) {
        navigate('/perfil', { replace: true });
      }
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      const currentSession = sessionData ?? null;
      setSession(currentSession);
      setIsLoading(false);

      if (!currentSession) {
        navigate('/login', { replace: true });
        return;
      }

      if (!isProfileComplete(currentSession)) {
        navigate('/perfil', { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
