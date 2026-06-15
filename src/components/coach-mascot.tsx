import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface Props {
  message: string;
  isRoastMode: boolean;
  accent: string;
  danger: string;
  cardColor: string;
  textColor: string;
  subTextColor: string;
  borderColor: string;
}

const HYPE_FACES = ['🤩', '😎', '🔥', '💪', '🚀'];
const ROAST_FACES = ['😈', '💀', '🙄', '😏', '🤨'];

export function CoachMascot({ message, isRoastMode, accent, danger, cardColor, textColor, subTextColor, borderColor }: Props) {
  const bob = useRef(new Animated.Value(0)).current;

  // Pick a face that changes when the mode or the message changes.
  const face = useMemo(() => {
    const faces = isRoastMode ? ROAST_FACES : HYPE_FACES;
    return faces[Math.floor(Math.random() * faces.length)];
  }, [isRoastMode, message]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [bob]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const glow = isRoastMode ? danger : accent;

  return (
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.mascot,
          { borderColor: glow, backgroundColor: cardColor, shadowColor: glow, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.face}>{face}</Text>
      </Animated.View>

      <View style={[styles.bubble, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.label, { color: glow }]}>COACH TOAST</Text>
        <Text style={[styles.message, { color: isRoastMode ? danger : textColor }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  mascot: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 2, justifyContent: 'center', alignItems: 'center',
    marginRight: 14, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 14, elevation: 8,
  },
  face: { fontSize: 30 },
  bubble: { flex: 1, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  message: { fontSize: 15, fontWeight: '700', lineHeight: 21 },
});
