import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { applySM2, QUALITY_FAILURE, QUALITY_SUCCESS } from '../lib/sm2';
import { Flashcard, getThemeColors, useStore } from '../lib/store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export default function ArenaScreen() {
  const { deckId } = useLocalSearchParams();
  const router = useRouter();
  
  // ADDED: incrementDailySwipes
  const { savedDecks, updateDeck, isHapticsEnabled, isAudioEnabled, isDarkMode, accentColor, streak, recordStudyCompletion, addXP, incrementDailySwipes } = useStore();
  const deck = savedDecks.find((d) => d.id === deckId);
  
  const theme = getThemeColors(isDarkMode, accentColor);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<{text: string, color: string} | null>(null);
  const [comboCount, setComboCount] = useState(0);

  // Session stats for the summary screen.
  const startXpRef = useRef(useStore.getState().xp);
  const rightRef = useRef(0);
  
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const position = useRef(new Animated.ValueXY()).current;

  const stateRef = useRef({ currentIndex, deck, showAnswer, comboCount });
  useEffect(() => {
    stateRef.current = { currentIndex, deck, showAnswer, comboCount };
  }, [currentIndex, deck, showAnswer, comboCount]);

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
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

  if (!deck || deck.cards.length === 0) return <View style={[styles.center, { backgroundColor: theme.bg }]}><Text style={{color: theme.text}}>Deck not found.</Text></View>;

  const currentCard = deck.cards[currentIndex];

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, { toValue: { x, y: 0 }, duration: SWIPE_OUT_DURATION, useNativeDriver: false })
      .start(() => onSwipeComplete(direction));
  };

  const resetPosition = () => {
    Animated.spring(position, { toValue: { x: 0, y: 0 }, friction: 5, useNativeDriver: false }).start();
  };

  const showFloatingBubble = (type: 'MASTERED' | 'FORGOT') => {
    setFeedback({ text: type === 'MASTERED' ? 'EXCELLENT' : 'NEXT TIME', color: type === 'MASTERED' ? theme.accent : theme.danger });
    bubbleAnim.setValue(0);
    Animated.sequence([
      Animated.timing(bubbleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(600),
      Animated.timing(bubbleAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => setFeedback(null));
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    triggerHaptic('heavy');
    const quality = direction === 'right' ? 'MASTERED' : 'FORGOT';
    
    if (quality === 'MASTERED') playSound('right');
    else playSound('left');

    showFloatingBubble(quality);
    handleAlgorithm(quality);
    
    // NEW: Fire the bounty tracker on every valid swipe
    incrementDailySwipes();
    
    position.setValue({ x: 0, y: 0 });
  };

  const handleAlgorithm = (quality: 'MASTERED' | 'FORGOT') => {
    const { currentIndex, deck, comboCount } = stateRef.current;
    if (!deck) return;

    const card = deck.cards[currentIndex];

    // Run the proper SM-2 spaced-repetition algorithm.
    const sm2 = applySM2(
      { repetition: card.repetition, interval: card.interval, eFactor: card.eFactor },
      quality === 'MASTERED' ? QUALITY_SUCCESS : QUALITY_FAILURE,
    );

    if (quality === 'MASTERED') {
      addXP(10);
      setComboCount(comboCount + 1);
      rightRef.current += 1;
    } else {
      setComboCount(0);
      triggerHaptic('error');
    }

    const updatedCard: Flashcard = {
      ...card,
      repetition: sm2.repetition,
      interval: sm2.interval,
      eFactor: sm2.eFactor,
      nextReviewTimestamp: sm2.nextReviewTimestamp,
    };
    const updatedCards = [...deck.cards];
    updatedCards[currentIndex] = updatedCard;
    updateDeck({ ...deck, cards: updatedCards });
    setShowAnswer(false);

    if (currentIndex < deck.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      triggerHaptic('success');
      recordStudyCompletion();
      router.replace({
        pathname: '/summary',
        params: {
          total: String(deck.cards.length),
          right: String(rightRef.current),
          startXP: String(startXpRef.current),
          endXP: String(useStore.getState().xp),
          mode: 'normal',
        },
      });
    }
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({ inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5], outputRange: ['-120deg', '0deg', '120deg'] });
    return { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] };
  };

  const bubbleTranslateY = bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Ionicons name="close" size={28} color={theme.text} onPress={() => router.replace('/')} />
        
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.progress, { color: theme.accent }]}>Card {currentIndex + 1} of {deck.cards.length}</Text>
          <Text style={[styles.comboText, { color: comboCount > 2 ? '#BD00FF' : theme.subText }]}>
            {comboCount > 0 ? `${comboCount}x COMBO 🔥` : ' '}
          </Text>
        </View>

        <View style={[styles.streakBadge, { backgroundColor: theme.dangerBg, borderColor: 'rgba(255, 69, 0, 0.3)' }]}>
          <Ionicons name="flame" size={16} color={theme.danger} />
          <Text style={[styles.streakText, { color: theme.danger }]}>{streak}</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, getCardStyle()]} {...panResponder.panHandlers}>
          <Text style={[styles.label, { color: theme.accent }]}>{showAnswer ? "ANSWER" : "QUESTION"}</Text>
          <ScrollView contentContainerStyle={styles.scrollText} showsVerticalScrollIndicator={false}>
            <Text style={[styles.text, { color: theme.text }]}>{showAnswer ? currentCard.answer : currentCard.question}</Text>
          </ScrollView>
          <View style={styles.footerHints}>
            {!showAnswer ? <Text style={[styles.hint, { color: theme.subText }]}>Tap to reveal</Text> : <Text style={[styles.swipeHint, { color: theme.accent }]}>Swipe Left to Re-learn • Swipe Right if Mastered (+10 XP)</Text>}
          </View>
        </Animated.View>
      </View>

      {feedback && (
        <Animated.View style={[styles.feedbackBubble, { backgroundColor: theme.card, borderColor: feedback.color, opacity: bubbleAnim, transform: [{ translateY: bubbleTranslateY }] }]}>
          <Ionicons name={feedback.color === theme.accent ? 'checkmark-circle' : 'refresh-circle'} size={24} color={feedback.color} />
          <Text style={[styles.feedbackText, { color: feedback.color }]}>{feedback.text}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  progress: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  comboText: { fontSize: 12, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  streakText: { fontWeight: '900', marginLeft: 4, fontSize: 14 },
  cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', borderRadius: 24, padding: 30, height: '80%', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  label: { fontWeight: 'bold', marginBottom: 20, textAlign: 'center', letterSpacing: 3, fontSize: 12 },
  scrollText: { flexGrow: 1, justifyContent: 'center' },
  text: { fontSize: 24, textAlign: 'center', fontWeight: '600', lineHeight: 36 },
  footerHints: { marginTop: 20, height: 40, justifyContent: 'center' },
  hint: { textAlign: 'center', fontSize: 14, fontWeight: '600' },
  swipeHint: { textAlign: 'center', fontSize: 12, fontWeight: 'bold' },
  feedbackBubble: { position: 'absolute', bottom: 80, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 20, zIndex: 1000 },
  feedbackText: { fontSize: 18, fontWeight: '900', letterSpacing: 2, marginLeft: 10 },
});