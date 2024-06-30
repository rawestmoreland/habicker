import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack initialRouteName='home'>
      <Stack.Screen
        name='home'
        options={{
          title: 'Habits',
        }}
      />
      <Stack.Screen name='create-habit' options={{ title: 'Create' }} />
      <Stack.Screen name='day' options={{ title: 'Day View' }} />
    </Stack>
  );
}
