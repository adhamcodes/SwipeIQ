import { StyleSheet, Text, View } from 'react-native';

export const DashboardHeader = () => (
  <View style={styles.header}>
    <Text style={styles.title}>Welcome back, Scholar.</Text>
    <Text style={styles.subtitle}>Let's crush today's goals.</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { marginBottom: 30, marginTop: 10 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 16, marginTop: 4 },
});