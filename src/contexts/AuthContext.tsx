import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  current_membership: 'free' | 'starter' | 'pro' | 'business';
  membership_expires_at: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  // Database Session Tracking (Historical Analytics)
  useEffect(() => {
    let sessionId: string | null = null;
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

    const startSession = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_sessions')
          .insert([{ user_id: user.id }])
          .select('id')
          .single();

        if (error) throw error;
        
        if (data) {
          sessionId = data.id;

          // Pinging database every 10 minutes (600000 ms)
          heartbeatInterval = setInterval(async () => {
            if (sessionId) {
              await supabase
                .from('user_sessions')
                .update({ last_seen_at: new Date().toISOString() })
                .eq('id', sessionId);
            }
          }, 600000);
        }
      } catch (err) {
        console.error('Error starting database session:', err);
      }
    };

    startSession();

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (sessionId) {
        // Final ping on disconnect (fire and forget)
        supabase
          .from('user_sessions')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', sessionId)
          .then(); 
      }
    };
  }, [user]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
