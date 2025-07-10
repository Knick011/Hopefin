// src/store/useStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  // User preferences
  showMascot: boolean;
  setShowMascot: (show: boolean) => void;
  
  // Audio settings
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  
  // Notification settings
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  
  // Onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
  
  // Current session
  currentStreak: number;
  setCurrentStreak: (streak: number) => void;
  
  // Daily login streak
  dailyLoginStreak: number;
  lastLoginDate: string | null;
  updateDailyLoginStreak: () => void;
  
  // UI state
  selectedDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  setSelectedDifficulty: (difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed') => void;
  
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Reset function
  resetStore: () => void;
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User preferences
      showMascot: true,
      setShowMascot: (show) => set({ showMascot: show }),
      
      // Audio settings
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      musicEnabled: true,
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      
      // Notification settings
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      
      // Onboarding
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (completed) => set({ hasCompletedOnboarding: completed }),
      
      // Current session
      currentStreak: 0,
      setCurrentStreak: (streak) => set({ currentStreak: streak }),
      
      // Daily login streak
      dailyLoginStreak: 0,
      lastLoginDate: null,
      updateDailyLoginStreak: () => {
        const today = new Date().toDateString();
        const { lastLoginDate, dailyLoginStreak } = get();
        
        if (lastLoginDate === today) {
          // Already logged in today
          return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        if (lastLoginDate === yesterdayString) {
          // Consecutive day login
          set({
            dailyLoginStreak: dailyLoginStreak + 1,
            lastLoginDate: today,
          });
        } else {
          // Streak broken or first login
          set({
            dailyLoginStreak: 1,
            lastLoginDate: today,
          });
        }
      },
      
      // UI state
      selectedDifficulty: 'Medium',
      setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),
      
      selectedCategory: 'All',
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      
      // Reset function
      resetStore: () => set({
        showMascot: true,
        soundEnabled: true,
        musicEnabled: true,
        notificationsEnabled: true,
        hasCompletedOnboarding: false,
        currentStreak: 0,
        dailyLoginStreak: 0,
        lastLoginDate: null,
        selectedDifficulty: 'Medium',
        selectedCategory: 'All',
      }),
    }),
    {
      name: 'brainbites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useStore;