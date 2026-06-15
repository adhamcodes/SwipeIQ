import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, PanResponder, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Flashcard, getThemeColors, useStore } from '../lib/store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;
const TIME_LIMIT_MS = 15000;

interface BossCard extends Flashcard { deckId: string; originalIndex: number; }

export default function BossArenaScreen() {
  const router = useRouter();
  
  // ADDED: incrementDailySwipes
  const { savedDecks, updateDeck, isHapticsEnabled, isAudioEnabled, streak, setSetting, addXP, isDarkMode, accentColor, incrementDailySwipes } = useStore();
  
  const baseTheme = getThemeColors(isDarkMode, accentColor);
  const theme = {
    ...baseTheme,
    bossBg: isDarkMode ? '#1A0000' : '#FFF5F5',
    timerTrack: isDarkMode ? '#330000' : '#FECACA',
    cardBorder: isDarkMode ? '#4A0000' : '#FCA5A5',
  };

  const [bossDeck, setBossDeck] = useState<BossCard[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let allCards: BossCard[] = [];
    savedDecks.forEach(deck => { deck.cards.forEach((card, index) => { allCards.push({ ...card, deckId: deck.id, originalIndex: index }); }); });
    allCards.sort((a, b) => a.eFactor - b.eFactor);
    setBossDeck(allCards.slice(0, 20));
    setIsInitialized(true);
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const timerAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const position = useRef(new Animated.ValueXY()).current;

  const stateRef = useRef({ currentIndex, bossDeck, showAnswer });
  useEffect(() => { stateRef.current = { currentIndex, bossDeck, showAnswer }; }, [currentIndex, bossDeck, showAnswer]);

  const triggerHaptic = (type: 'light' | 'heavy' | 'success' | 'error') => {
    if (!isHapticsEnabled) return;
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const playSound = async (type: 'neutral' | 'right' | 'left') => {
    if (!isAudioEnabled) return;
    try {
      const soundMap = {
        neutral: require('../../assets/sounds/swipe_neutral.wav'),
        right: require('../../assets/sounds/swipe_right.wav'),
        left: require('../../assets/sounds/swipe_left.wav'),
      };
      const { sound } = await Audio.Sound.createAsync(soundMap[type]);
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Audio playback failed:", error);
    }
  };

  const handleAlgorithm = (quality: 'MASTERED' | 'FORGOT') => {
    const { currentIndex, bossDeck } = stateRef.current;
    if (!bossDeck || !bossDeck[currentIndex]) return;

    const targetCard = bossDeck[currentIndex];
    let { repetition, interval, eFactor } = targetCard;

    if (quality === 'MASTERED') {
      interval = repetition === 0 ? 1 : repetition === 1 ? 6 : Math.round(interval * eFactor);
      repetition += 1; eFactor += 0.1;
      addXP(15);
    } else {
      repetition = 0; interval = 1; eFactor = Math.max(1.3, eFactor - 0.2);
    }

    const parentDeck = savedDecks.find(d => d.id === targetCard.deckId);
    if (parentDeck) {
      const updatedCards = [...parentDeck.cards];
      updatedCards[targetCard.originalIndex] = { ...targetCard, repetition, interval, eFactor };
      updateDeck({ ...parentDeck, cards: updatedCards });
    }

    setShowAnswer(false);
    
    if (currentIndex < bossDeck.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      triggerHaptic('success');
      const newStreak = streak + 1;
      setSetting('streak', newStreak); 
      Alert.alert("Boss Defeated! 💀", `You survived the gauntlet. Streak increased to ${newStreak}! 🔥`, [
        { text: "Return to Base", onPress: () => router.replace('/') }
      ]);
    }
  };

  const onSwipeComplete = (direction: 'left' | 'right', isTimeout: boolean) => {
    if (!isTimeout) triggerHaptic('heavy');
    const quality = direction === 'right' ? 'MASTERED' : 'FORGOT';
    
    if (quality === 'MASTERED') playSound('right');
    else playSound('left');

    handleAlgorithm(quality);
    
    // NEW: Fire the bounty tracker on every valid boss swipe
    incrementDailySwipes();
    
    position.setValue({ x: 0, y: 0 });
  };

  const forceSwipe = (direction: 'left' | 'right', isTimeout = false) => {
    timerAnim.stopAnimation(); 
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, { toValue: { x, y: 0 }, duration: SWIPE_OUT_DURATION, useNativeDriver: false }).start(() => onSwipeComplete(direction, isTimeout));
  };

  const resetPosition = () => { Animated.spring(position, { toValue: { x: 0, y: 0 }, friction: 5, useNativeDriver: false }).start(); };

  const handleTimeOut = () => { 
    triggerHaptic('error'); 
    playSound('left'); 
    forceSwipe('left', true); 
  };

  const startTimer = () => {
    timerAnim.setValue(100);
    Animated.timing(timerAnim, { toValue: 0, duration: TIME_LIMIT_MS, easing: Easing.linear, useNativeDriver: false }).start(({ finished }) => { if (finished) handleTimeOut(); });
    Animated.loop(Animated.sequence([ Animated.timing(pulseAnim, { toValue: 1.03, duration: 500, useNativeDriver: false }), Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: false }) ])).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => { position.setValue({ x: gestureState.dx, y: gestureState.dy }); },
      onPanResponderRelease: (evt, gestureState) => {
        const isTap = Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10;
        if (isTap) { 
          triggerHaptic('light'); 
          playSound('neutral');
          setShowAnswer(!stateRef.current.showAnswer); 
          resetPosition(); 
          return; 
        }
        if (gestureState.dx > SWIPE_THRESHOLD) forceSwipe('right');
        else if (gestureState.dx < -SWIPE_THRESHOLD) forceSwipe('left');
        else resetPosition();
      }
    })
  ).current;

  useEffect(() => {
    if (isInitialized && bossDeck.length > 0) startTimer();
    return () => { timerAnim.stopAnimation(); pulseAnim.stopAnimation(); };
  }, [currentIndex, isInitialized]);

  if (!isInitialized) return <View style={[styles.container, { backgroundColor: theme.bossBg }]} />;
  if (bossDeck.length === 0) return (
      <View style={[styles.center, { backgroundColor: theme.bossBg }]}>
        <Ionicons name="shield-checkmark" size={64} color="#32CD32" style={{marginBottom: 20}} />
        <Text style={{color: theme.text, fontSize: 20, fontWeight: 'bold'}}>Your Vault is Empty</Text>
        <TouchableOpacity onPress={() => router.replace('/')} style={[styles.retreatButton, { borderColor: theme.danger }]}><Text style={[styles.retreatText, { color: theme.danger }]}>Return to Base</Text></TouchableOpacity>
      </View>
  );

  const currentCard = bossDeck[currentIndex];

  const getCardStyle = () => {
    const rotate = position.x.interpolate({ inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5], outputRange: ['-120deg', '0deg', '120deg'] });
    return { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate: rotate }, { scale: pulseAnim }] };
  };

  const timerWidth = timerAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const timerColor = timerAnim.interpolate({ inputRange: [0, 30, 100], outputRange: ['#FF0000', theme.danger, '#32CD32'] });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bossBg }]}>
      <View style={[styles.timerTrack, { backgroundColor: theme.timerTrack }]}><Animated.View style={[styles.timerFill, { width: timerWidth, backgroundColor: timerColor, shadowColor: theme.danger }]} /></View>
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="skull" size={28} color={theme.danger} style={{ marginRight: 10 }} />
          <Text style={[styles.progress, { color: theme.danger }]}>THREAT {currentIndex + 1}/{bossDeck.length}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.streakBadge, { backgroundColor: theme.dangerBg, borderColor: theme.danger }]}>
            <Ionicons name="flame" size={14} color={theme.danger} />
            <Text style={[styles.streakText, { color: theme.danger }]}>{streak}</Text>
          </View>
          <TouchableOpacity onPress={() => router.replace('/')} style={{ marginLeft: 16 }}><Text style={[styles.retreatTextSmall, { color: theme.subText }]}>Retreat</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, shadowColor: theme.danger }, getCardStyle()]} {...panResponder.panHandlers}>
          <Text style={[styles.label, { color: theme.danger }]}>{showAnswer ? "TARGET ACQUIRED" : "INCOMING THREAT"}</Text>
          <ScrollView contentContainerStyle={styles.scrollText} showsVerticalScrollIndicator={false}>
            <Text style={[styles.text, { color: theme.text }]}>{showAnswer ? currentCard.answer : currentCard.question}</Text>
          </ScrollView>
          <View style={styles.footerHints}>
            {!showAnswer ? <Text style={[styles.hint, { color: theme.subText }]}>Tap to analyze</Text> : <Text style={[styles.swipeHint, { color: theme.danger }]}>Swipe Left if overwhelmed • Swipe Right if neutralized (+15 XP)</Text>}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, 
  timerTrack: { height: 6, width: '100%' },
  timerFill: { height: '100%', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.8, shadowRadius: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 20 },
  progress: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  streakText: { fontWeight: '900', marginLeft: 4, fontSize: 12 },
  retreatTextSmall: { fontSize: 14, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  retreatButton: { marginTop: 30, paddingVertical: 12, paddingHorizontal: 24, borderWidth: 1, borderRadius: 8 },
  retreatText: { fontWeight: 'bold' },
  cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', borderRadius: 24, padding: 30, height: '80%', borderWidth: 2, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 15, position: 'absolute' },
  label: { fontWeight: '900', marginBottom: 20, textAlign: 'center', letterSpacing: 3, fontSize: 12 },
  scrollText: { flexGrow: 1, justifyContent: 'center' },
  text: { fontSize: 22, textAlign: 'center', fontWeight: 'bold', lineHeight: 34 },
  footerHints: { marginTop: 20, height: 40, justifyContent: 'center' },
  hint: { textAlign: 'center', fontSize: 14, fontWeight: '600' },
  swipeHint: { textAlign: 'center', fontSize: 12, fontWeight: 'bold' },
});