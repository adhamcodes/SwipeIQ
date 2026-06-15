export const getRankTier = (xp: number): string => {
    if (xp < 100) return 'Iron';
    if (xp < 250) return 'Bronze';
    if (xp < 500) return 'Silver';
    if (xp < 1000) return 'Gold';
    if (xp < 2000) return 'Platinum';
    return 'Diamond';
  };

  // Tier thresholds, used to show progress toward the next rank.
  const TIERS = [
    { name: 'Iron', min: 0 },
    { name: 'Bronze', min: 100 },
    { name: 'Silver', min: 250 },
    { name: 'Gold', min: 500 },
    { name: 'Platinum', min: 1000 },
    { name: 'Diamond', min: 2000 },
  ];

  // Returns the current tier name, the XP needed for the next tier,
  // and a 0..1 progress value toward it.
  export const getRankProgress = (xp: number): { tier: string; nextTarget: number; progress: number; isMax: boolean } => {
    let idx = 0;
    for (let i = 0; i < TIERS.length; i++) {
      if (xp >= TIERS[i].min) idx = i;
    }
    const current = TIERS[idx];
    const next = TIERS[idx + 1];
    if (!next) {
      return { tier: current.name, nextTarget: current.min, progress: 1, isMax: true };
    }
    const span = next.min - current.min;
    const progress = span > 0 ? (xp - current.min) / span : 1;
    return { tier: current.name, nextTarget: next.min, progress: Math.max(0, Math.min(1, progress)), isMax: false };
  };
  
  export const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'Iron': return '#a1a1aa'; // Zinc
      case 'Bronze': return '#b45309'; // Amber/Brown
      case 'Silver': return '#e2e8f0'; // Slate
      case 'Gold': return '#fbbf24'; // Yellow
      case 'Platinum': return '#2dd4bf'; // Teal
      case 'Diamond': return '#c084fc'; // Purple
      default: return '#6366f1';
    }
  };