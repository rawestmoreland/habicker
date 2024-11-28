import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack initialRouteName='home'>
      <Stack.Screen
        name='home'
        options={{
          title: 'Habicker',
        }}
      />
      <Stack.Screen name='create-habit' options={{ title: 'Create Habit' }} />
      <Stack.Screen name='day' options={{ title: 'Day View' }} />
      <Stack.Screen name='habit/[id]' options={{ title: 'Habit Detail' }} />
    </Stack>
  );
}
