import { StyleSheet, Text, View } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
}

export const StatCard = ({ label, value }: StatCardProps) => (
  <View style={styles.card}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 16,
    width: '45%',
    borderWidth: 1,
    borderColor: '#333',
  },
  value: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  label: { color: '#888', fontSize: 12, marginTop: 4 },
});