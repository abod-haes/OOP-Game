import { create } from "zustand";
import { Level, UserLevel } from "./api/client";

interface SectionWithLevels {
  sectionId: string;
  sectionNumber: number;
  levels: Level[];
}

interface GameStore {
  sections: SectionWithLevels[];
  userLevels: UserLevel[];
  currentLevel: Level | null;
  nextLevel: Level | null;

  // Actions
  setSections: (sections: SectionWithLevels[]) => void;
  setUserLevels: (userLevels: UserLevel[]) => void;
  setCurrentLevel: (level: Level | null) => void;
  setNextLevel: (level: Level | null) => void;

  // Computed actions
  findNextLevel: (currentLevelId: string) => Level | null;
  getSectionByLevelId: (levelId: string) => SectionWithLevels | null;
  getCurrentSection: () => SectionWithLevels | null;
  getNextSection: () => SectionWithLevels | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  sections: [],
  userLevels: [],
  currentLevel: null,
  nextLevel: null,

  setSections: (sections) => set({ sections }),
  setUserLevels: (userLevels) => set({ userLevels }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  setNextLevel: (level) => set({ nextLevel: level }),

  findNextLevel: (currentLevelId: string) => {
    const { sections } = get();

    // Find current level
    let currentLevel: Level | null = null;
    let currentSection: SectionWithLevels | null = null;

    for (const section of sections) {
      const level = section.levels.find((l) => l.id === currentLevelId);
      if (level) {
        currentLevel = level;
        currentSection = section;
        break;
      }
    }

    if (!currentLevel || !currentSection) return null;

    // Find next level in same section
    const nextLevelInSection = currentSection.levels.find(
      (l) => l.levelNumber === currentLevel!.levelNumber + 1
    );

    if (nextLevelInSection) return nextLevelInSection;

    // If no next level in same section, find first level of next section
    const nextSection = sections.find(
      (s) => s.sectionNumber === currentSection!.sectionNumber + 1
    );

    if (nextSection && nextSection.levels.length > 0) {
      return nextSection.levels[0]; // First level of next section
    }

    return null;
  },

  getSectionByLevelId: (levelId: string) => {
    const { sections } = get();
    return (
      sections.find((section) =>
        section.levels.some((level) => level.id === levelId)
      ) || null
    );
  },

  getCurrentSection: () => {
    const { currentLevel, sections } = get();
    if (!currentLevel) return null;

    return (
      sections.find((section) =>
        section.levels.some((level) => level.id === currentLevel.id)
      ) || null
    );
  },

  getNextSection: () => {
    const { currentLevel, sections } = get();
    if (!currentLevel) return null;

    const currentSection = get().getCurrentSection();
    if (!currentSection) return null;

    return (
      sections.find(
        (s) => s.sectionNumber === currentSection.sectionNumber + 1
      ) || null
    );
  },
}));
