import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Session } from '@supabase/supabase-js';
import { pullStateFromCloud, startSync, stopSync } from '../lib/cloud-sync';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const isDarkMode = useStore((s) => s.isDarkMode);
  const router = useRouter();
  const segments = useSegments();

  // --- AUTH + CLOUD SYNC LIFECYCLE (single subscription, runs once) ---
  useEffect(() => {
    let active = true;

    // React to a session changing: keep local `session` in sync AND manage cloud backup.
    const handleSession = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);

      if (nextSession) {
        // Signed in: load the cloud backup, then keep it in sync.
        await pullStateFromCloud();
        if (active) startSync();
      } else {
        // Signed out: stop syncing and clear this device's data (privacy).
        stopSync();
        useStore.getState().resetLocal();
      }
    };

    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      handleSession(initial);
      if (active) setIsInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        handleSession(nextSession);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      stopSync();
    };
  }, []);

  // --- ROUTING GUARD (re-runs when the session or the current screen changes) ---
  useEffect(() => {
    if (!isInitialized) return;

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
  }, [session, segments, isInitialized, router]);

  // Show a dark screen while we verify their security token.
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  // If they pass the checks, render the app normally.
  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Slot />
    </SafeAreaProvider>
  );
}
