import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScoreData {
  totalScore: number;
  currentStreak: number;
  highestStreak: number;
  questionsAnswered: number;
  correctAnswers: number;
  achievements: string[];
  lastPlayDate: string;
  dailyStreak: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (data: ScoreData) => boolean;
}

class ScoreService {
  private scoreData: ScoreData = {
    totalScore: 0,
    currentStreak: 0,
    highestStreak: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    achievements: [],
    lastPlayDate: '',
    dailyStreak: 0,
  };

  private STORAGE_KEY = 'brainbites_score_data';

  private achievements: Achievement[] = [
    {
      id: 'first_correct',
      name: 'First Steps',
      description: 'Answer your first question correctly',
      icon: 'star',
      condition: (data) => data.correctAnswers >= 1,
    },
    {
      id: 'streak_5',
      name: 'On Fire!',
      description: 'Get 5 correct answers in a row',
      icon: 'fire',
      condition: (data) => data.highestStreak >= 5,
    },
    {
      id: 'streak_10',
      name: 'Unstoppable!',
      description: 'Get 10 correct answers in a row',
      icon: 'rocket',
      condition: (data) => data.highestStreak >= 10,
    },
    {
      id: 'streak_20',
      name: 'Genius Mode',
      description: 'Get 20 correct answers in a row',
      icon: 'brain',
      condition: (data) => data.highestStreak >= 20,
    },
    {
      id: 'score_100',
      name: 'Century',
      description: 'Reach 100 total points',
      icon: 'trophy',
      condition: (data) => data.totalScore >= 100,
    },
    {
      id: 'score_1000',
      name: 'High Scorer',
      description: 'Reach 1,000 total points',
      icon: 'medal',
      condition: (data) => data.totalScore >= 1000,
    },
    {
      id: 'daily_streak_7',
      name: 'Week Warrior',
      description: 'Play for 7 days in a row',
      icon: 'calendar-check',
      condition: (data) => data.dailyStreak >= 7,
    },
    {
      id: 'daily_streak_30',
      name: 'Dedicated Learner',
      description: 'Play for 30 days in a row',
      icon: 'school',
      condition: (data) => data.dailyStreak >= 30,
    },
    {
      id: 'questions_100',
      name: 'Curious Mind',
      description: 'Answer 100 questions',
      icon: 'help-circle',
      condition: (data) => data.questionsAnswered >= 100,
    },
    {
      id: 'accuracy_80',
      name: 'Sharp Shooter',
      description: 'Maintain 80% accuracy (min 50 questions)',
      icon: 'target',
      condition: (data) => 
        data.questionsAnswered >= 50 && 
        (data.correctAnswers / data.questionsAnswered) >= 0.8,
    },
  ];

  async loadSavedData(): Promise<void> {
    try {
      const savedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        this.scoreData = JSON.parse(savedData);
        await this.checkDailyStreak();
      }
    } catch (error) {
      console.error('Error loading score data:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scoreData));
    } catch (error) {
      console.error('Error saving score data:', error);
    }
  }

  private async checkDailyStreak(): Promise<void> {
    const today = new Date().toDateString();
    const lastPlay = this.scoreData.lastPlayDate;

    if (!lastPlay) {
      this.scoreData.dailyStreak = 1;
    } else {
      const lastPlayDate = new Date(lastPlay);
      const todayDate = new Date(today);
      const dayDiff = Math.floor((todayDate.getTime() - lastPlayDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 0) {
        // Already played today
        return;
      } else if (dayDiff === 1) {
        // Consecutive day
        this.scoreData.dailyStreak++;
      } else {
        // Streak broken
        this.scoreData.dailyStreak = 1;
      }
    }

    this.scoreData.lastPlayDate = today;
    await this.saveData();
  }

  async addPoints(points: number, currentStreak: number): Promise<string[]> {
    this.scoreData.totalScore += points;
    this.scoreData.currentStreak = currentStreak;
    
    if (currentStreak > this.scoreData.highestStreak) {
      this.scoreData.highestStreak = currentStreak;
    }

    // Check for new achievements
    const newAchievements = await this.checkAchievements();
    
    await this.saveData();
    return newAchievements;
  }

  async recordAnswer(isCorrect: boolean): Promise<void> {
    this.scoreData.questionsAnswered++;
    if (isCorrect) {
      this.scoreData.correctAnswers++;
    }
    await this.saveData();
  }

  resetStreak(): void {
    this.scoreData.currentStreak = 0;
  }

  private async checkAchievements(): Promise<string[]> {
    const newAchievements: string[] = [];

    for (const achievement of this.achievements) {
      if (!this.scoreData.achievements.includes(achievement.id)) {
        if (achievement.condition(this.scoreData)) {
          this.scoreData.achievements.push(achievement.id);
          newAchievements.push(achievement.id);
        }
      }
    }

    return newAchievements;
  }

  getScoreInfo(): ScoreData {
    return { ...this.scoreData };
  }

  getAchievements(): Achievement[] {
    return this.achievements.filter(a => 
      this.scoreData.achievements.includes(a.id)
    );
  }

  getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  getAchievementProgress(achievementId: string): number {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;

    switch (achievementId) {
      case 'streak_5':
        return Math.min(this.scoreData.highestStreak / 5, 1);
      case 'streak_10':
        return Math.min(this.scoreData.highestStreak / 10, 1);
      case 'streak_20':
        return Math.min(this.scoreData.highestStreak / 20, 1);
      case 'score_100':
        return Math.min(this.scoreData.totalScore / 100, 1);
      case 'score_1000':
        return Math.min(this.scoreData.totalScore / 1000, 1);
      case 'daily_streak_7':
        return Math.min(this.scoreData.dailyStreak / 7, 1);
      case 'daily_streak_30':
        return Math.min(this.scoreData.dailyStreak / 30, 1);
      case 'questions_100':
        return Math.min(this.scoreData.questionsAnswered / 100, 1);
      case 'accuracy_80':
        if (this.scoreData.questionsAnswered < 50) {
          return this.scoreData.questionsAnswered / 50;
        }
        const accuracy = this.scoreData.correctAnswers / this.scoreData.questionsAnswered;
        return Math.min(accuracy / 0.8, 1);
      default:
        return 0;
    }
  }

  async deductPoints(points: number): Promise<void> {
    this.scoreData.totalScore = Math.max(0, this.scoreData.totalScore - points);
    await this.saveData();
  }

  async handleOvertimeUsage(negativeSeconds: number): Promise<void> {
    // Deduct points for overtime usage
    // 10 points per minute of overtime
    const minutesOvertime = Math.floor(negativeSeconds / 60);
    const pointsToDeduct = minutesOvertime * 10;
    
    if (pointsToDeduct > 0) {
      await this.deductPoints(pointsToDeduct);
      console.log(`Deducted ${pointsToDeduct} points for ${minutesOvertime} minutes of overtime usage`);
    }
  }

  async resetProgress(): Promise<void> {
    this.scoreData = {
      totalScore: 0,
      currentStreak: 0,
      highestStreak: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      achievements: [],
      lastPlayDate: '',
      dailyStreak: 0,
    };
    await this.saveData();
  }
}

export default new ScoreService();