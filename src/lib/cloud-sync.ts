// =============================================================================
// Cloud Sync — offline-first backup of the local store to Supabase.
// =============================================================================
// HOW IT WORKS (in plain terms):
//   - The app keeps working instantly off the on-device store (fast, offline).
//   - When signed in, we PULL the user's backup once (or create it the first time).
//   - After any change, we PUSH the whole state up (debounced, so we don't spam).
//   - On sign-out we stop syncing and wipe the device copy (privacy).
//
// All network calls are wrapped in try/catch and NEVER throw, so a flaky
// connection can slow the backup but can never crash the app.
// =============================================================================

import { SyncableState, useStore } from "./store";
import { supabase } from "./supabase";

const TABLE = "user_state";
const PUSH_DEBOUNCE_MS = 1500;

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribe: (() => void) | null = null;
// While we are applying a freshly pulled cloud state, ignore the change event
// it triggers so we don't immediately push the same data back up.
let isApplyingCloud = false;

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

    const { error } = await supabase.from(TABLE).upsert(
      {
        user_id: user.id,
        state: getSyncableState(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) console.log("[CloudSync] push failed:", error.message);
  } catch (e) {
    console.log("[CloudSync] push error:", e);
  }
}

function schedulePush(): void {
  if (isApplyingCloud) return;
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
      .select("state")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.log("[CloudSync] pull failed:", error.message);
      return;
    }

    if (data?.state) {
      // A backup exists -> load it into the app.
      isApplyingCloud = true;
      try {
        useStore.getState().applyCloudState(data.state as Partial<SyncableState>);
      } finally {
        isApplyingCloud = false;
      }
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
