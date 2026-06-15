import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  message: string;
  isRoastMode: boolean;
  accent: string;
  danger: string;
  cardColor: string;
  textColor: string;
  subTextColor: string;
  borderColor: string;
  hapticsEnabled?: boolean;
}

const HYPE_FACES = ['🤩', '😎', '🔥', '💪', '🚀', '⚡'];
const ROAST_FACES = ['😈', '💀', '🙄', '😏', '🤨', '👀'];

export function CoachMascot({ message, isRoastMode, accent, danger, cardColor, textColor, subTextColor, borderColor, hapticsEnabled = true }: Props) {
  const bob = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const sparkle = useRef(new Animated.Value(0)).current;

  const faces = isRoastMode ? ROAST_FACES : HYPE_FACES;
  const [faceIdx, setFaceIdx] = useState(() => Math.floor(Math.random() * faces.length));

  // New random face whenever the mode or message changes.
  useEffect(() => {
    setFaceIdx(Math.floor(Math.random() * faces.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoastMode, message]);

  // Typewriter reveal of the coach line.
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    if (!message) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(message.slice(0, i));
      if (i >= message.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [message]);

  // Idle bob + gentle wiggle.
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [bob, wiggle]);

  // Tap the mascot -> it reacts: pops, changes face, emits sparkles.
  const react = () => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFaceIdx((prev) => (prev + 1) % faces.length);
    pop.setValue(0.7);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
    sparkle.setValue(0);
    Animated.timing(sparkle, { toValue: 1, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const rotate = wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-6deg', '6deg'] });
  const glow = isRoastMode ? danger : accent;

  const sparkStyle = (i: number) => {
    const angle = (Math.PI / 2) * i + Math.PI / 4;
    return {
      transform: [
        { translateX: sparkle.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * 36] }) },
        { translateY: sparkle.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * 36] }) },
        { scale: sparkle.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1, 0.6] }) },
      ],
      opacity: sparkle.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
    };
  };

  return (
    <View style={styles.row}>
      <Pressable onPress={react} style={styles.mascotWrap}>
        <Animated.View
          style={[
            styles.mascot,
            { borderColor: glow, backgroundColor: cardColor, shadowColor: glow, transform: [{ translateY }, { rotate }, { scale: pop }] },
          ]}
        >
          <Text style={styles.face}>{faces[faceIdx]}</Text>
        </Animated.View>
        {[0, 1, 2, 3].map((i) => (
          <Animated.Text key={i} style={[styles.spark, { color: glow }, sparkStyle(i)]}>✦</Animated.Text>
        ))}
      </Pressable>

      <View style={[styles.bubble, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.label, { color: glow }]}>COACH TOAST</Text>
        <Text style={[styles.message, { color: isRoastMode ? danger : textColor }]}>{shown || ' '}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  mascotWrap: { width: 60, height: 60, marginRight: 14, justifyContent: 'center', alignItems: 'center' },
  mascot: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 2, justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 14, elevation: 8,
  },
  face: { fontSize: 30 },
  spark: { position: 'absolute', top: 22, left: 22, fontSize: 16, fontWeight: '900' },
  bubble: { flex: 1, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, minHeight: 64, justifyContent: 'center' },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  message: { fontSize: 15, fontWeight: '700', lineHeight: 21 },
});
