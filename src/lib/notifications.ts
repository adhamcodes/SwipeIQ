import Constants, { ExecutionEnvironment } from 'expo-constants';

// expo-notifications does NOT work inside Expo Go (Expo removed it in SDK 53+).
// Inside Expo Go we record the user's preference in the UI but skip the native
// calls entirely — this avoids the noisy error and any crash. Everything works
// for real in a development build or the published app.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');
let cached: NotificationsModule | null = null;
let handlerSet = false;

// Lazily load expo-notifications ONLY when we're allowed to use it.
// Loading it lazily (instead of at the top of the file) is what keeps Expo Go
// from ever evaluating the module and printing its push-notification error.
async function loadNotifications(): Promise<NotificationsModule | null> {
  if (isExpoGo) return null;
  try {
    if (!cached) {
      cached = await import('expo-notifications');
    }
    if (!handlerSet && cached) {
      cached.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      handlerSet = true;
    }
    return cached;
  } catch (e) {
    console.log('[notifications] unavailable:', e);
    return null;
  }
}

export async function requestPermissions(): Promise<boolean> {
  const N = await loadNotifications();
  if (!N) return false;
  try {
    const { status } = await N.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function cancelAllReminders(): Promise<void> {
  const N = await loadNotifications();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.log('[notifications] cancel failed:', e);
  }
}

export async function scheduleDailyReminder(): Promise<void> {
  const N = await loadNotifications();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
    await N.scheduleNotificationAsync({
      content: {
        title: 'Time to swipe, legend! 🔥',
        body: 'Keep your streak alive — your cards are waiting.',
      },
      trigger: { type: 'daily', hour: 20, minute: 0 } as any,
    });
  } catch (e) {
    console.log('[notifications] schedule failed:', e);
  }
}

// Turn the daily reminder on (asks permission if needed) or off.
// Returns true if reminders are now considered active.
export async function setRemindersEnabled(enabled: boolean): Promise<boolean> {
  // Inside Expo Go we just honor the user's choice in the UI (no native call).
  if (isExpoGo) return enabled;

  if (!enabled) {
    await cancelAllReminders();
    return false;
  }
  const granted = await requestPermissions();
  if (!granted) return false;
  await scheduleDailyReminder();
  return true;
}
