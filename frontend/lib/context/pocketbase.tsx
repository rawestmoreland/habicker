import React, { createContext, useContext, useState, useEffect } from 'react';
import PocketBase, { AsyncAuthStore } from 'pocketbase';
import eventsource from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Client from 'pocketbase';

const PocketBaseContext = createContext({
  pb: undefined as Client | undefined,
});

export const usePocketBase = () => useContext(PocketBaseContext);

export const PocketBaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pb, setPb] = useState<Client | undefined>(undefined);

  useEffect(() => {
    const initializePocketBase = async () => {
      const store = new AsyncAuthStore({
        save: async (serialized) => AsyncStorage.setItem('pb_auth', serialized),
        // @ts-ignore
        initial: await AsyncStorage.getItem('pb_auth'),
        clear: async () => AsyncStorage.removeItem('pb_auth'),
      });
      // @ts-ignore
      global.EventSource = eventsource;
      const pbInstance = new PocketBase(
        'https://pocketbase-weathered-waterfall-680.fly.dev',
        store
      );
      setPb(pbInstance);
    };

    initializePocketBase();
  }, []);

  return (
    <PocketBaseContext.Provider value={{ pb }}>
      {children}
    </PocketBaseContext.Provider>
  );
};
