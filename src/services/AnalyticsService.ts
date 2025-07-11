import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import analytics from '@react-native-firebase/analytics';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  events: AnalyticsEvent[];
}

interface UserMetrics {
  totalSessions: number;
  totalPlayTime: number;
  averageSessionLength: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  favoriteCategory: string;
  timeEarnedTotal: number;
  achievementsUnlocked: number;
  lastActiveDate: string;
}

class AnalyticsService {
  private currentSession: UserSession | null = null;
  private STORAGE_KEY = 'brainbites_analytics';
  private SESSION_STORAGE_KEY = 'brainbites_current_session';
  private metrics: UserMetrics = {
    totalSessions: 0,
    totalPlayTime: 0,
    averageSessionLength: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    accuracy: 0,
    favoriteCategory: '',
    timeEarnedTotal: 0,
    achievementsUnlocked: 0,
    lastActiveDate: new Date().toISOString(),
  };

  async initialize(): Promise<void> {
    try {
      // Load saved metrics
      const savedMetrics = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (savedMetrics) {
        this.metrics = JSON.parse(savedMetrics);
      }

      // Check for incomplete session
      const savedSession = await AsyncStorage.getItem(this.SESSION_STORAGE_KEY);
      if (savedSession) {
        this.currentSession = JSON.parse(savedSession);
      }

      // Start new session
      this.startSession();
    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  }

  private async saveMetrics(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Error saving analytics metrics:', error);
    }
  }

  private async saveCurrentSession(): Promise<void> {
    try {
      if (this.currentSession) {
        await AsyncStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
      }
    } catch (error) {
      console.error('Error saving current session:', error);
    }
  }

  startSession(): void {
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      events: [],
    };
    
    this.metrics.totalSessions++;
    this.metrics.lastActiveDate = new Date().toISOString();
    this.saveMetrics();
    this.saveCurrentSession();
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    const sessionLength = this.currentSession.endTime - this.currentSession.startTime;
    
    // Update metrics
    this.metrics.totalPlayTime += sessionLength;
    this.metrics.averageSessionLength = Math.round(
      this.metrics.totalPlayTime / this.metrics.totalSessions
    );
    
    await this.saveMetrics();
    
    // Clear current session
    this.currentSession = null;
    await AsyncStorage.removeItem(this.SESSION_STORAGE_KEY);
  }

  // Track screen views
  trackScreen(screenName: string, category?: string): void {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      category: category,
    });
    // Send to Firebase Analytics
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: category || undefined,
    });
  }

  // Track events
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.currentSession) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
    };

    this.currentSession.events.push(event);
    this.saveCurrentSession();

    // Update specific metrics based on event
    this.updateMetricsFromEvent(eventName, properties);

    // Send to Firebase Analytics
    if (eventName && typeof analytics === 'function') {
      // Firebase Analytics event names must be <= 40 chars, alphanumeric/underscores only
      const firebaseEventName = eventName.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40);
      analytics().logEvent(firebaseEventName, properties || {});
    }
  }

  private updateMetricsFromEvent(eventName: string, properties?: Record<string, any>): void {
    switch (eventName) {
      case 'question_answered':
        this.metrics.questionsAnswered++;
        if (properties?.correct) {
          this.metrics.correctAnswers++;
        }
        this.metrics.accuracy = this.metrics.correctAnswers / this.metrics.questionsAnswered;
        break;
        
      case 'time_earned':
        this.metrics.timeEarnedTotal += properties?.seconds || 0;
        break;
        
      case 'achievement_unlocked':
        this.metrics.achievementsUnlocked++;
        break;
        
      case 'category_selected':
        // Track favorite category (simplified - just the most recent)
        this.metrics.favoriteCategory = properties?.category || '';
        break;
    }
    
    this.saveMetrics();
  }

  // Track quiz performance
  trackQuizPerformance(
    category: string,
    questionsAnswered: number,
    correctAnswers: number,
    timeEarned: number,
    streak: number
  ): void {
    this.trackEvent('quiz_completed', {
      category,
      questions_answered: questionsAnswered,
      correct_answers: correctAnswers,
      accuracy: correctAnswers / questionsAnswered,
      time_earned_seconds: timeEarned,
      streak,
    });
  }

  // Track user actions
  trackButtonPress(buttonName: string, screen: string): void {
    this.trackEvent('button_press', {
      button_name: buttonName,
      screen,
    });
  }

  // Track errors
  trackError(error: string, context: string): void {
    this.trackEvent('error', {
      error_message: error,
      context,
      device_info: {
        platform: DeviceInfo.getSystemName(),
        version: DeviceInfo.getSystemVersion(),
        app_version: DeviceInfo.getVersion(),
      },
    });
  }

  // Get analytics summary
  getAnalyticsSummary(): UserMetrics {
    return { ...this.metrics };
  }

  // Get session events (for debugging or export)
  getCurrentSessionEvents(): AnalyticsEvent[] {
    return this.currentSession?.events || [];
  }

  // Export analytics data
  async exportAnalyticsData(): Promise<string> {
    const data = {
      metrics: this.metrics,
      currentSession: this.currentSession,
      exportDate: new Date().toISOString(),
      deviceInfo: {
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
      },
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Clear all analytics data
  async clearAnalyticsData(): Promise<void> {
    this.metrics = {
      totalSessions: 0,
      totalPlayTime: 0,
      averageSessionLength: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      accuracy: 0,
      favoriteCategory: '',
      timeEarnedTotal: 0,
      achievementsUnlocked: 0,
      lastActiveDate: new Date().toISOString(),
    };
    
    this.currentSession = null;
    
    await AsyncStorage.multiRemove([this.STORAGE_KEY, this.SESSION_STORAGE_KEY]);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new AnalyticsService();