import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

interface TimerData {
  availableTime: number; // in seconds
  lastUpdateTime: string;
  dailyTimeEarned: number;
  weeklyTimeEarned: number;
  monthlyTimeEarned: number;
  lastResetDate: string;
}

class EnhancedTimerService {
  private timerData: TimerData = {
    availableTime: 300, // Start with 5 minutes
    lastUpdateTime: new Date().toISOString(),
    dailyTimeEarned: 0,
    weeklyTimeEarned: 0,
    monthlyTimeEarned: 0,
    lastResetDate: new Date().toISOString(),
  };

  private STORAGE_KEY = 'brainbites_timer_data';
  private updateListeners: Array<(time: number) => void> = [];
  private nativeTimer = Platform.OS === 'android' ? NativeModules.UsageStatsModule : null;

  async loadSavedTime(): Promise<void> {
    try {
      const savedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        this.timerData = JSON.parse(savedData);
        await this.checkDailyReset();
      }
    } catch (error) {
      console.error('Error loading timer data:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      this.timerData.lastUpdateTime = new Date().toISOString();
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.timerData));
    } catch (error) {
      console.error('Error saving timer data:', error);
    }
  }

  private async checkDailyReset(): Promise<void> {
    const now = new Date();
    const lastReset = new Date(this.timerData.lastResetDate);
    
    // Check if it's a new day
    if (now.toDateString() !== lastReset.toDateString()) {
      this.timerData.dailyTimeEarned = 0;
      
      // Check if it's a new week (Sunday is 0)
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const lastWeekStart = new Date(lastReset);
      lastWeekStart.setDate(lastReset.getDate() - lastReset.getDay());
      
      if (weekStart.toDateString() !== lastWeekStart.toDateString()) {
        this.timerData.weeklyTimeEarned = 0;
      }
      
      // Check if it's a new month
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        this.timerData.monthlyTimeEarned = 0;
      }
      
      this.timerData.lastResetDate = now.toISOString();
      await this.saveData();
    }
  }

  async addTime(seconds: number): Promise<void> {
    this.timerData.availableTime += seconds;
    this.timerData.dailyTimeEarned += seconds;
    this.timerData.weeklyTimeEarned += seconds;
    this.timerData.monthlyTimeEarned += seconds;
    
    await this.saveData();
    this.notifyListeners();
    
    // If native timer is available, add time there too
    if (this.nativeTimer?.addBonusTime) {
      try {
        await this.nativeTimer.addBonusTime(seconds);
      } catch (error) {
        console.log('Native timer not available:', error);
      }
    }
  }

  async consumeTime(seconds: number): Promise<boolean> {
    if (this.timerData.availableTime >= seconds) {
      this.timerData.availableTime -= seconds;
      await this.saveData();
      this.notifyListeners();
      
      // If native timer is available, consume time there too
      if (this.nativeTimer?.consumeTime) {
        try {
          await this.nativeTimer.consumeTime(seconds);
        } catch (error) {
          console.log('Native timer not available:', error);
        }
      }
      
      return true;
    }
    return false;
  }

  getAvailableTime(): number {
    return this.timerData.availableTime;
  }

  getTimeStats(): {
    daily: number;
    weekly: number;
    monthly: number;
  } {
    return {
      daily: this.timerData.dailyTimeEarned,
      weekly: this.timerData.weeklyTimeEarned,
      monthly: this.timerData.monthlyTimeEarned,
    };
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // Listener management
  addListener(listener: (time: number) => void): void {
    this.updateListeners.push(listener);
  }

  removeListener(listener: (time: number) => void): void {
    this.updateListeners = this.updateListeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    this.updateListeners.forEach(listener => {
      listener(this.timerData.availableTime);
    });
  }

  // Achievement milestones
  checkTimeMilestones(): string[] {
    const milestones: string[] = [];
    const totalMinutes = Math.floor(this.timerData.availableTime / 60);

    // Check for various time milestones
    if (totalMinutes >= 60 && !milestones.includes('hour_saved')) {
      milestones.push('hour_saved');
    }
    if (totalMinutes >= 180 && !milestones.includes('three_hours_saved')) {
      milestones.push('three_hours_saved');
    }
    if (totalMinutes >= 300 && !milestones.includes('five_hours_saved')) {
      milestones.push('five_hours_saved');
    }

    return milestones;
  }

  // Native timer integration methods
  async checkNativeTimerAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android' || !this.nativeTimer) {
      return false;
    }

    try {
      const isAvailable = await this.nativeTimer.isTimerServiceAvailable();
      return isAvailable;
    } catch (error) {
      console.log('Native timer check failed:', error);
      return false;
    }
  }

  async syncWithNativeTimer(): Promise<void> {
    if (!this.nativeTimer?.syncTime) return;

    try {
      const nativeTime = await this.nativeTimer.getAvailableTime();
      // Only sync if there's a significant difference
      if (Math.abs(nativeTime - this.timerData.availableTime) > 60) {
        // Take the larger value to avoid losing time
        this.timerData.availableTime = Math.max(nativeTime, this.timerData.availableTime);
        await this.saveData();
        this.notifyListeners();
      }
    } catch (error) {
      console.log('Native timer sync failed:', error);
    }
  }

  async resetProgress(): Promise<void> {
    this.timerData = {
      availableTime: 300, // Reset to 5 minutes
      lastUpdateTime: new Date().toISOString(),
      dailyTimeEarned: 0,
      weeklyTimeEarned: 0,
      monthlyTimeEarned: 0,
      lastResetDate: new Date().toISOString(),
    };
    await this.saveData();
    this.notifyListeners();
  }
}

export default new EnhancedTimerService();