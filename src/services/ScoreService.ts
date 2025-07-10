// src/services/ScoreService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScoreData } from '@/utils/constants';

type DailyResetCallback = (data: { yesterdayScore: number; newDate: string }) => void;

class ScoreService {
  private STORAGE_KEY = 'brainbites_score_data';
  private scoreData: ScoreData & { lastResetDate: string | null };
  private dailyResetCallback: DailyResetCallback | null = null;
  private streakMilestones = [5, 10, 15, 20, 25, 30, 50, 100];

  constructor() {
    this.scoreData = {
      totalScore: 0,
      dailyScore: 0,
      currentStreak: 0,
      highestStreak: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      accuracy: 0,
      lastResetDate: null,
    };
  }

  async initialize() {
    await this.loadSavedData();
  }

  private async loadSavedData() {
    try {
      const savedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.scoreData = { ...this.scoreData, ...parsed };
      }
      
      // Check for daily reset
      await this.checkDailyReset();
    } catch (error) {
      console.error('Error loading score data:', error);
    }
  }

  private async saveData() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scoreData));
    } catch (error) {
      console.error('Error saving score data:', error);
    }
  }

  private async checkDailyReset() {
    const today = new Date().toDateString();
    
    if (this.scoreData.lastResetDate !== today) {
      const yesterdayScore = this.scoreData.dailyScore;
      
      // Reset daily values
      this.scoreData.dailyScore = 0;
      this.scoreData.lastResetDate = today;
      
      await this.saveData();
      
      // Notify callback if set
      if (this.dailyResetCallback) {
        this.dailyResetCallback({
          yesterdayScore,
          newDate: today,
        });
      }
    }
  }

  setDailyResetCallback(callback: DailyResetCallback) {
    this.dailyResetCallback = callback;
  }

  async addCorrectAnswer(basePoints = 10): Promise<{
    pointsEarned: number;
    currentStreak: number;
    isNewHighStreak: boolean;
  }> {
    this.scoreData.questionsAnswered++;
    this.scoreData.correctAnswers++;
    this.scoreData.currentStreak++;
    
    // Calculate points with streak bonus
    let points = basePoints;
    if (this.scoreData.currentStreak > 1) {
      const streakBonus = Math.min(this.scoreData.currentStreak - 1, 10) * 2;
      points += streakBonus;
    }
    
    this.scoreData.totalScore += points;
    this.scoreData.dailyScore += points;
    
    // Update highest streak
    const isNewHighStreak = this.scoreData.currentStreak > this.scoreData.highestStreak;
    if (isNewHighStreak) {
      this.scoreData.highestStreak = this.scoreData.currentStreak;
    }
    
    // Update accuracy
    this.updateAccuracy();
    
    await this.saveData();
    
    return {
      pointsEarned: points,
      currentStreak: this.scoreData.currentStreak,
      isNewHighStreak,
    };
  }

  async addWrongAnswer(): Promise<{
    streakLost: number;
    pointsLost: number;
  }> {
    this.scoreData.questionsAnswered++;
    this.scoreData.wrongAnswers++;
    
    const previousStreak = this.scoreData.currentStreak;
    this.scoreData.currentStreak = 0;
    
    // Update accuracy
    this.updateAccuracy();
    
    await this.saveData();
    
    return {
      streakLost: previousStreak,
      pointsLost: 0, // No points lost for wrong answers
    };
  }

  private updateAccuracy() {
    if (this.scoreData.questionsAnswered > 0) {
      this.scoreData.accuracy = Math.round(
        (this.scoreData.correctAnswers / this.scoreData.questionsAnswered) * 100
      );
    }
  }

  checkStreakMilestone(streak: number): boolean {
    return this.streakMilestones.includes(streak);
  }

  getScoreInfo(): ScoreData {
    return {
      totalScore: this.scoreData.totalScore,
      dailyScore: this.scoreData.dailyScore,
      currentStreak: this.scoreData.currentStreak,
      highestStreak: this.scoreData.highestStreak,
      questionsAnswered: this.scoreData.questionsAnswered,
      correctAnswers: this.scoreData.correctAnswers,
      wrongAnswers: this.scoreData.wrongAnswers,
      accuracy: this.scoreData.accuracy,
    };
  }

  async getLeaderboardData() {
    try {
      // In a real app, this would fetch from a server
      const localEntry = {
        rank: 1,
        name: 'You',
        score: this.scoreData.totalScore,
        streak: this.scoreData.highestStreak,
        isCurrentUser: true,
        color: '#FF9F1C',
      };
      
      // Mock other users
      const mockUsers = [
        { rank: 2, name: 'Alex B.', score: Math.floor(this.scoreData.totalScore * 0.9), streak: 15, color: '#4ECDC4' },
        { rank: 3, name: 'Sarah M.', score: Math.floor(this.scoreData.totalScore * 0.8), streak: 12, color: '#FFA726' },
        { rank: 4, name: 'Mike T.', score: Math.floor(this.scoreData.totalScore * 0.7), streak: 10, color: '#667eea' },
        { rank: 5, name: 'Emma L.', score: Math.floor(this.scoreData.totalScore * 0.6), streak: 8, color: '#FF6B6B' },
      ];
      
      return [localEntry, ...mockUsers];
    } catch (error) {
      console.error('Error getting leaderboard data:', error);
      return [];
    }
  }

  async resetAllScores() {
    this.scoreData = {
      totalScore: 0,
      dailyScore: 0,
      currentStreak: 0,
      highestStreak: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      accuracy: 0,
      lastResetDate: new Date().toDateString(),
    };
    
    await this.saveData();
  }
}

export default new ScoreService();