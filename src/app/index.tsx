import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, useStore } from '../lib/store';
import { supabase } from '../lib/supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAILY_BOUNTY_TARGET = 20;

export default function DashboardScreen() {
  const router = useRouter();
  
  const { 
    savedDecks, streak, xp, accentColor, 
    isRoastMode, isHapticsEnabled, isAudioEnabled, isDarkMode, 
    setSetting, wipeVault, dailySwipes, getPriorityDeck
  } = useStore();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // --- INTELLIGENCE GATHERING ---
  const priorityDeck = getPriorityDeck();
  const bountyProgress = Math.min(dailySwipes / DAILY_BOUNTY_TARGET, 1);
  const isBountyComplete = dailySwipes >= DAILY_BOUNTY_TARGET;

  // METRICS MATH
  const totalDecks = savedDecks.length;
  const totalCards = savedDecks.reduce((acc, deck) => acc + deck.cards.length, 0);
  const masteredCards = savedDecks.reduce((acc, deck) => acc + deck.cards.filter(c => c.repetition > 0).length, 0);
  const masteryPercent = totalCards === 0 ? 0 : Math.round((masteredCards / totalCards) * 100);

  // RANK & XP MATH
  let rank = "Novice";
  let xpProgress = 0;
  let nextTarget = 100;
  if (xp < 100) { rank = "Novice"; nextTarget = 100; xpProgress = xp / 100; }
  else if (xp < 500) { rank = "Scholar"; nextTarget = 500; xpProgress = (xp - 100) / 400; }
  else if (xp < 1500) { rank = "Adept"; nextTarget = 1500; xpProgress = (xp - 500) / 1000; }
  else { rank = "Master"; nextTarget = xp; xpProgress = 1; }

  // --- COACH TOAST LOGIC ---
  const coachMessage = isRoastMode
    ? (streak > 0 ? `A ${streak} day streak? Cute. My grandma learns faster than that. Get to work.` : `0 days. Pathetic. Are you even trying? Open a deck.`)
    : (streak > 0 ? `You're on a ${streak} day streak! You're a machine! Let's conquer today!` : `Welcome back! Ready to build a new streak? Let's go!`);

  // --- THEME ENGINE ---
  const baseTheme = getThemeColors(isDarkMode, accentColor);
  const theme = {
    ...baseTheme,
    panel: isDarkMode ? '#0A0A0F' : '#FAFAFA',
    panelBorder: isDarkMode ? '#1E1E28' : '#D4D4D8',
    hudBg: isDarkMode ? '#12121A' : '#FFFFFF',
    bossBg: isDarkMode ? '#1A0000' : '#FFF5F5',
  };

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Medium) => {
    if (isHapticsEnabled) Haptics.impactAsync(style);
  };

  const toggleMenu = () => {
    triggerHaptic();
    const willOpen = !isMenuOpen;
    setIsMenuOpen(willOpen);

    Animated.parallel([
      Animated.timing(slideAnim, { toValue: willOpen ? 0 : SCREEN_WIDTH, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: willOpen ? 1 : 0, duration: 350, useNativeDriver: true })
    ]).start();
  };

  const handleWipeVault = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("⚠️ DANGER ZONE", "Are you absolutely sure? This will delete all your decks and reset your XP.", [
        { text: "Cancel", style: "cancel" },
        { text: "WIPE EVERYTHING", style: "destructive", onPress: () => { wipeVault(); triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy); toggleMenu(); }}
    ]);
  };

  const changeTheme = (hex: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setSetting('accentColor', hex);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.rankBadge, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.rankText, { color: theme.text }]}>{rank}</Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: theme.dangerBg, borderColor: theme.danger }]}>
            <Ionicons name="flame" size={14} color={theme.danger} style={{ marginRight: 4 }} />
            <Text style={[styles.streakText, { color: theme.danger }]}>{streak}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.avatarButton, { borderColor: theme.accent, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)' }]} onPress={toggleMenu}>
          <Ionicons name="person" size={20} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mainContent}>
        
        {/* COACH TOAST BRIEFING */}
        <View style={styles.coachSection}>
          <Text style={[styles.coachTitle, { color: theme.subText }]}>COACH TOAST_</Text>
          <Text style={[styles.coachMessage, { color: isRoastMode ? theme.danger : theme.text }]}>
            "{coachMessage}"
          </Text>
        </View>

        {/* DAILY BOUNTY WIDGET */}
        <View style={[styles.bountyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.bountyHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="contract" size={18} color={theme.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.bountyTitle, { color: theme.text }]}>Daily Bounty</Text>
            </View>
            <Text style={[styles.bountyReward, { color: theme.accent }]}>+50 XP</Text>
          </View>
          <Text style={[styles.bountyDesc, { color: theme.subText }]}>Analyze {DAILY_BOUNTY_TARGET} threat signatures (Cards Swiped).</Text>
          
          <View style={styles.bountyProgressContainer}>
            <View style={[styles.bountyTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
              <View style={[styles.bountyFill, { width: `${bountyProgress * 100}%`, backgroundColor: isBountyComplete ? '#32CD32' : theme.accent }]} />
            </View>
            <Text style={[styles.bountyCount, { color: isBountyComplete ? '#32CD32' : theme.text }]}>
              {dailySwipes}/{DAILY_BOUNTY_TARGET}
            </Text>
          </View>
        </View>

        {/* PRIORITY TARGET */}
        <Text style={[styles.sectionLabel, { color: theme.subText, marginTop: 10 }]}>PRIORITY TARGET</Text>
        {priorityDeck ? (
          <TouchableOpacity 
            style={[styles.priorityCard, { backgroundColor: theme.card, borderColor: theme.accent, shadowColor: theme.accent }]}
            onPress={() => { triggerHaptic('light'); router.push({ pathname: '/arena', params: { deckId: priorityDeck.id } }); }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.priorityTitle, { color: theme.text }]} numberOfLines={1}>{priorityDeck.title}</Text>
              <Text style={[styles.prioritySubtitle, { color: theme.subText }]}>
                {priorityDeck.cards.filter(c => c.repetition === 0).length} Unmastered Cards
              </Text>
            </View>
            <View style={[styles.playButton, { backgroundColor: theme.accent }]}>
              <Ionicons name="play" size={20} color={theme.invertText} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.priorityCard, { backgroundColor: theme.card, borderColor: theme.border, borderStyle: 'dashed' }]}
            onPress={() => { triggerHaptic('light'); router.push('/generator'); }}
          >
            <Ionicons name="folder-open-outline" size={32} color={theme.subText} style={{ marginRight: 16 }} />
            <View>
              <Text style={[styles.priorityTitle, { color: theme.subText }]}>Vault is Empty</Text>
              <Text style={[styles.prioritySubtitle, { color: theme.subText }]}>Tap to generate your first deck.</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* COMMAND PROTOCOLS (ACTION GRID) */}
        <Text style={[styles.sectionLabel, { color: theme.subText, marginTop: 24 }]}>COMMAND PROTOCOLS</Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionSquare, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/generator')}>
            <Ionicons name="flash" size={28} color={theme.accent} style={{ marginBottom: 12 }} />
            <Text style={[styles.actionTitle, { color: theme.text }]}>Generator</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionSquare, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/library')}>
            <Ionicons name="library" size={28} color={theme.accent} style={{ marginBottom: 12 }} />
            <Text style={[styles.actionTitle, { color: theme.text }]}>Library</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.bossButton, { backgroundColor: theme.bossBg, borderColor: theme.danger }]} onPress={() => router.push('/boss-arena')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="skull" size={24} color={theme.danger} style={{ marginRight: 12 }} />
            <Text style={[styles.bossTitle, { color: theme.danger }]}>BOSS ARENA</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.danger} />
        </TouchableOpacity>

      </ScrollView>

      {/* COMMAND CENTER OVERLAY & SIDEBAR */}
      <Animated.View pointerEvents={isMenuOpen ? 'auto' : 'none'} style={[styles.overlayBackground, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={toggleMenu} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.slidingPanel, { backgroundColor: theme.panel, borderColor: theme.panelBorder, transform: [{ translateX: slideAnim }], shadowColor: theme.accent }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
            
            <View style={styles.panelHeader}>
              <Text style={[styles.panelTitle, { color: theme.subText }]}>SYS_COMMAND_v1.7</Text>
              <TouchableOpacity onPress={toggleMenu} style={[styles.closeButton, { borderColor: theme.accent, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)' }]}>
                <Ionicons name="close" size={24} color={theme.accent} />
              </TouchableOpacity>
            </View>

            <LinearGradient colors={[`${theme.accent}15`, 'rgba(0,0,0,0)']} style={[styles.idCard, { borderColor: theme.accent }]}>
              <View style={styles.idCardHeader}>
                <Ionicons name="scan" size={20} color={theme.accent} />
                <Text style={[styles.idCardTag, { color: theme.accent }]}>ACTIVE_USER</Text>
              </View>
              <View style={styles.profileSection}>
                <View style={[styles.largeAvatar, { borderColor: theme.accent, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)' }]}>
                  <Ionicons name="person" size={36} color={theme.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.profileName, { color: theme.text }]}>{rank}</Text>
                  <Text style={[styles.profileRank, { color: theme.accent }]}>{xp} XP / {nextTarget} XP</Text>
                  <View style={styles.xpTrack}>
                    <View style={[styles.xpFill, { width: `${xpProgress * 100}%`, backgroundColor: theme.accent }]} />
                  </View>
                </View>
              </View>
            </LinearGradient>

            <Text style={[styles.panelSectionTitle, { color: theme.subText }]}>LIFETIME METRICS</Text>
            <View style={styles.hudGrid}>
              <View style={[styles.hudBox, { backgroundColor: theme.hudBg, borderColor: theme.panelBorder, borderLeftColor: theme.accent }]}>
                <Text style={[styles.hudLabel, { color: theme.subText }]}>DECKS_</Text>
                <Text style={[styles.hudValue, { color: theme.text }]}>{totalDecks}</Text>
              </View>
              <View style={[styles.hudBox, { backgroundColor: theme.hudBg, borderColor: theme.panelBorder, borderLeftColor: theme.accent }]}>
                <Text style={[styles.hudLabel, { color: theme.subText }]}>CARDS_</Text>
                <Text style={[styles.hudValue, { color: theme.text }]}>{totalCards}</Text>
              </View>
              <View style={[styles.hudBox, { backgroundColor: theme.hudBg, borderColor: theme.panelBorder, borderLeftColor: theme.accent }]}>
                <Text style={[styles.hudLabel, { color: theme.subText }]}>SWIPED_</Text>
                <Text style={[styles.hudValue, { color: theme.text }]}>{masteredCards}</Text>
              </View>
              <View style={[styles.hudBox, { backgroundColor: theme.hudBg, borderColor: theme.panelBorder, borderLeftColor: theme.accent }]}>
                <Text style={[styles.hudLabel, { color: theme.accent }]}>MASTERY_</Text>
                <Text style={[styles.hudValue, { color: theme.accent }]}>{masteryPercent}%</Text>
              </View>
            </View>

            <Text style={[styles.panelSectionTitle, { color: theme.subText }]}>SYSTEM CONFIG</Text>
            <View style={[styles.settingsBlock, { backgroundColor: theme.hudBg, borderColor: theme.panelBorder }]}>
              <View style={styles.settingRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="color-palette" size={20} color={theme.accent} style={{ marginRight: 15 }} />
                  <View>
                    <Text style={[styles.settingTitle, { color: theme.text }]}>Core Theme</Text>
                    <Text style={[styles.settingDesc, { color: theme.subText }]}>UI Accent Color</Text>
                  </View>
                </View>
                <View style={styles.themeSelector}>
                  <TouchableOpacity onPress={() => changeTheme('#00E5FF')} style={[styles.themeDot, { backgroundColor: '#00E5FF', borderWidth: accentColor === '#00E5FF' ? 2 : 0, borderColor: theme.bg }]} />
                  <TouchableOpacity onPress={() => changeTheme('#32CD32')} style={[styles.themeDot, { backgroundColor: '#32CD32', borderWidth: accentColor === '#32CD32' ? 2 : 0, borderColor: theme.bg }]} />
                  <TouchableOpacity onPress={() => changeTheme('#FF0055')} style={[styles.themeDot, { backgroundColor: '#FF0055', borderWidth: accentColor === '#FF0055' ? 2 : 0, borderColor: theme.bg }]} />
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.panelBorder }]} />

              <View style={styles.settingRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={isDarkMode ? theme.accent : "#FFD700"} style={{ marginRight: 15 }} />
                  <View><Text style={[styles.settingTitle, { color: theme.text }]}>UI Interface</Text><Text style={[styles.settingDesc, { color: theme.subText }]}>{isDarkMode ? "Dark Matter" : "Light Flare"}</Text></View>
                </View>
                <Switch value={isDarkMode} onValueChange={(val) => { triggerHaptic(); setSetting('isDarkMode', val); }} trackColor={{ false: '#D4D4D8', true: 'rgba(128,128,128,0.3)' }} thumbColor={isDarkMode ? theme.accent : '#888'} />
              </View>
              <View style={[styles.divider, { backgroundColor: theme.panelBorder }]} />

              <View style={styles.settingRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="flame" size={20} color={theme.danger} style={{ marginRight: 15 }} />
                  <View><Text style={[styles.settingTitle, { color: theme.text }]}>AI Roast Mode</Text><Text style={[styles.settingDesc, { color: theme.subText }]}>Brutal honesty active</Text></View>
                </View>
                <Switch value={isRoastMode} onValueChange={(val) => { triggerHaptic(); setSetting('isRoastMode', val); }} trackColor={{ false: '#D4D4D8', true: theme.dangerBg }} thumbColor={isRoastMode ? theme.danger : '#888'} />
              </View>
              <View style={[styles.divider, { backgroundColor: theme.panelBorder }]} />

              <View style={styles.settingRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="hardware-chip" size={20} color="#BD00FF" style={{ marginRight: 15 }} />
                  <View><Text style={[styles.settingTitle, { color: theme.text }]}>Haptic Engine</Text><Text style={[styles.settingDesc, { color: theme.subText }]}>Physical feedback</Text></View>
                </View>
                <Switch value={isHapticsEnabled} onValueChange={(val) => { setSetting('isHapticsEnabled', val); triggerHaptic(); }} trackColor={{ false: '#D4D4D8', true: 'rgba(189, 0, 255, 0.3)' }} thumbColor={isHapticsEnabled ? '#BD00FF' : '#888'} />
              </View>
              <View style={[styles.divider, { backgroundColor: theme.panelBorder }]} />

              <View style={styles.settingRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={isAudioEnabled ? "volume-high" : "volume-mute"} size={20} color={isAudioEnabled ? theme.accent : "#888"} style={{ marginRight: 15 }} />
                  <View><Text style={[styles.settingTitle, { color: theme.text }]}>Audio Interface</Text><Text style={[styles.settingDesc, { color: theme.subText }]}>System sound effects</Text></View>
                </View>
                <Switch value={isAudioEnabled} onValueChange={(val) => { setSetting('isAudioEnabled', val); triggerHaptic(); }} trackColor={{ false: '#D4D4D8', true: 'rgba(128,128,128,0.3)' }} thumbColor={isAudioEnabled ? theme.accent : '#888'} />
              </View>
            </View>

            <Text style={[styles.panelSectionTitle, { color: theme.danger, marginTop: 10 }]}>DANGER ZONE</Text>
            <TouchableOpacity style={[styles.dangerButton, { backgroundColor: theme.dangerBg, borderColor: theme.danger }]} onPress={handleWipeVault}>
              <Ionicons name="warning-outline" size={20} color={theme.danger} style={{ marginRight: 10 }} />
              <Text style={[styles.dangerText, { color: theme.danger }]}>[ WIPE VAULT MEMORY ]</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signOutButton} onPress={() => supabase.auth.signOut()}>
              <Ionicons name="log-out-outline" size={20} color={theme.subText} style={{ marginRight: 10 }} />
              <Text style={[styles.signOutText, { color: theme.subText }]}>Secure Disconnect</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 40 },
  rankBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 10 },
  rankText: { fontSize: 14, fontWeight: 'bold' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  streakText: { fontSize: 14, fontWeight: 'bold' },
  avatarButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  
  mainContent: { padding: 24, paddingBottom: 60 },
  
  coachSection: { marginBottom: 30 },
  coachTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  coachMessage: { fontSize: 22, fontWeight: 'bold', lineHeight: 32 },

  bountyCard: { borderRadius: 16, padding: 20, borderWidth: 1, marginBottom: 30, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  bountyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bountyTitle: { fontSize: 16, fontWeight: 'bold' },
  bountyReward: { fontSize: 14, fontWeight: '900' },
  bountyDesc: { fontSize: 13, marginBottom: 16 },
  bountyProgressContainer: { flexDirection: 'row', alignItems: 'center' },
  bountyTrack: { flex: 1, height: 8, borderRadius: 4, marginRight: 12, overflow: 'hidden' },
  bountyFill: { height: '100%', borderRadius: 4 },
  bountyCount: { fontSize: 12, fontWeight: 'bold', width: 40, textAlign: 'right' },

  sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  
  priorityCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 30, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  priorityTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  prioritySubtitle: { fontSize: 13 },
  playButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 16 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  actionSquare: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginHorizontal: 6 },
  actionTitle: { fontSize: 14, fontWeight: 'bold' },

  bossButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16, borderWidth: 1, marginHorizontal: 6 },
  bossTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // SIDEBAR STYLES
  overlayBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10 },
  slidingPanel: { position: 'absolute', top: 0, bottom: 0, right: 0, width: SCREEN_WIDTH * 0.85, zIndex: 20, borderLeftWidth: 1, shadowOffset: { width: -10, height: 0 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 20 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 20 },
  panelTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 4 },
  closeButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  idCard: { borderRadius: 12, padding: 20, borderWidth: 1, marginBottom: 30 },
  idCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  idCardTag: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginLeft: 8 },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  largeAvatar: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 16 },
  profileName: { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  profileRank: { fontSize: 12, fontWeight: 'bold', marginTop: 4, letterSpacing: 1, marginBottom: 8 },
  xpTrack: { height: 4, backgroundColor: 'rgba(128,128,128,0.2)', borderRadius: 2, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 2 },
  panelSectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 16 },
  hudGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  hudBox: { width: '48%', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderLeftWidth: 3 },
  hudLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  hudValue: { fontSize: 24, fontWeight: '900', fontFamily: 'monospace' },
  settingsBlock: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 30 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  settingTitle: { fontSize: 14, fontWeight: 'bold' },
  settingDesc: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginVertical: 12 },
  themeSelector: { flexDirection: 'row' },
  themeDot: { width: 20, height: 20, borderRadius: 10, marginLeft: 12 },
  dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  dangerText: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  signOutText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }
});