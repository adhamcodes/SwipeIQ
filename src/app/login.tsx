import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthentication = async () => {
    if (!email || !password) {
      Alert.alert('Access Denied', 'Please enter your credentials.');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (!firstName) {
          Alert.alert('Missing Info', 'We need your first name to personalize your coach.');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { first_name: firstName } }
        });
        if (error) throw error;
        Alert.alert('Protocol Complete', 'Account created successfully.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert("Coming Soon", `${provider} authentication will be enabled in a future update.`);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        
        {/* Futuristic Branding */}
        <View style={styles.header}>
          <View style={styles.glowOrb}>
            <Ionicons name="flash" size={40} color="#FFF" />
          </View>
          <Text style={styles.title}>SWIPEIQ</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'INITIALIZE NEW SCHOLAR' : 'SECURE SYSTEM ACCESS'}
          </Text>
        </View>

        {/* Social Login Options */}
        <View style={styles.socialGrid}>
          <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Google')}>
            <Ionicons name="logo-google" size={20} color="#FFF" />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Apple')}>
            <Ionicons name="logo-apple" size={20} color="#FFF" />
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SECURE EMAIL</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Core Form Fields */}
        <View style={styles.form}>
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#555"
              value={firstName}
              onChangeText={setFirstName}
              autoCorrect={false}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity style={styles.authButton} onPress={handleAuthentication} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.authButtonText}>
              {isSignUp ? 'INITIALIZE ACCOUNT' : 'ENTER VAULT'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Toggle Mode */}
        <TouchableOpacity style={styles.toggleButton} onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'RETURN TO LOGIN' : "CREATE NEW ACCOUNT"}
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' }, // Even darker background for futuristic feel
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  glowOrb: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
  title: { color: '#FFF', fontSize: 36, fontWeight: '900', letterSpacing: 4 },
  subtitle: { color: '#6C63FF', fontSize: 12, marginTop: 8, letterSpacing: 2, fontWeight: 'bold' },
  socialGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  socialBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#1A1A1A', paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333', marginHorizontal: 5 },
  socialText: { color: '#FFF', marginLeft: 10, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333' },
  dividerText: { color: '#555', paddingHorizontal: 10, fontSize: 10, letterSpacing: 1, fontWeight: 'bold' },
  form: { marginBottom: 20 },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', fontSize: 16, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#333', marginBottom: 16 },
  authButton: { backgroundColor: '#6C63FF', paddingVertical: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  authButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  toggleButton: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: '#888', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }
});