import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { pullStateFromCloud, startSync, stopSync } from '../lib/cloud-sync';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);
  const isDarkMode = useStore((s) => s.isDarkMode);
  const router = useRouter();
  const segments = useSegments();

  // --- CLOUD SYNC LIFECYCLE (runs once) ---
  useEffect(() => {
    let active = true;

    const handleSession = async (session: any) => {
      if (session) {
        // Signed in: load the cloud backup, then keep it in sync.
        await pullStateFromCloud();
        if (active) startSync();
      } else {
        // Signed out: stop syncing and clear this device's data (privacy).
        stopSync();
        useStore.getState().resetLocal();
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        handleSession(session);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      stopSync();
    };
  }, []);

  useEffect(() => {
    // 1. Check if they are already logged in when the app opens
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleRouting(session);
      setIsInitialized(true);
    });

    // 2. Listen for log in / log out events in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleRouting(session);
    });

    return () => subscription.unsubscribe();
  }, [segments]); // Re-run if the user changes screens

  const handleRouting = (session: any) => {
    const seg0 = segments[0];
    const onboarded = useStore.getState().hasOnboarded;

    // First-time users see the onboarding tutorial before anything else.
    if (!onboarded) {
      if (seg0 !== 'onboarding') router.replace('/onboarding');
      return;
    }

    const isLoginScreen = seg0 === 'login';
    if (!session && !isLoginScreen) {
      // Not logged in, but trying to view the app. Send to login.
      router.replace('/login');
    } else if (session && (isLoginScreen || seg0 === 'onboarding')) {
      // Logged in but on login/onboarding. Send to the dashboard.
      router.replace('/');
    }
  };

  // Show a dark screen while we verify their security token
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  // If they pass the checks, render the app normally
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Slot />
    </>
  );
}