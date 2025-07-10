// src/screens/SettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { RootStackParamList } from '@/navigation/AppNavigator';
import useStore from '@/store/useStore';
import { Colors, Fonts, Spacing, Layout } from '@/utils/constants';
import SoundService from '@/services/SoundService';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { 
    soundEnabled, 
    setSoundEnabled, 
    musicEnabled, 
    setMusicEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    dailyLoginStreak,
    resetStore
  } = useStore();

  const handleBackPress = () => {
    SoundService.playButtonPress();
    navigation.goBack();
  };

  const handleSoundToggle = () => {
    SoundService.playButtonPress();
    setSoundEnabled(!soundEnabled);
  };

  const handleMusicToggle = () => {
    SoundService.playButtonPress();
    setMusicEnabled(!musicEnabled);
  };

  const handleNotificationsToggle = () => {
    SoundService.playButtonPress();
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleResetProgress = () => {
    SoundService.playButtonPress();
    // Add confirmation dialog here in the future
    resetStore();
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    showSwitch = false,
    switchValue = false,
    delay = 0
  ) => (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
      style={styles.settingItem}
    >
      <TouchableOpacity
        style={styles.settingContent}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <Icon name={icon} size={24} color={Colors.primary} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          </View>
        </View>
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onPress}
            trackColor={{ false: Colors.textLight, true: Colors.primary }}
            thumbColor={Colors.surface}
          />
        ) : (
          <Icon name="chevron-right" size={24} color={Colors.textLight} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-left" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 28 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Sound Settings */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Audio</Text>
          {renderSettingItem(
            'volume-high',
            'Sound Effects',
            'Play sound effects during gameplay',
            handleSoundToggle,
            true,
            soundEnabled,
            300
          )}
          {renderSettingItem(
            'music',
            'Background Music',
            'Play music in menus and during gameplay',
            handleMusicToggle,
            true,
            musicEnabled,
            400
          )}
        </Animated.View>

        {/* Notification Settings */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingItem(
            'bell',
            'Push Notifications',
            'Receive reminders and achievements',
            handleNotificationsToggle,
            true,
            notificationsEnabled,
            600
          )}
        </Animated.View>

        {/* Stats */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(700)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="fire" size={24} color={Colors.error} />
              <Text style={styles.statValue}>{dailyLoginStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* Data Management */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Data</Text>
          {renderSettingItem(
            'refresh',
            'Reset Progress',
            'Clear all progress and start fresh',
            handleResetProgress,
            false,
            false,
            900
          )}
        </Animated.View>

        {/* About */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(1000)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>About</Text>
          {renderSettingItem(
            'information',
            'Version',
            'BrainBites v1.0.0',
            () => {},
            false,
            false,
            1100
          )}
          {renderSettingItem(
            'heart',
            'Made with ❤️',
            'For learning and fun',
            () => {},
            false,
            false,
            1200
          )}
        </Animated.View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  settingItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    ...Layout.shadow.small,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  statsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    ...Layout.shadow.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});

export default SettingsScreen; 