import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
} from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { AuthProvider } from '@/lib/context/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseProvider } from '@/lib/context/supabase';

const queryClient = new QueryClient();

// const mockTimeZone = 'America/New_York';
// const dateTimeFormat = Intl.DateTimeFormat().resolvedOptions();
// Object.defineProperty(dateTimeFormat, 'timeZone', { value: mockTimeZone });
// Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
//   value: () => dateTimeFormat,
// });

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: 'tomato',
      secondary: 'yellow',
    },
  };

  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <Stack>
              <Stack.Screen name='(app)' options={{ headerShown: false }} />
              <Stack.Screen
                name='(auth)/login'
                options={{ headerShown: false }}
              />
            </Stack>
          </AuthProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SupabaseProvider>
  );
}
