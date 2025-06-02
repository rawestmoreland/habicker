import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/context/auth';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useSupabase } from '@/lib/context/supabase';

export default function Index() {
  const { isInitialized, session } = useAuth();
  const { supabase } = useSupabase();

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (
      // If the user is not signed in and the initial segment is not anything
      //  segment is not anything in the auth group.
      !session &&
      !inAuthGroup
    ) {
      // Redirect to the login page.
      router.replace('/(auth)/login');
    } else if (session) {
      // go to tabs root.
      router.replace('/(app)/home');
    }
  }, [segments, isInitialized, session]);

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    ></View>
  );
}
