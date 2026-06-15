import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BrandLogo } from '../components/brand-logo';
import { useStore } from '../lib/store';

const ACCENT = '#00E5FF';

const SLIDES = [
  {
    type: 'brand' as const,
    title: 'Welcome to SwipeIQ',
    subtitle: 'Learn anything by swiping. Smarter studying, powered by AI.',
  },
  {
    type: 'icon' as const,
    icon: 'flash' as const,
    title: 'AI-Generated Decks',
    subtitle: 'Type any topic and get 20 sharp flashcards in seconds — or build your own.',
  },
  {
    type: 'icon' as const,
    icon: 'flame' as const,
    title: 'Swipe. Streak. Conquer.',
    subtitle: 'Master cards with smart review, keep your daily streak alive, and survive the Boss Arena.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      completeOnboarding();
      router.replace('/login');
    } else {
      setIndex((i) => i + 1);
    }
  };

  const skip = () => {
    Haptics.selectionAsync();
    completeOnboarding();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {slide.type === 'brand' ? (
          <BrandLogo tagline="SWIPE • LEARN • LEVEL UP" />
        ) : (
          <View style={styles.iconCircle}>
            <Ionicons name={slide.icon} size={56} color={ACCENT} />
          </View>
        )}
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === index ? ACCENT : '#333', width: i === index ? 22 : 8 }]} />
          ))}
        </View>

        <TouchableOpacity onPress={next} activeOpacity={0.85} style={styles.btnShadow}>
          <LinearGradient colors={['#00E5FF', '#0066FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <Text style={styles.btnText}>{isLast ? 'GET STARTED' : 'NEXT'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 30 },
  skip: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 4 },
  skipText: { color: '#888', fontSize: 14, fontWeight: '700' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: {
    width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: ACCENT, backgroundColor: '#13131C', marginBottom: 24,
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 10,
  },
  title: { color: '#FFF', fontSize: 26, fontWeight: '900', textAlign: 'center', marginTop: 28, letterSpacing: 0.5 },
  subtitle: { color: '#9A9AA5', fontSize: 15, fontWeight: '500', textAlign: 'center', marginTop: 14, lineHeight: 22, paddingHorizontal: 10 },
  footer: { paddingBottom: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 26 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  btnShadow: { shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 10 },
  btn: { height: 58, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#00121A', fontSize: 15, fontWeight: '900', letterSpacing: 2 },
});
