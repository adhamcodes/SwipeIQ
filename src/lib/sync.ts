import { useStore } from './store';
import { supabase } from './supabase';

export const SyncEngine = {
  /**
   * Pushes the local Zustand vault state up to Supabase cloud
   */
  async pushLocalToCloud() {
    const store = useStore.getState();
    
    // 1. Check if there are even changes to sync
    if (!store.pendingSync) return;

    // 2. Ensure user is actually logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('[SyncEngine] Sync skipped: No authenticated user session.');
      return;
    }

    console.log('[SyncEngine] Changes detected. Syncing to cloud...');

    // 3. Upsert entire payload to Supabase
    const { error } = await supabase
      .from('user_sync')
      .upsert({
        user_id: user.id,
        saved_decks: store.savedDecks,
        persona_mode: store.personaMode,
        last_boss_fight_completed_date: store.lastBossFightCompletedDate,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('[SyncEngine] Cloud sync failed:', error.message);
    } else {
      console.log('[SyncEngine] Cloud sync successful! Vault is fully backed up.');
      store.clearSyncFlag(); // Flips pendingSync back to false
    }
  },

  /**
   * Pulls the latest cloud backup from Supabase down into Zustand
   */
  async pullCloudToLocal() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return;

    console.log('[SyncEngine] Fetching remote cloud backup...');

    const { data, error } = await supabase
      .from('user_sync')
      .select('saved_decks, persona_mode, last_boss_fight_completed_date')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no row found (new user), which is fine
      console.error('[SyncEngine] Failed to pull cloud data:', error.message);
      return;
    }

    if (data) {
      const store = useStore.getState();
      
      // Overwrite the local Zustand vault with the cloud-of-truth data
      store.setSavedDecks(data.saved_decks);
      store.setPersonaMode(data.persona_mode as 'HYPE' | 'ROAST');
      store.setLastBossFightCompletedDate(data.last_boss_fight_completed_date);
      store.clearSyncFlag();
      
      console.log('[SyncEngine] Local vault updated seamlessly from cloud.');
    }
  }
};