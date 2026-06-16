import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const ACCENT = '#00E5FF';

export function BrandLogo({ showWordmark = true, tagline }: { showWordmark?: boolean; tagline?: string }) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [glow]);

  const scale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const opacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <View style={styles.wrap}>
      <View style={styles.orbWrap}>
        <Animated.View style={[styles.orbGlow, { opacity, transform: [{ scale }] }]} />
        <LinearGradient colors={['#00E5FF', '#7C5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
          <Ionicons name="flash" size={36} color="#FFFFFF" />
        </LinearGradient>
      </View>
      {showWordmark && <Text style={styles.title}>SWIPEIQ</Text>}
      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  orbWrap: { width: 96, height: 96, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  orbGlow: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: ACCENT },
  orb: {
    width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 20, elevation: 12,
  },
  title: { color: '#FFF', fontSize: 38, fontWeight: '900', letterSpacing: 6 },
  tagline: { color: ACCENT, fontSize: 12, marginTop: 8, letterSpacing: 3, fontWeight: '700' },
});
