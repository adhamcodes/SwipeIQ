import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { generateFlashcards } from '../lib/gemini';
import { getThemeColors, useStore } from '../lib/store';

export default function GeneratorScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [cardCount, setCardCount] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  const { addDeck, isHapticsEnabled, isDarkMode, accentColor } = useStore();
  const theme = getThemeColors(isDarkMode, accentColor);

  // --- THE RGB ANIMATION ENGINE ---
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const triggerHaptic = (type: 'light' | 'heavy' | 'success') => {
    if (!isHapticsEnabled) return;
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) { triggerHaptic('heavy'); return; }
    
    triggerHaptic('light');
    setIsGenerating(true);
    setErrorText('');
    
    try {
      const advancedPrompt = `Generate exactly ${cardCount} flashcards at an ${difficulty} difficulty level about: ${topic}`;
      const cards = await generateFlashcards(advancedPrompt);
      
      const newDeck = { id: Date.now().toString(), title: topic, cards, createdAt: Date.now() };
      addDeck(newDeck);
      triggerHaptic('success');
      router.replace('/');
    } catch (error: any) {
      triggerHaptic('heavy');
      setErrorText(error.message || "Failed to connect to the AI network.");
    } finally {
      setIsGenerating(false);
    }
  };

  const difficulties = ['Beginner', 'Intermediate', 'Expert'];
  const counts = [5, 10, 15, 20];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* MINIMAL HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={32} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* HERO SECTION */}
          <View style={styles.heroSection}>
            <View style={[styles.iconWrapper, { shadowColor: theme.accent }]}>
              <Ionicons name="hardware-chip" size={54} color={theme.accent} />
            </View>
            <Text style={[styles.heroTitle, { color: theme.text }]}>DATA INJECTION</Text>
            <Text style={[styles.heroSubtitle, { color: theme.subText }]}>
              Input subject parameters to synthesize a {cardCount}-card mastery matrix.
            </Text>
          </View>

          {/* THE ANIMATED RGB NEON INPUT */}
          <View style={[styles.rgbWrapper, { shadowColor: isDarkMode ? '#BD00FF' : theme.accent }]}>
            {/* The Spinning Gradient Background */}
            <Animated.View style={[styles.rgbAnimatedBackground, { transform: [{ rotate: spin }] }]}>
              <LinearGradient 
                colors={isDarkMode ? ['#00E5FF', '#BD00FF', '#FF0055', '#00E5FF'] : [theme.accent, theme.bg, theme.accent, theme.bg]} 
                style={{ flex: 1 }} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
              />
            </Animated.View>
            
            {/* The Inner Dark Box */}
            <View style={[styles.innerInputBox, { backgroundColor: theme.card }]}>
              <Text style={[styles.terminalLabel, { color: theme.accent }]}>{`> AI_PROMPT_INPUT`}</Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="e.g., Deep Learning, Quantum Physics..."
                placeholderTextColor={theme.subText}
                value={topic}
                onChangeText={setTopic}
                multiline
              />
            </View>
          </View>

          {/* PARAMETERS */}
          <View style={styles.parametersContainer}>
            <Text style={[styles.sectionLabel, { color: theme.subText }]}>COMPLEXITY LEVEL</Text>
            <View style={styles.row}>
              {difficulties.map((diff) => {
                const isActive = difficulty === diff;
                return (
                  <TouchableOpacity
                    key={diff}
                    onPress={() => { triggerHaptic('light'); setDifficulty(diff); }}
                    style={[
                      styles.optionButton,
                      { 
                        // Using strictly solid colors to prevent shadow bleed
                        backgroundColor: isActive 
                          ? (isDarkMode ? theme.card : theme.accent) 
                          : (isDarkMode ? theme.bg : theme.card),
                        borderColor: isActive ? theme.accent : theme.border,
                        borderWidth: isActive ? 2 : 1, // Thicker border for active state
                        shadowColor: isActive ? theme.accent : 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: isActive ? (isDarkMode ? 0.8 : 0.4) : 0,
                        shadowRadius: isActive ? 8 : 0,
                        elevation: isActive ? 8 : 0
                      }
                    ]}
                  >
                    <Text style={{ 
                      color: isActive ? (isDarkMode ? theme.accent : theme.invertText) : theme.subText,
                      fontWeight: isActive ? 'bold' : '600',
                      fontSize: 12
                    }}>
                      {diff}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: theme.subText, marginTop: 24 }]}>DATA VOLUME (CARDS)</Text>
            <View style={styles.row}>
              {counts.map((num) => {
                const isActive = cardCount === num;
                return (
                  <TouchableOpacity
                    key={num}
                    onPress={() => { triggerHaptic('light'); setCardCount(num); }}
                    style={[
                      styles.countButton,
                      { 
                        // Using strictly solid colors to prevent shadow bleed
                        backgroundColor: isActive 
                          ? (isDarkMode ? theme.card : theme.accent) 
                          : (isDarkMode ? theme.bg : theme.card),
                        borderColor: isActive ? theme.accent : theme.border,
                        borderWidth: isActive ? 2 : 1, // Thicker border for active state
                        shadowColor: isActive ? theme.accent : 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: isActive ? (isDarkMode ? 0.8 : 0.4) : 0,
                        shadowRadius: isActive ? 8 : 0,
                        elevation: isActive ? 8 : 0
                      }
                    ]}
                  >
                    <Text style={{ 
                      color: isActive ? (isDarkMode ? theme.accent : theme.invertText) : theme.subText,
                      fontWeight: isActive ? 'bold' : '600',
                      fontSize: 16
                    }}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {errorText ? (
            <View style={[styles.errorBox, { backgroundColor: theme.dangerBg, borderColor: theme.danger }]}>
              <Ionicons name="warning" size={20} color={theme.danger} style={{ marginRight: 10 }} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{errorText}</Text>
            </View>
          ) : null}

        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.bg }]}>
          {isGenerating ? (
            <View style={[styles.compilingBox, { borderColor: theme.accent, backgroundColor: isDarkMode ? 'rgba(0, 229, 255, 0.05)' : 'transparent' }]}>
              <Animated.View style={[styles.customSpinner, { borderColor: theme.accent, borderTopColor: 'transparent', transform: [{ rotate: spin }] }]} />
              <Text style={[styles.compilingText, { color: theme.accent }]}>COMPILING ALGORITHMS...</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.generateButton, { backgroundColor: theme.accent, shadowColor: theme.accent }]} 
              onPress={handleGenerate}
            >
              <Text style={[styles.generateButtonText, { color: theme.invertText }]}>INITIALIZE SEQUENCE</Text>
            </TouchableOpacity>
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  backButton: { padding: 4, alignSelf: 'flex-start' },
  content: { padding: 24, paddingBottom: 40 },
  
  heroSection: { alignItems: 'center', marginBottom: 30 },
  iconWrapper: { marginBottom: 16, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 25, elevation: 15 },
  heroTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 4, marginBottom: 8, textAlign: 'center' },
  heroSubtitle: { fontSize: 12, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10, fontWeight: '600' },

  // RGB NEON WRAPPER STYLES
  rgbWrapper: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 3, 
    marginBottom: 30,
    minHeight: 140,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  rgbAnimatedBackground: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
  },
  innerInputBox: {
    flex: 1,
    borderRadius: 18,
    padding: 20,
  },
  terminalLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  input: { 
    fontSize: 20, 
    fontWeight: '600', 
    lineHeight: 28, 
    textAlignVertical: 'top' 
  },

  parametersContainer: { marginTop: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  optionButton: { flex: 1, paddingVertical: 14, marginHorizontal: 4, borderRadius: 10, alignItems: 'center' },
  countButton: { width: 65, height: 65, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  errorBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 8, borderWidth: 1, marginTop: 24 },
  errorText: { flex: 1, fontSize: 14, fontWeight: '600' },
  
  footer: { padding: 24, paddingBottom: 34 },
  generateButton: { flexDirection: 'row', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  generateButtonText: { fontSize: 14, fontWeight: '900', letterSpacing: 2 },

  // CUSTOM HACKER SPINNER STYLES
  compilingBox: { height: 120, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  customSpinner: { width: 40, height: 40, borderRadius: 20, borderWidth: 4, marginBottom: 16 },
  compilingText: { fontSize: 12, fontWeight: '900', letterSpacing: 3 }
});