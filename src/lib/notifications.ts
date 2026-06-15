import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // 👈 Required by TS
    shouldShowList: true,   // 👈 Required by TS
  }),
});

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Turn the daily reminder on (asks permission if needed) or off.
// Returns true if reminders are now active.
export async function setRemindersEnabled(enabled: boolean): Promise<boolean> {
  if (!enabled) {
    await cancelAllReminders();
    return false;
  }
  const granted = await requestPermissions();
  if (!granted) return false;
  await scheduleDailyReminder();
  return true;
}

export async function scheduleDailyReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to swipe, legend! 🔥",
      body: "Keep your streak alive. The Boss Fight is waiting.",
    },
    trigger: {
      type: 'daily',
      hour: 20,
      minute: 0,
    } as any,
  });
}

export async function scheduleBossFightNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚔️ BOSS FIGHT IS LIVE",
      body: "Your weekly challenge is ready. Defend your rank!",
    },
    trigger: {
      type: 'weekly',
      weekday: 2,
      hour: 9,
      minute: 0,
    } as any,
  });
}