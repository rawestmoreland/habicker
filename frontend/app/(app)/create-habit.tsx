import { useCreateHabit } from '@/lib/hooks/CREATE/useCreateHabit';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { z } from 'zod';

export default function CreateHabit() {
  const { mutate: createHabit, data: newHabit, isPending } = useCreateHabit();

  const formSchema = z.object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(25, { message: 'Name must be at most 25 characters long' }),
    description: z
      .string()
      .min(2, { message: 'Description must be at least 2 characters long' })
      .max(50, { message: 'Description must be at most 50 characters long' })
      .optional()
      .or(z.literal('')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (newHabit) {
      form.reset();
      router.navigate('/home');
    }
  }, [newHabit]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    createHabit({ name: data.name, description: data.description });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Controller
          control={form.control}
          name='name'
          render={({ field }) => (
            <TextInput
              label='Name'
              mode='outlined'
              value={field.value}
              onChangeText={field.onChange}
              placeholder='Habit name'
            />
          )}
        />
        {form.formState.errors.name && (
          <Text variant='labelSmall' style={{ color: 'red' }}>
            {form.formState.errors.name.message}
          </Text>
        )}
        <Controller
          control={form.control}
          name='description'
          render={({ field }) => (
            <TextInput
              label='Description'
              multiline
              mode='outlined'
              value={field.value}
              onChangeText={field.onChange}
              placeholder='Description'
            />
          )}
        />
        {form.formState.errors.description && (
          <Text variant='labelSmall' style={{ color: 'red' }}>
            {form.formState.errors.description.message}
          </Text>
        )}
        <Button
          disabled={isPending}
          icon={isPending ? 'loading' : 'plus'}
          mode='contained-tonal'
          onPress={form.handleSubmit(onSubmit)}
        >
          Add
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '80%',
    gap: 16,
  },
});
