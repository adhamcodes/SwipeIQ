// =============================================================================
// Cloud Sync — offline-first backup of the local store to Supabase.
// =============================================================================
// HOW IT WORKS (in plain terms):
//   - The app works instantly off the on-device store (fast, offline).
//   - When signed in, we PULL the user's backup once on launch.
//   - After any change, we PUSH the whole state up (debounced, so we don't spam).
//   - On sign-out we stop syncing and wipe the device copy (privacy).
//
// NEWEST-WINS SAFETY:
//   We remember the time of the last LOCAL change and the time of the last
//   change we know about in the CLOUD. On launch, if the device has edits that
//   are newer than the cloud backup (e.g. studied offline, app closed before it
//   could sync), we push those up INSTEAD of overwriting them with older cloud
//   data. This prevents losing offline work.
//
// All network calls are wrapped in try/catch and NEVER throw, so a flaky
// connection can slow the backup but can never crash the app.
// =============================================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SyncableState, useStore } from "./store";
import { supabase } from "./supabase";

const TABLE = "user_state";
const PUSH_DEBOUNCE_MS = 1500;

// Persisted markers (survive app restarts) used to decide who is newer.
const LOCAL_TS_KEY = "cloudsync.localChangedAt";
const SYNCED_TS_KEY = "cloudsync.lastSyncedAt";

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribe: (() => void) | null = null;
// While we apply a freshly pulled cloud state, ignore the change event it
// triggers so we don't immediately push the same data back up.
let isApplyingCloud = false;

async function readTs(key: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeTs(key: string, value: number): void {
  AsyncStorage.setItem(key, String(value)).catch(() => {});
}

// Pick only the data we want to back up (no functions, no transient UI state).
function getSyncableState(): SyncableState {
  const s = useStore.getState();
  return {
    savedDecks: s.savedDecks,
    streak: s.streak,
    lastStudyDate: s.lastStudyDate,
    xp: s.xp,
    accentColor: s.accentColor,
    isRoastMode: s.isRoastMode,
    isHapticsEnabled: s.isHapticsEnabled,
    isAudioEnabled: s.isAudioEnabled,
    isDarkMode: s.isDarkMode,
    isRemindersEnabled: s.isRemindersEnabled,
    dailySwipes: s.dailySwipes,
    lastSwipeDate: s.lastSwipeDate,
    bountyClaimedDate: s.bountyClaimedDate,
  };
}

export async function pushStateToCloud(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const nowIso = new Date().toISOString();
    const { error } = await supabase.from(TABLE).upsert(
      {
        user_id: user.id,
        state: getSyncableState(),
        updated_at: nowIso,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.log("[CloudSync] push failed:", error.message);
      return;
    }
    // Local and cloud are now in agreement up to this moment.
    writeTs(SYNCED_TS_KEY, Date.parse(nowIso));
  } catch (e) {
    console.log("[CloudSync] push error:", e);
  }
}

function schedulePush(): void {
  if (isApplyingCloud) return;
  // Mark that the device has a change newer than anything synced.
  writeTs(LOCAL_TS_KEY, Date.now());
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    pushStateToCloud();
  }, PUSH_DEBOUNCE_MS);
}

export async function pullStateFromCloud(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from(TABLE)
      .select("state, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.log("[CloudSync] pull failed:", error.message);
      return;
    }

    if (data?.state) {
      const cloudTs = data.updated_at ? Date.parse(data.updated_at) : 0;
      const localChangedAt = await readTs(LOCAL_TS_KEY);
      const lastSyncedAt = await readTs(SYNCED_TS_KEY);

      // The device has unsynced edits newer than the cloud backup
      // (e.g. studied offline, app closed before it could sync).
      const localIsNewer = localChangedAt > Math.max(cloudTs, lastSyncedAt);

      if (localIsNewer) {
        // Keep the device's work and back it up instead of overwriting it.
        await pushStateToCloud();
        return;
      }

      // Cloud is the source of truth -> load it into the app.
      isApplyingCloud = true;
      try {
        useStore.getState().applyCloudState(data.state as Partial<SyncableState>);
      } finally {
        isApplyingCloud = false;
      }
      // Device now matches the cloud as of cloudTs.
      writeTs(SYNCED_TS_KEY, cloudTs);
      writeTs(LOCAL_TS_KEY, cloudTs);
    } else {
      // First time on this account -> create the initial backup.
      await pushStateToCloud();
    }
  } catch (e) {
    console.log("[CloudSync] pull error:", e);
  }
}

// Start listening for local changes and backing them up.
export function startSync(): void {
  if (unsubscribe) return;
  unsubscribe = useStore.subscribe(() => schedulePush());
}

// Stop syncing (called on sign-out).
export function stopSync(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
}
