import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

// The emotional range of "Q", the living orb coach.
export type Emotion = 'idle' | 'happy' | 'roast' | 'thinking' | 'celebrate';

interface Props {
  message: string;
  isRoastMode: boolean;
  accent: string;
  danger: string;
  cardColor: string;
  textColor: string;
  subTextColor: string;
  borderColor: string;
  secondary?: string;
  success?: string;
  /** Override the auto-derived emotion (e.g. summary screen can force 'celebrate'). */
  emotion?: Emotion;
  size?: number;
  hapticsEnabled?: boolean;
}

const SPARK_COUNT = 6;

export function CoachMascot({
  message,
  isRoastMode,
  accent,
  danger,
  cardColor,
  textColor,
  subTextColor,
  borderColor,
  secondary = '#7C5CFF',
  success = '#22E0A1',
  emotion,
  size = 64,
  hapticsEnabled = true,
}: Props) {
  // Resting expression depends on the coach's mood.
  const baseEmotion: Emotion = emotion ?? (isRoastMode ? 'roast' : 'happy');
  const [activeEmotion, setActiveEmotion] = useState<Emotion>(baseEmotion);
  useEffect(() => setActiveEmotion(baseEmotion), [baseEmotion]);

  // Animation drivers.
  const bob = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const spark = useRef(new Animated.Value(0)).current;
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The orb's two-tone body — shifts violet/red when roasting, cyan/violet when hyping.
  const bodyColors = useMemo<[string, string]>(() => {
    if (activeEmotion === 'roast') return [secondary, danger];
    if (activeEmotion === 'celebrate') return [accent, success];
    return [accent, secondary];
  }, [activeEmotion, accent, secondary, danger, success]);
  const glow = activeEmotion === 'roast' ? danger : accent;

  // --- Idle: float + breathing glow ---
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [bob, halo]);

  // --- Blink at random, life-like intervals ---
  useEffect(() => {
    let alive = true;
    const doBlink = () => {
      if (!alive) return;
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.1, duration: 70, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 90, useNativeDriver: true }),
      ]).start();
      const next = 1800 + Math.random() * 2600;
      blinkTimer.current = setTimeout(doBlink, next);
    };
    blinkTimer.current = setTimeout(doBlink, 1200);
    return () => {
      alive = false;
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
    };
  }, [blink]);

  // --- Typewriter reveal of the coach line ---
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

  // --- Tap to react: pop, celebrate, emit sparkles ---
  const react = () => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveEmotion('celebrate');
    pop.setValue(0.78);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }).start();
    spark.setValue(0);
    Animated.timing(spark, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    setTimeout(() => setActiveEmotion(baseEmotion), 1100);
  };

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.18] });
  const haloOpacity = halo.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  // Geometry derived from size.
  const eyeW = size * 0.16;
  const eyeH = size * 0.2;
  const eyeY = size * 0.34;
  const eyeGap = size * 0.16;
  const mouthColor = '#0A0A0F';

  // Per-emotion eye look (pupil offset / lid).
  const lookUp = activeEmotion === 'thinking';
  const halfLid = activeEmotion === 'roast';
  const starEyes = activeEmotion === 'celebrate';

  const sparkStyle = (i: number) => {
    const angle = ((Math.PI * 2) / SPARK_COUNT) * i;
    const dist = size * 0.75;
    return {
      transform: [
        { translateX: spark.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * dist] }) },
        { translateY: spark.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * dist] }) },
        { scale: spark.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1, 0.5] }) },
      ],
      opacity: spark.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
    };
  };

  const renderEye = (side: 'left' | 'right') => {
    const left = side === 'left';
    if (starEyes) {
      return (
        <View style={{ position: 'absolute', top: eyeY - eyeH * 0.25, left: left ? size / 2 - eyeGap - eyeW : size / 2 + eyeGap }}>
          <Ionicons name="star" size={eyeW * 1.4} color="#FFFFFF" />
        </View>
      );
    }
    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: eyeY,
          left: left ? size / 2 - eyeGap - eyeW : size / 2 + eyeGap,
          width: eyeW,
          height: eyeH,
          borderRadius: eyeW,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          transform: [{ scaleY: blink }],
        }}
      >
        {/* pupil */}
        <View
          style={{
            position: 'absolute',
            width: eyeW * 0.62,
            height: eyeW * 0.62,
            borderRadius: eyeW,
            backgroundColor: mouthColor,
            top: lookUp ? 1 : eyeH * 0.36,
            left: eyeW * 0.2,
          }}
        />
        {/* half-lid for the roast smirk */}
        {halfLid && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: eyeH * 0.5, backgroundColor: bodyColors[0] }} />
        )}
      </Animated.View>
    );
  };

  const renderMouth = () => {
    const cx = size / 2;
    const my = size * 0.66;
    if (activeEmotion === 'celebrate') {
      return <View style={{ position: 'absolute', top: my - 2, left: cx - size * 0.1, width: size * 0.2, height: size * 0.2, borderRadius: size, backgroundColor: mouthColor }} />;
    }
    if (activeEmotion === 'roast') {
      return <View style={{ position: 'absolute', top: my + 4, left: cx - size * 0.02, width: size * 0.22, height: 3, borderRadius: 2, backgroundColor: mouthColor, transform: [{ rotate: '-10deg' }] }} />;
    }
    if (activeEmotion === 'thinking') {
      return <View style={{ position: 'absolute', top: my, left: cx + size * 0.04, width: size * 0.1, height: size * 0.1, borderRadius: size, backgroundColor: mouthColor }} />;
    }
    // idle / happy -> upward smile (bottom arc of a circle)
    const w = activeEmotion === 'happy' ? size * 0.34 : size * 0.26;
    return (
      <View
        style={{
          position: 'absolute',
          top: my,
          left: cx - w / 2,
          width: w,
          height: w * 0.55,
          borderBottomLeftRadius: w,
          borderBottomRightRadius: w,
          borderWidth: 3,
          borderTopWidth: 0,
          borderColor: mouthColor,
        }}
      />
    );
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={react}
        accessibilityRole="button"
        accessibilityLabel="Q, your coach. Tap to interact."
        style={[styles.mascotWrap, { width: size * 1.5, height: size * 1.5 }]}
      >
        {/* breathing glow */}
        <Animated.View
          style={{
            position: 'absolute',
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: size,
            backgroundColor: glow,
            opacity: haloOpacity,
            transform: [{ translateY }, { scale: haloScale }],
          }}
        />

        {/* the orb */}
        <Animated.View
          style={[
            styles.orb,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              shadowColor: glow,
              transform: [{ translateY }, { scale: pop }],
            },
          ]}
        >
          <LinearGradient colors={bodyColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          {/* glossy highlight */}
          <View style={{ position: 'absolute', top: size * 0.12, left: size * 0.16, width: size * 0.26, height: size * 0.18, borderRadius: size, backgroundColor: 'rgba(255,255,255,0.45)' }} />
          {renderEye('left')}
          {renderEye('right')}
          {renderMouth()}
        </Animated.View>

        {/* signature lightning spark */}
        <Animated.View style={{ position: 'absolute', top: size * 0.05, right: size * 0.18, transform: [{ translateY }] }}>
          <Ionicons name="flash" size={size * 0.3} color="#FFFFFF" />
        </Animated.View>

        {/* tap sparkles */}
        {Array.from({ length: SPARK_COUNT }).map((_, i) => (
          <Animated.Text key={i} style={[styles.spark, { color: glow }, sparkStyle(i)]}>✦</Animated.Text>
        ))}
      </Pressable>

      <View style={[styles.bubble, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.label, { color: glow }]}>COACH</Text>
        <Text style={[styles.message, { color: isRoastMode ? danger : textColor }]}>{shown || ' '}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  mascotWrap: { marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  orb: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
  spark: { position: 'absolute', fontSize: 14, fontWeight: '900' },
  bubble: { flex: 1, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, minHeight: 64, justifyContent: 'center' },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  message: { fontSize: 15, fontWeight: '700', lineHeight: 21 },
});
