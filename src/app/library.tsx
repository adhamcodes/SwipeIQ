import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeDeck } from '../lib/deck-utils';
import { STARTER_DECKS } from '../lib/starter-decks';
import { getThemeColors, useStore } from '../lib/store';

export default function LibraryScreen() {
  const router = useRouter();

  const { savedDecks, deleteDeck, addDeck, isHapticsEnabled, isDarkMode, accentColor } = useStore();
  const theme = getThemeColors(isDarkMode, accentColor);

  const [search, setSearch] = useState('');

  const triggerHaptic = (type: 'light' | 'heavy') => {
    if (!isHapticsEnabled) return;
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const confirmDelete = (id: string, title: string) => {
    triggerHaptic('heavy');
    Alert.alert('Delete Deck', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteDeck(id); triggerHaptic('heavy'); } },
    ]);
  };

  const addStarter = (index: number) => {
    triggerHaptic('light');
    const starter = STARTER_DECKS[index];
    addDeck(makeDeck(starter.title, starter.cards));
    if (isHapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const filteredDecks = savedDecks.filter((d) => d.title.toLowerCase().includes(search.trim().toLowerCase()));

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
          <Text style={[styles.deckTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => { triggerHaptic('light'); router.push({ pathname: '/editor', params: { deckId: item.id } }); }} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={20} color={theme.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item.id, item.title)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={20} color={theme.subText} />
            </TouchableOpacity>
          </View>
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
        <TouchableOpacity hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Data Vault</Text>
        <TouchableOpacity onPress={() => { triggerHaptic('light'); router.push('/editor'); }} style={[styles.newBtn, { borderColor: theme.accent }]}>
          <Ionicons name="add" size={22} color={theme.accent} />
        </TouchableOpacity>
      </View>

      {savedDecks.length === 0 ? (
        <FlatList
          data={STARTER_DECKS}
          keyExtractor={(item) => item.title}
          ListHeaderComponent={
            <View style={styles.emptyHeader}>
              <Ionicons name="folder-open-outline" size={56} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.subText }]}>Your vault is empty.</Text>
              <View style={styles.emptyActions}>
                <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.accent }]} onPress={() => { triggerHaptic('light'); router.push('/generator'); }}>
                  <Ionicons name="flash" size={16} color={theme.invertText} style={{ marginRight: 6 }} />
                  <Text style={[styles.emptyButtonText, { color: theme.invertText }]}>AI Generate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.emptyButtonOutline, { borderColor: theme.accent }]} onPress={() => { triggerHaptic('light'); router.push('/editor'); }}>
                  <Ionicons name="create-outline" size={16} color={theme.accent} style={{ marginRight: 6 }} />
                  <Text style={[styles.emptyButtonText, { color: theme.accent }]}>Make Your Own</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.starterLabel, { color: theme.subText }]}>OR START WITH A READY-MADE DECK</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity style={[styles.starterCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => addStarter(index)}>
              <Text style={styles.starterEmoji}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.starterTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.starterSub, { color: theme.subText }]}>{item.cards.length} cards</Text>
              </View>
              <Ionicons name="add-circle" size={26} color={theme.accent} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <>
          <View style={styles.searchWrap}>
            <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="search" size={18} color={theme.subText} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search decks..."
                placeholderTextColor={theme.subText}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={theme.subText} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {filteredDecks.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={[styles.emptyText, { color: theme.subText }]}>No decks match "{search}".</Text>
            </View>
          ) : (
            <FlatList
              data={filteredDecks}
              keyExtractor={(item) => item.id}
              renderItem={renderDeck}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 8 },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  newBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 24, paddingBottom: 100 },

  searchWrap: { paddingHorizontal: 24, paddingTop: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  noResults: { padding: 40, alignItems: 'center' },

  deckCard: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  deckTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 12 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 4, marginLeft: 8 },
  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statBadge: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statText: { fontSize: 12, fontWeight: '600' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  emptyHeader: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { fontSize: 16, marginTop: 16, marginBottom: 24, fontWeight: '600' },
  emptyActions: { flexDirection: 'row', marginBottom: 30 },
  emptyButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, marginHorizontal: 6 },
  emptyButtonOutline: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1.5, marginHorizontal: 6 },
  emptyButtonText: { fontSize: 14, fontWeight: 'bold' },
  starterLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },

  starterCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  starterEmoji: { fontSize: 28, marginRight: 14 },
  starterTitle: { fontSize: 16, fontWeight: 'bold' },
  starterSub: { fontSize: 12, marginTop: 2 },
});
