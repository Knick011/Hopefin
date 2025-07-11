import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  reward: number; // Time reward in seconds
  icon: string;
  type: 'questions' | 'streak' | 'accuracy' | 'time' | 'categories';
}

interface DailyGoalsData {
  date: string;
  goals: DailyGoal[];
  completedGoals: number;
  totalRewardsEarned: number;
}

class DailyGoalsService {
  private STORAGE_KEY = 'brainbites_daily_goals';
  private currentGoals: DailyGoalsData | null = null;

  // Goal templates
  private goalTemplates: Partial<DailyGoal>[] = [
    {
      id: 'daily_questions_5',
      title: 'Quiz Starter',
      description: 'Answer 5 questions',
      target: 5,
      reward: 60,
      icon: 'help-circle',
      type: 'questions',
    },
    {
      id: 'daily_questions_10',
      title: 'Knowledge Seeker',
      description: 'Answer 10 questions',
      target: 10,
      reward: 120,
      icon: 'help-circle-outline',
      type: 'questions',
    },
    {
      id: 'daily_streak_3',
      title: 'Streak Builder',
      description: 'Get 3 correct answers in a row',
      target: 3,
      reward: 90,
      icon: 'fire',
      type: 'streak',
    },
    {
      id: 'daily_accuracy_80',
      title: 'Sharp Mind',
      description: 'Achieve 80% accuracy (min 5 questions)',
      target: 80,
      reward: 150,
      icon: 'target',
      type: 'accuracy',
    },
    {
      id: 'daily_time_5',
      title: 'Time Investor',
      description: 'Play for 5 minutes',
      target: 300, // 5 minutes in seconds
      reward: 120,
      icon: 'clock-outline',
      type: 'time',
    },
    {
      id: 'daily_categories_2',
      title: 'Category Explorer',
      description: 'Play in 2 different categories',
      target: 2,
      reward: 100,
      icon: 'shape-outline',
      type: 'categories',
    },
  ];

  async initialize(): Promise<void> {
    await this.loadDailyGoals();
  }

  private async loadDailyGoals(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      const today = new Date().toDateString();

      if (stored) {
        const data: DailyGoalsData = JSON.parse(stored);
        
        // Check if goals are from today
        if (data.date === today) {
          this.currentGoals = data;
          return;
        }
      }

      // Generate new daily goals
      await this.generateDailyGoals();
    } catch (error) {
      console.error('Error loading daily goals:', error);
      await this.generateDailyGoals();
    }
  }

  private async generateDailyGoals(): Promise<void> {
    const today = new Date().toDateString();
    
    // Randomly select 3-4 goals for the day
    const numGoals = Math.random() > 0.5 ? 4 : 3;
    const shuffled = [...this.goalTemplates].sort(() => Math.random() - 0.5);
    const selectedGoals = shuffled.slice(0, numGoals);

    const goals: DailyGoal[] = selectedGoals.map(template => ({
      ...template as DailyGoal,
      current: 0,
      completed: false,
    }));

    this.currentGoals = {
      date: today,
      goals,
      completedGoals: 0,
      totalRewardsEarned: 0,
    };

    await this.saveGoals();
  }

  private async saveGoals(): Promise<void> {
    try {
      if (this.currentGoals) {
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentGoals));
      }
    } catch (error) {
      console.error('Error saving daily goals:', error);
    }
  }

  getDailyGoals(): DailyGoal[] {
    return this.currentGoals?.goals || [];
  }

  getCompletedGoalsCount(): number {
    return this.currentGoals?.completedGoals || 0;
  }

  getTotalRewardsEarned(): number {
    return this.currentGoals?.totalRewardsEarned || 0;
  }

  async updateProgress(type: DailyGoal['type'], value: number, additionalData?: any): Promise<DailyGoal[]> {
    if (!this.currentGoals) return [];

    const completedGoals: DailyGoal[] = [];

    for (const goal of this.currentGoals.goals) {
      if (goal.completed) continue;

      let shouldUpdate = false;
      let newValue = goal.current;

      switch (goal.type) {
        case 'questions':
          if (type === 'questions') {
            newValue = goal.current + value;
            shouldUpdate = true;
          }
          break;

        case 'streak':
          if (type === 'streak' && value > goal.current) {
            newValue = value;
            shouldUpdate = true;
          }
          break;

        case 'accuracy':
          if (type === 'accuracy' && additionalData?.totalQuestions >= 5) {
            newValue = Math.round((additionalData.correctAnswers / additionalData.totalQuestions) * 100);
            shouldUpdate = true;
          }
          break;

        case 'time':
          if (type === 'time') {
            newValue = goal.current + value;
            shouldUpdate = true;
          }
          break;

        case 'categories':
          if (type === 'categories' && additionalData?.categories) {
            newValue = additionalData.categories.size;
            shouldUpdate = true;
          }
          break;
      }

      if (shouldUpdate) {
        goal.current = newValue;

        // Check if goal is completed
        if (newValue >= goal.target && !goal.completed) {
          goal.completed = true;
          this.currentGoals.completedGoals++;
          this.currentGoals.totalRewardsEarned += goal.reward;
          completedGoals.push(goal);
        }
      }
    }

    await this.saveGoals();
    return completedGoals;
  }

  async claimReward(goalId: string): Promise<number> {
    if (!this.currentGoals) return 0;

    const goal = this.currentGoals.goals.find(g => g.id === goalId);
    if (!goal || !goal.completed) return 0;

    return goal.reward;
  }

  async resetDailyGoals(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
    this.currentGoals = null;
    await this.generateDailyGoals();
  }

  getProgress(): { completed: number; total: number; percentage: number } {
    if (!this.currentGoals) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const total = this.currentGoals.goals.length;
    const completed = this.currentGoals.completedGoals;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }
}

export default new DailyGoalsService();