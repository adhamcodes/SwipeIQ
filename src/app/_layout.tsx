import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

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
    // Are they currently trying to view the login screen?
    const isLoginScreen = segments[0] === 'login';

    if (!session && !isLoginScreen) {
      // Security Check Failed: Not logged in, but trying to view the app. Kick them out.
      router.replace('/login');
    } else if (session && isLoginScreen) {
      // Logged in, but trying to view the login page. Send them to Dashboard.
      router.replace('/');
    }
  };

  // Show a dark screen while we verify their security token
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  // If they pass the checks, render the app normally
  return <Slot />;
}