export const LEVELS = [
  { level: 1, xpRequired: 0, title: "Seedling" },
  { level: 2, xpRequired: 100, title: "Sprout" },
  { level: 3, xpRequired: 250, title: "Grower" },
  { level: 4, xpRequired: 500, title: "Tender" },
  { level: 5, xpRequired: 900, title: "Botanist" },
  { level: 6, xpRequired: 1400, title: "Garden Keeper" },
  { level: 7, xpRequired: 2000, title: "Plant Whisperer" },
  { level: 8, xpRequired: 3000, title: "Master Gardener" },
];

export function getLevelInfo(totalXp: number) {
  let currentLevelData = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalXp >= lvl.xpRequired) {
      currentLevelData = lvl;
    }
  }
  const nextLevelData = LEVELS.find((l) => l.level === currentLevelData.level + 1) ?? null;
  return {
    currentLevel: currentLevelData.level,
    levelTitle: currentLevelData.title,
    xpForCurrentLevel: currentLevelData.xpRequired,
    xpToNextLevel: nextLevelData ? nextLevelData.xpRequired : null,
  };
}

export function calcWateringXp(daysDue: number): number {
  if (daysDue <= 0) return 25; // on schedule or early
  if (daysDue === 1) return 15;
  return 5;
}

export const XP_POSTPONE = 5;
export const XP_ADD_PLANT = 10;
export const XP_STREAK_3 = 20;
export const XP_STREAK_7 = 50;
