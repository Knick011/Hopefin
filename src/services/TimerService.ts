// src/services/TimerService.ts
import { MMKV } from 'react-native-mmkv';
import { AppState, AppStateStatus } from 'react-native';
import { TimerData } from '@/utils/constants';

type TimerListener = (data: TimerData) => void;

class TimerService {
  private storage: MMKV;
  private listeners: TimerListener[] = [];
  private timerData: TimerData;
  private updateInterval: NodeJS.Timeout | null = null;
  private appStateListener: any = null;

  constructor() {
    this.storage = new MMKV({ id: 'timer-storage' });
    this.timerData = {
      availableTime: 0,
      totalEarnedTime: 0,
      isTimerRunning: false,
      lastUpdateTime: Date.now(),
    };
  }

  async initialize() {
    await this.loadSavedData();
    this.setupAppStateListener();
    this.startUpdateInterval();
  }

  private async loadSavedData() {
    try {
      const savedData = this.storage.getString('timerData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.timerData = { ...this.timerData, ...parsed };
        
        // Update time based on elapsed time while app was closed
        if (this.timerData.isTimerRunning && this.timerData.lastUpdateTime) {
          const elapsed = Math.floor((Date.now() - this.timerData.lastUpdateTime) / 1000);
          this.timerData.availableTime = Math.max(0, this.timerData.availableTime - elapsed);
          this.timerData.isTimerRunning = false; // Stop timer on app restart
        }
      }
    } catch (error) {
      console.error('Error loading timer data:', error);
    }
  }

  private saveData() {
    try {
      const dataToSave = {
        ...this.timerData,
        lastUpdateTime: Date.now(),
      };
      this.storage.set('timerData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving timer data:', error);
    }
  }

  private setupAppStateListener() {
    this.appStateListener = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App going to background
        this.saveData();
      } else if (nextAppState === 'active') {
        // App coming to foreground
        if (this.timerData.isTimerRunning) {
          this.updateTimerFromBackground();
        }
      }
    });
  }

  private startUpdateInterval() {
    this.updateInterval = setInterval(() => {
      if (this.timerData.isTimerRunning) {
        this.updateTimer();
      }
    }, 1000);
  }

  private updateTimerFromBackground() {
    const elapsed = Math.floor((Date.now() - this.timerData.lastUpdateTime) / 1000);
    if (elapsed > 0) {
      this.timerData.availableTime = Math.max(-300, this.timerData.availableTime - elapsed); // Allow 5 min overtime
      this.notifyListeners();
    }
  }

  private updateTimer() {
    if (!this.timerData.isTimerRunning) return;
    
    this.timerData.availableTime -= 1;
    this.saveData();
    this.notifyListeners();
  }

  startTimer() {
    this.timerData.isTimerRunning = true;
    this.timerData.lastUpdateTime = Date.now();
    this.saveData();
    this.notifyListeners();
  }

  stopTimer() {
    this.timerData.isTimerRunning = false;
    this.saveData();
    this.notifyListeners();
  }

  addEarnedTime(seconds: number) {
    this.timerData.availableTime += seconds;
    this.timerData.totalEarnedTime += seconds;
    this.saveData();
    this.notifyListeners();
    return this.timerData.availableTime;
  }

  getAvailableTime(): number {
    return this.timerData.availableTime;
  }

  getTotalEarnedTime(): number {
    return this.timerData.totalEarnedTime;
  }

  isTimerRunning(): boolean {
    return this.timerData.isTimerRunning;
  }

  getTimerData(): TimerData {
    return { ...this.timerData };
  }

  addEventListener(callback: TimerListener) {
    this.listeners.push(callback);
    // Immediately call with current data
    callback(this.getTimerData());
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    const data = this.getTimerData();
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in timer listener:', error);
      }
    });
  }

  async reset() {
    this.timerData = {
      availableTime: 0,
      totalEarnedTime: 0,
      isTimerRunning: false,
      lastUpdateTime: Date.now(),
    };
    
    await this.saveData();
    this.notifyListeners();
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
  }
}

export default new TimerService();