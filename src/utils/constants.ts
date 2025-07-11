export const Colors = {
  // Primary colors
  primary: '#FF9F1C',
  primaryDark: '#FF7043',
  primaryLight: '#FFB74D',
  
  // Background colors
  background: '#FFF8E7',
  surface: '#FFFFFF',
  
  // Text colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textOnPrimary: '#FFFFFF',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Other colors
  streak: '#FF6B6B',
  score: '#FFD700',
  timer: '#00BCD4',
  category: {
    funfacts: '#9C27B0',
    psychology: '#E91E63',
    science: '#00BCD4',
    history: '#FF9800',
    geography: '#4CAF50',
    sports: '#F44336',
    arts: '#3F51B5',
    general: '#607D8B',
  },
};

export const Animations = {
  // Durations
  fast: 200,
  normal: 300,
  slow: 500,
  
  // Easing
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: {
    friction: 8,
    tension: 40,
  },
};

export const MascotMessages = {
  welcome: [
    "Welcome back! Ready to learn something new? 🌟",
    "Hey there! Let's grow that brain of yours! 🧠",
    "Great to see you! Time for some fun facts! 🎯",
  ],
  
  correct: [
    "Brilliant! You got it right! 🎉",
    "Amazing work! Keep it up! 💪",
    "You're on fire! 🔥",
    "Genius alert! Well done! 🌟",
    "Perfect! You're crushing it! 🚀",
  ],
  
  incorrect: [
    "Don't worry, you'll get the next one! 💪",
    "That's okay! Learning is all about trying! 🌱",
    "Nice try! Here's what to remember... 📚",
    "Almost there! Keep going! 🎯",
  ],
  
  streak: {
    5: "5 in a row! You're on a roll! 🔥",
    10: "10 streak! You're unstoppable! 🚀",
    15: "15 correct! Mind = blown! 🤯",
    20: "20 streak! Are you a genius? 🧠",
  },
  
  encouragement: [
    "You're doing great! Keep going! 💪",
    "Every question makes you smarter! 🧠",
    "Believe in yourself! You've got this! 🌟",
    "Learning is your superpower! ⚡",
  ],
};

export const GameConfig = {
  // Time rewards (in seconds)
  normalAnswerReward: 30,
  milestoneReward: 120,
  dailyBonusReward: 300,
  
  // Streak milestones
  streakMilestones: [5, 10, 15, 20, 25, 30, 40, 50],
  
  // Points
  basePoints: 10,
  streakBonusPerFive: 5,
  milestoneBonus: 50,
  
  // Quiz settings
  questionsPerSession: 10,
  timePerQuestion: 30, // seconds
  
  // Animation delays
  mascotAutoHideDelay: 5000,
  peekingMascotInterval: 20000,
  
  // Storage keys
  storageKeys: {
    score: 'brainbites_score_data',
    timer: 'brainbites_timer_data',
    settings: 'brainbites_settings',
    usedQuestions: 'brainbites_used_questions',
    onboarding: 'brainbites_onboarding_complete',
    achievements: 'brainbites_achievements',
  },
};

export const Categories = [
  { id: 'funfacts', name: 'Fun Facts', icon: 'lightbulb', color: Colors.category.funfacts },
  { id: 'psychology', name: 'Psychology', icon: 'brain', color: Colors.category.psychology },
  { id: 'science', name: 'Science', icon: 'flask', color: Colors.category.science },
  { id: 'history', name: 'History', icon: 'clock', color: Colors.category.history },
  { id: 'geography', name: 'Geography', icon: 'earth', color: Colors.category.geography },
  { id: 'sports', name: 'Sports', icon: 'basketball', color: Colors.category.sports },
  { id: 'arts', name: 'Arts & Culture', icon: 'palette', color: Colors.category.arts },
  { id: 'general', name: 'General Knowledge', icon: 'book', color: Colors.category.general },
];