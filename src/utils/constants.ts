// src/utils/constants.ts

export const Colors = {
    // Primary colors
    primary: '#FF9F1C',
    primaryDark: '#E88F0A',
    primaryLight: '#FFB84D',
    
    // Secondary colors
    secondary: '#4ECDC4',
    secondaryDark: '#44B5AD',
    secondaryLight: '#6FE3DB',
    
    // Accent colors
    accent: '#FFD93D',
    success: '#4ECDC4',
    error: '#FF6B6B',
    warning: '#FFA726',
    info: '#667eea',
    
    // Background colors
    background: '#FFFCF2',
    surface: '#FFFFFF',
    
    // Text colors
    textPrimary: '#333333',
    textSecondary: '#666666',
    textLight: '#999999',
    textOnPrimary: '#FFFFFF',
    
    // Difficulty colors
    easy: '#4ECDC4',
    medium: '#FFA726',
    hard: '#FF6B6B',
  };
  
  export const Fonts = {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
      xxxl: 48,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  };
  
  export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };
  
  export const Layout = {
    borderRadius: {
      small: 8,
      medium: 12,
      large: 16,
      xl: 24,
      round: 9999,
    },
    shadow: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      },
    },
  };
  
  export const CategoryIcons: Record<string, string> = {
    'Science': 'flask',
    'Math': 'calculator',
    'History': 'book-open-variant',
    'Geography': 'earth',
    'Literature': 'bookshelf',
    'Technology': 'laptop',
    'Sports': 'basketball',
    'Art': 'palette',
    'Music': 'music-note',
    'General': 'head-question',
    'All': 'view-grid',
  };
  
  export const MascotMessages = {
    welcome: [
      "Welcome back! Ready to learn something new? 🌟",
      "Hey there, genius! Time to train that brain! 🧠",
      "Great to see you! Let's earn some screen time! ⏰",
    ],
    correctAnswer: [
      "Brilliant! You got it right! 🎉",
      "Amazing work! Keep it up! 💪",
      "You're on fire! Great answer! 🔥",
      "Fantastic! Your brain is growing! 🌱",
    ],
    wrongAnswer: [
      "Not quite right, but that's okay! Learning is all about trying! 💙",
      "Good effort! Let's learn from this one! 📚",
      "Keep going! Every mistake makes you smarter! 🌟",
    ],
    streak: {
      5: "5 in a row! You're doing great! 🎯",
      10: "10 correct! You're unstoppable! 🚀",
      15: "15 streak! You're a quiz master! 👑",
      20: "20 in a row! Absolutely incredible! 🌟",
    },
    timeWarning: [
      "Running low on time! Answer some questions to earn more! ⏰",
      "Time's almost up! Let's get some more questions answered! 📚",
    ],
  };
  
  // Types
  export interface Question {
    id: number;
    category: string;
    question: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    level: 'Easy' | 'Medium' | 'Hard';
  }
  
  export interface ScoreData {
    totalScore: number;
    dailyScore: number;
    currentStreak: number;
    highestStreak: number;
    questionsAnswered: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracy: number;
  }
  
  export interface TimerData {
    availableTime: number;
    totalEarnedTime: number;
    isTimerRunning: boolean;
    lastUpdateTime: number;
  }
  
  export interface DailyGoal {
    id: string;
    title: string;
    description: string;
    target: number;
    type: 'questions_answered' | 'correct_answers' | 'streak' | 'time_earned' | 'categories_played' | 'perfect_quiz';
    reward: string;
    rewardSeconds: number;
    icon: string;
    color: string;
    progress: {
      current: number;
      completed: boolean;
      claimedReward: boolean;
    };
  }