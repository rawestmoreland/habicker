import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack initialRouteName='home'>
      <Stack.Screen
        name='home'
        options={{
          headerShown: false,
          title: 'Habicker',
        }}
      />
      <Stack.Screen
        name='create-habit'
        options={{ headerShown: false, title: 'Create Habit' }}
      />
      <Stack.Screen
        name='day'
        options={{ headerShown: false, title: 'Day View' }}
      />
      <Stack.Screen
        name='habit/[id]'
        options={{ headerShown: false, title: 'Habit Detail' }}
      />
    </Stack>
  );
}
