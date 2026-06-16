import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

const ACCENT = '#00E5FF';
const BG = '#0A0A0F';
const FIELD_BG = '#13131C';
const IDLE_BORDER = '#22222E';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Pulsing glow behind the logo orb.
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [glow]);
  const orbScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const orbOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  const handleAuthentication = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      Alert.alert('Missing Info', 'Please enter your email and password.');
      return;
    }
    if (isSignUp && !firstName.trim()) {
      Alert.alert('Missing Info', 'We need your first name to personalize your coach.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { first_name: firstName.trim() } },
        });
        if (error) throw error;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Welcome aboard! 🎉', 'Your account is ready.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert('Enter your email first', 'Type your email in the field above, then tap "Forgot password".');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Check your inbox 📧', `We sent a password reset link to ${cleanEmail}.`);
    } catch (e: any) {
      Alert.alert('Could not send reset link', e.message);
    }
  };

  const fieldStyle = (name: string) => [
    styles.inputWrap,
    { borderColor: focused === name ? ACCENT : IDLE_BORDER, shadowOpacity: focused === name ? 0.5 : 0 },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* BRANDING */}
        <View style={styles.header}>
          <View style={styles.orbWrap}>
            <Animated.View style={[styles.orbGlow, { opacity: orbOpacity, transform: [{ scale: orbScale }] }]} />
            <LinearGradient colors={['#00E5FF', '#0066FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
              <Ionicons name="flash" size={36} color="#00121A" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>SWIPEIQ</Text>
          <Text style={styles.tagline}>Swipe. Learn. Level up.</Text>
        </View>

        {/* SEGMENTED MODE SWITCH */}
        <View style={styles.segment}>
          <TouchableOpacity
            style={[styles.segmentBtn, !isSignUp && styles.segmentBtnActive]}
            onPress={() => { Haptics.selectionAsync(); setIsSignUp(false); }}
          >
            <Text style={[styles.segmentText, !isSignUp && styles.segmentTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, isSignUp && styles.segmentBtnActive]}
            onPress={() => { Haptics.selectionAsync(); setIsSignUp(true); }}
          >
            <Text style={[styles.segmentText, isSignUp && styles.segmentTextActive]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {isSignUp && (
            <View style={fieldStyle('name')}>
              <Ionicons name="person-outline" size={18} color={focused === 'name' ? ACCENT : '#666'} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#555"
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                autoCorrect={false}
              />
            </View>
          )}

          <View style={fieldStyle('email')}>
            <Ionicons name="mail-outline" size={18} color={focused === 'email' ? ACCENT : '#666'} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={fieldStyle('password')}>
            <Ionicons name="lock-closed-outline" size={18} color={focused === 'password' ? ACCENT : '#666'} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>

        {!isSignUp && (
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        {/* PRIMARY ACTION */}
        <TouchableOpacity onPress={handleAuthentication} disabled={loading} activeOpacity={0.85} style={styles.authShadow}>
          <LinearGradient colors={['#00E5FF', '#0066FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.authButton}>
            {loading ? (
              <ActivityIndicator color="#00121A" />
            ) : (
              <Text style={styles.authButtonText}>{isSignUp ? 'CREATE ACCOUNT' : 'ENTER VAULT'}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.secureNote}>🔒  Your data is encrypted and private to you.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 30 },

  header: { alignItems: 'center', marginBottom: 36 },
  orbWrap: { width: 96, height: 96, justifyContent: 'center', alignItems: 'center', marginBottom: 22 },
  orbGlow: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: ACCENT },
  orb: {
    width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 20, elevation: 12,
  },
  title: { color: '#FFF', fontSize: 38, fontWeight: '900', letterSpacing: 6 },
  tagline: { color: ACCENT, fontSize: 12, marginTop: 8, letterSpacing: 3, fontWeight: '700' },

  segment: { flexDirection: 'row', backgroundColor: FIELD_BG, borderRadius: 14, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: IDLE_BORDER },
  segmentBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: 'rgba(0,229,255,0.12)', borderWidth: 1, borderColor: ACCENT },
  segmentText: { color: '#777', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  segmentTextActive: { color: ACCENT },

  form: { marginBottom: 24 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: FIELD_BG, borderRadius: 14,
    paddingHorizontal: 16, marginBottom: 14, borderWidth: 1.5, height: 58,
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowRadius: 10, elevation: 0,
  },
  icon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '500' },

  authShadow: { shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 10 },
  authButton: { height: 58, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  authButtonText: { color: '#00121A', fontSize: 15, fontWeight: '900', letterSpacing: 2 },

  secureNote: { color: '#555', fontSize: 11, textAlign: 'center', marginTop: 24, fontWeight: '600' },
  forgotWrap: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 18, paddingVertical: 4 },
  forgotText: { color: '#888', fontSize: 13, fontWeight: '600' },
});
