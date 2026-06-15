import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRankTier, getTierColor } from '../lib/ranks';
import { useStore } from '../lib/store';

export default function SummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRoastMode = useStore(state => state.isRoastMode);
  
  const totalCards = Number(params.total) || 0;
  const rightSwipes = Number(params.right) || 0;
  const startXP = Number(params.startXP) || 0;
  const endXP = Number(params.endXP) || 0;
  const isBossMode = params.mode === 'boss';
  
  const accuracy = totalCards > 0 ? Math.round((rightSwipes / totalCards) * 100) : 0;
  const startTier = getRankTier(startXP);
  const endTier = getRankTier(endXP);
  const isLevelUp = !isBossMode && startTier !== endTier;

  const [showSpecialScreen, setShowSpecialScreen] = useState(isLevelUp || isBossMode);
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showSpecialScreen) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
      setTimeout(() => {
        Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setShowSpecialScreen(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        });
      }, 3500);
    } else { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
  }, []);

  const tierColor = getTierColor(endTier);
  const bossColor = isRoastMode ? '#ef4444' : '#f59e0b';
  const bossTitle = isRoastMode ? 'BARELY SURVIVED...' : 'BOSS DEFEATED!';

  return (
    <SafeAreaView style={styles.container}>
      {showSpecialScreen ? (
        <Animated.View style={[styles.specialContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          {isBossMode ? (
            <>
              <Text style={[styles.specialHeader, { color: bossColor, fontSize: 36 }]}>{bossTitle}</Text>
              <Text style={styles.specialSubtext}>Accuracy: {accuracy}%</Text>
            </>
          ) : (
            <>
              <Text style={styles.specialHeader}>RANK UP!</Text>
              <View style={[styles.tierBadge, { borderColor: tierColor }]}><Text style={[styles.tierText, { color: tierColor }]}>{endTier}</Text></View>
              <Text style={styles.specialSubtext}>You evolved from {startTier}.</Text>
            </>
          )}
        </Animated.View>
      ) : (
        <>
          <View style={styles.content}>
            <Text style={styles.headerTitle}>Session Complete</Text>
            <View style={[styles.statsRing, { borderColor: isBossMode ? bossColor : '#1a1a1a' }]}>
              <Text style={styles.accuracyText}>{accuracy}%</Text>
              <Text style={styles.accuracyLabel}>Accuracy</Text>
            </View>
            <View style={styles.detailsBox}>
              {!isBossMode && (
                <>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Rank:</Text><Text style={[styles.detailValue, { color: tierColor }]}>{endTier}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>XP Gained:</Text><Text style={[styles.detailValue, { color: '#f59e0b' }]}>+{endXP - startXP}</Text></View>
                </>
              )}
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Mastered:</Text><Text style={[styles.detailValue, { color: '#4ade80' }]}>{rightSwipes}</Text></View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Needs Work:</Text><Text style={[styles.detailValue, { color: '#ef4444' }]}>{totalCards - rightSwipes}</Text></View>
            </View>
          </View>
          <TouchableOpacity style={styles.homeButton} activeOpacity={0.8} onPress={() => router.replace('/')}><Text style={styles.homeButtonText}>Return to Dashboard</Text></TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090909', justifyContent: 'space-between' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '300', marginBottom: 40, letterSpacing: 1 },
  statsRing: { width: 200, height: 200, borderRadius: 100, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  accuracyText: { color: '#fff', fontSize: 56, fontWeight: '200' },
  accuracyLabel: { color: '#555', fontSize: 14, marginTop: 5, textTransform: 'uppercase', letterSpacing: 2 },
  detailsBox: { width: '100%', padding: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  detailLabel: { color: '#666', fontSize: 16 },
  detailValue: { color: '#fff', fontSize: 16, fontWeight: '600' },
  homeButton: { backgroundColor: '#ffffff', margin: 20, padding: 20, borderRadius: 12, alignItems: 'center' },
  homeButtonText: { color: '#000', fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  specialContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090909', padding: 20 },
  specialHeader: { color: '#fff', fontSize: 42, fontWeight: '900', marginBottom: 40, textAlign: 'center' },
  tierBadge: { padding: 20, borderRadius: 20, borderWidth: 4, marginBottom: 30 },
  tierText: { fontSize: 36, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
  specialSubtext: { color: '#aaa', fontSize: 18 },
});