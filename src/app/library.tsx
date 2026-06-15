import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, useStore } from '../lib/store';

export default function LibraryScreen() {
  const router = useRouter();
  
  // PULLING THE THEME ENGINE
  const { savedDecks, deleteDeck, isHapticsEnabled, isDarkMode, accentColor } = useStore();
  const theme = getThemeColors(isDarkMode, accentColor);

  const triggerHaptic = (type: 'light' | 'heavy') => {
    if (!isHapticsEnabled) return;
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const confirmDelete = (id: string, title: string) => {
    triggerHaptic('heavy');
    Alert.alert(
      "Delete Deck",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
            deleteDeck(id);
            triggerHaptic('heavy');
          } 
        }
      ]
    );
  };

  const renderDeck = ({ item }: { item: any }) => {
    const mastered = item.cards.filter((c: any) => c.repetition > 0).length;
    const total = item.cards.length;
    const progress = total === 0 ? 0 : Math.round((mastered / total) * 100);

    return (
      <TouchableOpacity 
        style={[styles.deckCard, { backgroundColor: theme.card, borderColor: theme.border }]} 
        onPress={() => { triggerHaptic('light'); router.push({ pathname: '/arena', params: { deckId: item.id } }); }}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.deckTitle, { color: theme.text }]}>{item.title}</Text>
          <TouchableOpacity onPress={() => confirmDelete(item.id, item.title)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color={theme.subText} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="albums" size={14} color={theme.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.statText, { color: theme.subText }]}>{total} Cards</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="checkmark-circle" size={14} color={theme.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.statText, { color: theme.subText }]}>{progress}% Mastered</Text>
          </View>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.accent }]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={28} color={theme.text} onPress={() => router.back()} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Data Vault</Text>
        <View style={{ width: 28 }} />
      </View>

      {savedDecks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color={theme.border} />
          <Text style={[styles.emptyText, { color: theme.subText }]}>Your vault is empty.</Text>
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.accent }]} onPress={() => router.push('/generator')}>
            <Text style={[styles.emptyButtonText, { color: theme.invertText }]}>Generate a Deck</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedDecks}
          keyExtractor={(item) => item.id}
          renderItem={renderDeck}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  listContent: { padding: 24, paddingBottom: 100 },
  deckCard: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  deckTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 16 },
  deleteButton: { padding: 4 },
  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statBadge: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statText: { fontSize: 12, fontWeight: '600' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, marginTop: 16, marginBottom: 24, fontWeight: '600' },
  emptyButton: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  emptyButtonText: { fontSize: 16, fontWeight: 'bold' }
});