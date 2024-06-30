import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { TextInput, Button, Portal, Dialog, Text } from 'react-native-paper';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { useRouter } from 'expo-router';

import { useAuth } from '@/lib/context/auth';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useSupabase } from '@/lib/context/supabase';

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint:
    'https://github.com/settings/connections/applications/Ov23lirFpf8tGHhs4VPo',
};

export default function LogIn() {
  const { supabase } = useSupabase();
  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) throw new Error(errorCode);

    const { access_token, refresh_token } = params;

    if (!access_token) return;

    const response = await supabase?.auth.setSession({
      access_token,
      refresh_token,
    });

    if (response?.error) throw response?.error;

    return response?.data?.session;
  };

  GoogleSignin.configure({
    webClientId:
      '125379754802-ag38b3cgpmjlib6siu14l7u95f9jgvh8.apps.googleusercontent.com',
    iosClientId:
      '125379754802-q71178bsrs6eaplini08hch8jnh78s4j.apps.googleusercontent.com',
  });

  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signInWithIdToken } = useAuth();

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await signIn(data.email, data.password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss}>
        <View style={styles.loginForm}>
          {Platform.OS === 'ios' && (
            <Button
              mode='contained-tonal'
              icon='apple'
              onPress={async () => {
                try {
                  const credentials = await AppleAuthentication.signInAsync({
                    requestedScopes: [
                      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                      AppleAuthentication.AppleAuthenticationScope.EMAIL,
                    ],
                  });
                  if (credentials.identityToken) {
                    await signInWithIdToken({
                      provider: 'apple',
                      token: credentials.identityToken,
                    });
                  }
                } catch (error: any) {
                  console.error(error);
                }
              }}
            >
              Sign in with Apple
            </Button>
          )}
          <Button
            mode='contained-tonal'
            icon='google'
            onPress={async () => {
              try {
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();
                if (userInfo.idToken) {
                  await signInWithIdToken({
                    provider: 'google',
                    token: userInfo.idToken,
                  });
                } else throw new Error('No ID Token present');
              } catch (error: any) {
                if (isErrorWithCode(error)) {
                  switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                      // user cancelled the login flow
                      break;
                    case statusCodes.IN_PROGRESS:
                      // operation (eg. sign in) already in progress
                      break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                      // play services not available or outdated
                      break;
                    default:
                    // some other error happened
                  }
                } else {
                  // an error that's not related to google sign in occurred
                }
              }
            }}
          >
            Sign in with Google
          </Button>
          {/* <Button
            mode='contained-tonal'
            icon='github'
            onPress={async () => {
              promptAsync();
            }}
          >
            Sign in with Github
          </Button> */}
          <Text
            variant='bodyLarge'
            style={{ textAlign: 'center', fontWeight: 600 }}
          >
            - OR -
          </Text>
          <Controller
            control={form.control}
            name='email'
            render={({ field }) => (
              <TextInput
                autoCapitalize='none'
                value={field.value}
                onChangeText={field.onChange}
                placeholder='Email'
              />
            )}
          />
          <Controller
            control={form.control}
            name='password'
            render={({ field }) => (
              <TextInput
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                autoCapitalize='none'
                value={field.value}
                onChangeText={field.onChange}
                placeholder='password'
                secureTextEntry={!showPassword}
              />
            )}
          />
          <Button mode='contained' onPress={form.handleSubmit(onSubmit)}>
            Login
          </Button>
          <Button
            mode='contained-tonal'
            onPress={() => router.push('/create-account')}
          >
            Create an account
          </Button>
        </View>
      </TouchableWithoutFeedback>
      <Portal>
        <Dialog
          visible={Boolean(errorMessage)}
          onDismiss={() => setErrorMessage('')}
        >
          <Dialog.Title>Uh oh!</Dialog.Title>
          <Dialog.Content>
            <Text>{errorMessage}</Text>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loginForm: {
    gap: 16,
    width: '80%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginBottom: 4,
    color: '#455fff',
  },
  textInput: {
    width: 250,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#455fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
});
