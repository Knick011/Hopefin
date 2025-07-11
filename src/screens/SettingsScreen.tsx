import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';

// Import services
import EnhancedTimerService from '../services/EnhancedTimerService';
import QuizService from '../services/QuizService';
import SoundService from '../services/SoundService';
import ScoreService from '../services/ScoreService';

// Import constants
import { Colors } from '../utils/constants';

interface SettingsScreenProps {
  navigation: NavigationProp<any>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [showMascot, setShowMascot] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [scoreInfo, setScoreInfo] = useState({
    totalScore: 0,
    highestStreak: 0,
    questionsAnswered: 0,
  });

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      // Load mascot setting
      const mascotEnabled = await AsyncStorage.getItem('brainbites_show_mascot');
      if (mascotEnabled !== null) {
        setShowMascot(mascotEnabled !== 'false');
      }

      // Load sounds setting
      const sounds = await SoundService.isSoundsEnabled();
      setSoundsEnabled(sounds);

      // Load notifications setting
      const notifications = await AsyncStorage.getItem('brainbites_notifications_enabled');
      if (notifications !== null) {
        setNotificationsEnabled(notifications !== 'false');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadStats = () => {
    const stats = ScoreService.getScoreInfo();
    setScoreInfo({
      totalScore: stats.totalScore,
      highestStreak: stats.highestStreak,
      questionsAnswered: stats.questionsAnswered,
    });
  };

  const handleToggleMascot = async (value: boolean) => {
    setShowMascot(value);
    await AsyncStorage.setItem('brainbites_show_mascot', value.toString());
    SoundService.playButtonPress();
  };

  const handleToggleSounds = async (value: boolean) => {
    setSoundsEnabled(value);
    await SoundService.setSoundsEnabled(value);
    if (value) {
      SoundService.playButtonPress();
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('brainbites_notifications_enabled', value.toString());
    SoundService.playButtonPress();
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset All Progress',
      'This will reset all your progress, scores, streaks, and earned time. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Reset all services
              await ScoreService.resetProgress();
              await QuizService.resetUsedQuestions();
              await EnhancedTimerService.resetProgress();
              
              // Clear all AsyncStorage data
              const keys = [
                'brainbites_score_data',
                'brainbites_timer_data',
                'brainbites_used_questions',
              ];
              await AsyncStorage.multiRemove(keys);
              
              SoundService.playButtonPress();
              Alert.alert('Success', 'All progress has been reset.');
              
              // Reload stats
              loadStats();
            } catch (error) {
              console.error('Error resetting progress:', error);
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    SoundService.playButtonPress();
    navigation.goBack();
  };

  const renderSettingItem = (
    icon: string,
    iconColor: string,
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Icon name={icon} size={24} color={iconColor} style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: Colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  const renderStatItem = (icon: string, value: string | number, label: string) => (
    <View style={styles.statItem}>
      <Icon name={icon} size={24} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsContainer}>
            {renderStatItem('star', scoreInfo.totalScore.toLocaleString(), 'Total Score')}
            {renderStatItem('fire', scoreInfo.highestStreak, 'Best Streak')}
            {renderStatItem('help-circle', scoreInfo.questionsAnswered, 'Questions')}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsContainer}>
            {renderSettingItem(
              'account-cowboy-hat',
              Colors.primary,
              'Show Mascot',
              'Display the helpful mascot character',
              showMascot,
              handleToggleMascot
            )}
            {renderSettingItem(
              'volume-high',
              Colors.info,
              'Sound Effects',
              'Play sounds for actions and events',
              soundsEnabled,
              handleToggleSounds
            )}
            {renderSettingItem(
              'bell',
              Colors.warning,
              'Notifications',
              'Receive reminders to play and learn',
              notificationsEnabled,
              handleToggleNotifications
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutContainer}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Questions Available</Text>
              <Text style={styles.aboutValue}>{QuizService.getQuestionCount()}</Text>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleResetProgress}
            activeOpacity={0.7}
          >
            <Icon name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.dangerButtonText}>Reset All Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ by BrainBites Team</Text>
          <Text style={styles.footerSubtext}>Keep learning, keep growing!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  settingsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  aboutContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default SettingsScreen;