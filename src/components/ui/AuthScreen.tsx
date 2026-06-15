import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signInWithEmail, signUpWithEmail } from '../../lib/auth';

// We added 'onAuthSuccess' so this screen can tell the main app to let the user in
export const AuthScreen = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return Alert.alert("Hold up!", "Please enter an email and password.");
    setLoading(true);
    
    const { error } = await signInWithEmail(email, password);
    
    setLoading(false);
    if (error) {
      Alert.alert("Login Failed", error);
    } else {
      onAuthSuccess(); // Success! Drop the rope!
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert("Hold up!", "Please enter an email and password.");
    setLoading(true);
    
    const { error } = await signUpWithEmail(email, password);
    
    setLoading(false);
    if (error) {
      Alert.alert("Sign Up Failed", error);
    } else {
      Alert.alert("Success!", "Account created. You can now Sign In.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SwipeIQ</Text>
        <Text style={styles.subtitle}>Unlock your personalized study vault.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="scholar@example.com"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.secondaryText}>Create an Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 30 },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { color: '#fff', fontSize: 42, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  subtitle: { color: '#888', fontSize: 16, textAlign: 'center' },
  form: { width: '100%' },
  label: { color: '#aaa', fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#333', fontSize: 16 },
  primaryButton: { backgroundColor: '#6366f1', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  secondaryText: { color: '#aaa', fontSize: 16, fontWeight: '600' },
});