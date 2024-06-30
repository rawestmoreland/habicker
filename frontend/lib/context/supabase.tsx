import React, { createContext, useContext, useState, useEffect } from 'react';
import eventsource from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xsbfhzugjjoiwppnuyox.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYmZoenVnampvaXdwcG51eW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk2ODI5NTQsImV4cCI6MjAzNTI1ODk1NH0.PKymvEnr40sW1wbYGAjWzOQC4lJ_hKiYRlF97s6vfKA';

const SupabaseContext = createContext({
  supabase: undefined as SupabaseClient | undefined,
});

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [supabase, setSupabase] = useState<SupabaseClient | undefined>(
    undefined
  );

  useEffect(() => {
    const initializeSupabase = async () => {
      // @ts-ignore
      global.EventSource = eventsource;
      const supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      setSupabase(supabaseInstance);
    };

    initializeSupabase();
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};
