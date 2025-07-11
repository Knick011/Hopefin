import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class NotificationService {
  private initialized = false;
  private CHANNEL_ID = 'brainbites-channel';
  private STORAGE_KEY = 'brainbites_notifications_enabled';

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Check if notifications are enabled
    const enabled = await this.isEnabled();
    if (!enabled) {
      this.initialized = true;
      return;
    }

    // Configure push notifications
    PushNotification.configure({
      onNotification: (notification) => {
        console.log('Notification received:', notification);
      },
      
      onRegistrationError: (err) => {
        console.error('Notification registration error:', err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: this.CHANNEL_ID,
          channelName: 'BrainBites Notifications',
          channelDescription: 'Notifications for reminders and achievements',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Notification channel created: ${created}`)
      );
    }

    this.initialized = true;
  }

  async isEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(this.STORAGE_KEY);
    return enabled !== 'false';
  }

  async setEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEY, enabled.toString());
    if (enabled && !this.initialized) {
      await this.initialize();
    }
  }

  // Schedule a reminder when time is low
  scheduleEarnTimeReminder(hoursFromNow: number = 4): void {
    if (!this.initialized) return;

    const notificationId = 'earn-time-reminder';
    
    // Cancel existing reminder
    PushNotification.cancelLocalNotification(notificationId);

    // Schedule new reminder
    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: this.CHANNEL_ID,
      title: '⏰ Time Running Low!',
      message: 'Your app time is running low. Answer some questions to earn more!',
      date: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000),
      allowWhileIdle: true,
      repeatType: undefined,
      userInfo: { type: 'earn_time' },
    });
  }

  // Schedule daily streak reminder
  scheduleStreakReminder(hour: number = 19, minute: number = 0): void {
    if (!this.initialized) return;

    const notificationId = 'daily-streak';
    
    // Cancel existing reminder
    PushNotification.cancelLocalNotification(notificationId);

    // Calculate next reminder time
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Schedule notification
    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: this.CHANNEL_ID,
      title: '🔥 Keep Your Streak Alive!',
      message: "Don't forget to play today and maintain your learning streak!",
      date: scheduledTime,
      repeatType: 'day',
      allowWhileIdle: true,
      userInfo: { type: 'daily_streak' },
    });
  }

  // Show achievement notification
  showAchievementNotification(achievementName: string, description: string): void {
    if (!this.initialized) return;

    PushNotification.localNotification({
      channelId: this.CHANNEL_ID,
      title: '🏆 Achievement Unlocked!',
      message: `${achievementName}: ${description}`,
      playSound: true,
      soundName: 'achievement.mp3',
      userInfo: { type: 'achievement' },
    });
  }

  // Show milestone notification
  showMilestoneNotification(milestone: string): void {
    if (!this.initialized) return;

    PushNotification.localNotification({
      channelId: this.CHANNEL_ID,
      title: '🎉 Milestone Reached!',
      message: milestone,
      playSound: true,
      soundName: 'level_up.mp3',
      userInfo: { type: 'milestone' },
    });
  }

  // Timer notification (for native timer integration)
  showTimerNotification(timeRemaining: string, isWarning: boolean = false): void {
    if (!this.initialized || Platform.OS !== 'android') return;

    const notificationId = 99999; // Special ID for timer notification
    
    PushNotification.localNotification({
      id: notificationId,
      channelId: this.CHANNEL_ID,
      title: isWarning ? '⚠️ Time Almost Up!' : '⏱️ BrainBites Timer',
      message: `${timeRemaining} remaining`,
      ongoing: true, // Makes it persistent
      autoCancel: false,
      playSound: false,
      vibrate: isWarning,
      smallIcon: 'ic_notification',
      largeIcon: 'ic_launcher',
      priority: 'high',
      visibility: 'public',
      userInfo: { type: 'timer' },
      actions: ['Stop', 'Add Time'],
    });
  }

  // Update timer notification
  updateTimerNotification(timeRemaining: string): void {
    this.showTimerNotification(timeRemaining, false);
  }

  // Clear timer notification
  clearTimerNotification(): void {
    if (Platform.OS === 'android') {
      PushNotification.cancelLocalNotification({ id: '99999' });
    }
  }

  // Cancel all notifications
  cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  // Get scheduled notifications (for debugging)
  async getScheduledNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        resolve(notifications);
      });
    });
  }
}

export default new NotificationService();