export const getRankTier = (xp: number): string => {
    if (xp < 100) return 'Iron';
    if (xp < 250) return 'Bronze';
    if (xp < 500) return 'Silver';
    if (xp < 1000) return 'Gold';
    if (xp < 2000) return 'Platinum';
    return 'Diamond';
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