import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRankTier, getTierColor } from '../lib/ranks';
import { getThemeColors, useStore } from '../lib/store';

export default function SummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRoastMode = useStore(state => state.isRoastMode);
  const accentColor = useStore(state => state.accentColor);
  const isDarkMode = useStore(state => state.isDarkMode);
  const theme = getThemeColors(isDarkMode, accentColor);
  
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
  const bossColor = isRoastMode ? theme.danger : theme.warning;
  const bossTitle = isRoastMode ? 'BARELY SURVIVED...' : 'BOSS DEFEATED!';

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const headline = isBossMode
        ? `I survived the Boss Arena with ${accuracy}% accuracy on SwipeIQ! 💀⚡`
        : `I just scored ${accuracy}% and reached ${endTier} rank on SwipeIQ! 🧠⚡`;
      await Share.share({
        message: `${headline}\n\nStudy smarter with AI flashcards. #SwipeIQ`,
      });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {showSpecialScreen ? (
        <Animated.View style={[styles.specialContainer, { backgroundColor: theme.bg, opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          {isBossMode ? (
            <>
              <Text style={[styles.specialHeader, { color: bossColor, fontSize: 36 }]}>{bossTitle}</Text>
              <Text style={[styles.specialSubtext, { color: theme.subText }]}>Accuracy: {accuracy}%</Text>
            </>
          ) : (
            <>
              <Text style={[styles.specialHeader, { color: theme.accent }]}>RANK UP!</Text>
              <View style={[styles.tierBadge, { borderColor: tierColor }]}><Text style={[styles.tierText, { color: tierColor }]}>{endTier}</Text></View>
              <Text style={[styles.specialSubtext, { color: theme.subText }]}>You evolved from {startTier}.</Text>
            </>
          )}
        </Animated.View>
      ) : (
        <>
          <View style={styles.content}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Session Complete</Text>
            <View style={[styles.statsRing, { borderColor: isBossMode ? bossColor : theme.accent, shadowColor: isBossMode ? bossColor : theme.accent }]}>
              <Text style={[styles.accuracyText, { color: theme.text }]}>{accuracy}%</Text>
              <Text style={[styles.accuracyLabel, { color: theme.subText }]}>Accuracy</Text>
            </View>
            <View style={styles.detailsBox}>
              {!isBossMode && (
                <>
                  <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: theme.subText }]}>Rank:</Text><Text style={[styles.detailValue, { color: tierColor }]}>{endTier}</Text></View>
                  <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: theme.subText }]}>XP Gained:</Text><Text style={[styles.detailValue, { color: theme.warning }]}>+{endXP - startXP}</Text></View>
                </>
              )}
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: theme.subText }]}>Mastered:</Text><Text style={[styles.detailValue, { color: theme.success }]}>{rightSwipes}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: theme.subText }]}>Needs Work:</Text><Text style={[styles.detailValue, { color: theme.danger }]}>{totalCards - rightSwipes}</Text></View>
            </View>
          </View>
          <TouchableOpacity style={[styles.shareButton, { borderColor: theme.border }]} activeOpacity={0.8} onPress={handleShare}>
            <Text style={[styles.shareButtonText, { color: theme.text }]}>📤  Share Result</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.homeButton, { backgroundColor: theme.accent }]} activeOpacity={0.8} onPress={() => router.replace('/')}><Text style={[styles.homeButtonText, { color: theme.invertText }]}>Return to Dashboard</Text></TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090909', justifyContent: 'space-between' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '300', marginBottom: 40, letterSpacing: 1 },
  statsRing: { width: 200, height: 200, borderRadius: 100, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 40, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 10 },
  accuracyText: { color: '#fff', fontSize: 56, fontWeight: '200' },
  accuracyLabel: { color: '#555', fontSize: 14, marginTop: 5, textTransform: 'uppercase', letterSpacing: 2 },
  detailsBox: { width: '100%', padding: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  detailLabel: { color: '#666', fontSize: 16 },
  detailValue: { color: '#fff', fontSize: 16, fontWeight: '600' },
  homeButton: { backgroundColor: '#ffffff', margin: 20, padding: 20, borderRadius: 12, alignItems: 'center' },
  homeButtonText: { color: '#000', fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  shareButton: { marginHorizontal: 20, marginTop: 20, paddingVertical: 18, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  shareButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  specialContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090909', padding: 20 },
  specialHeader: { color: '#fff', fontSize: 42, fontWeight: '900', marginBottom: 40, textAlign: 'center' },
  tierBadge: { padding: 20, borderRadius: 20, borderWidth: 4, marginBottom: 30 },
  tierText: { fontSize: 36, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
  specialSubtext: { color: '#aaa', fontSize: 18 },
});