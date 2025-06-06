import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { TextInput, Button, Portal, Dialog, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/context/auth';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

export default function CreateAccount() {
  const { createAccount } = useAuth();

  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const router = useRouter();

  const formSchema = z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      passwordConfirm: z.string().min(8),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.passwordConfirm) {
        ctx.addIssue({
          code: 'custom',
          message: 'Passwords do not match',
          path: ['passwordConfirm'],
        });
      }
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await createAccount({
      email: data.email,
      password: data.password,
    });
    setIsSuccessModalVisible(true);
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
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
              autoCapitalize='none'
              value={field.value}
              onChangeText={field.onChange}
              placeholder='Password'
            />
          )}
        />
        <Controller
          control={form.control}
          name='passwordConfirm'
          render={({ field }) => (
            <TextInput
              autoCapitalize='none'
              value={field.value}
              onChangeText={field.onChange}
              placeholder='Password Confirm'
            />
          )}
        />
        <View style={styles.buttonContainer}>
          <Button mode='contained' onPress={form.handleSubmit(onSubmit)}>
            Sign up
          </Button>
          <Button
            mode='contained-tonal'
            onPress={() => {
              router.back();
            }}
          >
            Cancel
          </Button>
        </View>
      </View>
      <Portal>
        <Dialog
          visible={Boolean(errorMessage)}
          onDismiss={() => setErrorMessage('')}
        >
          <Dialog.Title>Uh oh!</Dialog.Title>
          <Dialog.Content>
            <Text>{errorMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setErrorMessage('')}>OK</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={isSuccessModalVisible}
          onDismiss={() => setIsSuccessModalVisible(false)}
        >
          <Dialog.Title>Success!</Dialog.Title>
          <Dialog.Content>
            <Text>Your account has been created successfully!</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setIsSuccessModalVisible(false);
                router.navigate('/(auth)/login');
              }}
            >
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 500,
  },
  formContainer: {
    flex: 1,
    marginTop: 80,
    padding: 24,
    justifyContent: 'space-between',
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
  buttonContainer: {
    gap: 8,
  },
});
