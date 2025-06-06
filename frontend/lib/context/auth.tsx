import { useSegments, useRouter, useNavigationContainerRef } from 'expo-router';
import { useState, useEffect, createContext, useContext } from 'react';
import { useSupabase } from './supabase';
import { Session } from '@supabase/supabase-js';

const AuthContext = createContext({
  signIn: async (
    email: string,
    password: string
  ): Promise<Session | { error: string }> => ({ error: 'Not implemented' }),
  signInWithIdToken: async ({
    token,
    provider,
  }: {
    token: string;
    provider: string;
  }): Promise<Session | { error: string }> => {
    return { error: 'Not implemented' };
  },
  signOut: async (): Promise<any> => {},
  createAccount: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<any> => ({
    error: 'Not implemented',
  }),
  isInitialized: false,
  session: null as Session | null | undefined,
});

// This hook can be used to access the user info.
export function useAuth() {
  return useContext(AuthContext);
}

function useProtectedRoute(
  session: Session | null | undefined,
  isInitialized: boolean
) {
  const router = useRouter();
  const segments = useSegments();

  // Check that navigation is all good
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const rootNavRef = useNavigationContainerRef();

  useEffect(() => {
    const unsubscribe = rootNavRef?.addListener('state', (event) => {
      setIsNavigationReady(true);
    });
    return function cleanup() {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [rootNavRef.current]);

  useEffect(() => {
    if (!isNavigationReady) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!isInitialized) return;

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !session &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(app)/home');
    }
  }, [session, segments, isNavigationReady, isInitialized]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const [isInitialized, setIsInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>();

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitialized(true);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, [supabase]);

  const appSignIn = async (
    email: string,
    password: string
  ): Promise<Record<string, any>> => {
    if (!supabase) return { error: 'Supabase not initialized' };

    try {
      const { data: session, error: sessionError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (!session || sessionError) {
        if (sessionError?.message.includes('Invalid login credentials')) {
          throw new Error('Invalid login credentials');
        }
        throw new Error('No response from authWithPassword');
      }
      return session;
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const appSigInWithIdToken = async ({
    provider,
    token,
  }: {
    provider: string;
    token: string;
  }) => {
    if (!supabase) return { error: 'Supabase not initialized' };

    supabase.auth.signOut();

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signInWithIdToken({ provider, token });
      if (error) throw new Error(error.message);
      setSession(session);
    } catch (error: any) {
      return { error: error };
    }
  };

  const appSignOut = async () => {
    if (!supabase) return { error: 'PocketBase not initialized' };

    try {
      await supabase.auth.signOut();
      setSession(null);
      return { user: null };
    } catch (e) {
      return { error: e };
    }
  };

  const createAccount = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Session | null | { error: string }> => {
    if (!supabase) return { error: 'PocketBase not initialized' };

    try {
      const {
        data: { session },
        error: signupError,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      return session;
    } catch (e: any) {
      return { error: e.response };
    }
  };

  useProtectedRoute(session, isInitialized);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email: string, password: string): Promise<any> =>
          await appSignIn(email, password),
        signInWithIdToken: async ({
          token,
          provider,
        }: {
          token: string;
          provider: string;
        }): Promise<any> => await appSigInWithIdToken({ token, provider }),
        signOut: async () => await appSignOut(),
        createAccount: async ({
          email,
          password,
        }: {
          email: string;
          password: string;
        }): Promise<any> => await createAccount({ email, password }),
        isInitialized,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
