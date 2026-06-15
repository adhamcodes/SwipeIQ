import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DeckCardProps {
  title: string;
  cardCount: number;
}

export const DeckCard = ({ title, cardCount }: DeckCardProps) => (
  <TouchableOpacity activeOpacity={0.8} style={styles.card}>
    <View style={styles.info}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{cardCount} Cards</Text>
    </View>
    <View style={styles.playButton}>
      <Text style={styles.playIcon}>▶</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 14, marginTop: 4 },
  playButton: {
    backgroundColor: '#2d2d2d',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { color: '#fff', fontSize: 16 },
});