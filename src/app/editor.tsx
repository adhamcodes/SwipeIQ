import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeCard } from '../lib/deck-utils';
import { Flashcard, getThemeColors, useStore } from '../lib/store';

export default function EditorScreen() {
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();

  const { savedDecks, addDeck, updateDeck, isHapticsEnabled, isDarkMode, accentColor } = useStore();
  const theme = getThemeColors(isDarkMode, accentColor);

  const existingDeck = useMemo(() => savedDecks.find((d) => d.id === deckId), [savedDecks, deckId]);
  const isEditing = !!existingDeck;

  const [title, setTitle] = useState(existingDeck?.title ?? '');
  const [cards, setCards] = useState<Flashcard[]>(
    existingDeck ? existingDeck.cards.map((c) => ({ ...c })) : [makeCard('', ''), makeCard('', '')],
  );

  const haptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (isHapticsEnabled) Haptics.impactAsync(style);
  };

  const updateCardField = (index: number, field: 'question' | 'answer', value: string) => {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const addCardRow = () => {
    haptic();
    setCards((prev) => [...prev, makeCard('', '')]);
  };

  const removeCardRow = (index: number) => {
    haptic(Haptics.ImpactFeedbackStyle.Medium);
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      Alert.alert('Missing Title', 'Please give your deck a name.');
      return;
    }
    const validCards = cards
      .map((c) => ({ ...c, question: c.question.trim(), answer: c.answer.trim() }))
      .filter((c) => c.question && c.answer);

    if (validCards.length === 0) {
      Alert.alert('No Cards', 'Add at least one card with both a question and an answer.');
      return;
    }

    if (isEditing && existingDeck) {
      updateDeck({ ...existingDeck, title: cleanTitle, cards: validCards });
    } else {
      addDeck({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, title: cleanTitle, cards: validCards, createdAt: Date.now() });
    }

    if (isHapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{isEditing ? 'Edit Deck' : 'New Deck'}</Text>
          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: theme.accent }]}>
            <Text style={[styles.saveBtnText, { color: theme.invertText }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* TITLE */}
          <Text style={[styles.label, { color: theme.subText }]}>DECK TITLE</Text>
          <TextInput
            style={[styles.titleInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., Biology Chapter 4"
            placeholderTextColor={theme.subText}
            value={title}
            onChangeText={setTitle}
          />

          {/* CARDS */}
          <View style={styles.cardsHeader}>
            <Text style={[styles.label, { color: theme.subText }]}>CARDS ({cards.length})</Text>
          </View>

          {cards.map((card, index) => (
            <View key={card.id} style={[styles.cardEditor, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardEditorTop}>
                <Text style={[styles.cardNumber, { color: theme.accent }]}>#{index + 1}</Text>
                <TouchableOpacity onPress={() => removeCardRow(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={18} color={theme.danger} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.cardInput, { color: theme.text, borderBottomColor: theme.border }]}
                placeholder="Question"
                placeholderTextColor={theme.subText}
                value={card.question}
                onChangeText={(t) => updateCardField(index, 'question', t)}
                multiline
              />
              <TextInput
                style={[styles.cardInput, { color: theme.text, borderBottomColor: 'transparent' }]}
                placeholder="Answer"
                placeholderTextColor={theme.subText}
                value={card.answer}
                onChangeText={(t) => updateCardField(index, 'answer', t)}
                multiline
              />
            </View>
          ))}

          <TouchableOpacity style={[styles.addCardBtn, { borderColor: theme.accent }]} onPress={addCardRow}>
            <Ionicons name="add" size={22} color={theme.accent} />
            <Text style={[styles.addCardText, { color: theme.accent }]}>Add Card</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12 },
  saveBtnText: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  content: { padding: 20, paddingBottom: 60 },
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  titleInput: { borderRadius: 14, borderWidth: 1, padding: 16, fontSize: 17, fontWeight: '600', marginBottom: 26 },
  cardsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardEditor: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardEditorTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardNumber: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  cardInput: { fontSize: 16, fontWeight: '500', paddingVertical: 10, borderBottomWidth: 1 },
  addCardBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', marginTop: 6 },
  addCardText: { fontSize: 15, fontWeight: '700', marginLeft: 8 },
});
