// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { RootStackParamList } from '@/navigation/AppNavigator';
import useStore from '@/store/useStore';
import TimerService from '@/services/TimerService';
import ScoreService from '@/services/ScoreService';
import SoundService from '@/services/SoundService';
import { Colors, Fonts, Spacing, Layout } from '@/utils/constants';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { selectedDifficulty, setSelectedDifficulty, dailyLoginStreak } = useStore();
  const [availableTime, setAvailableTime] = useState(0);
  const [scoreInfo, setScoreInfo] = useState(ScoreService.getScoreInfo());

  useEffect(() => {
    // Subscribe to timer updates
    const unsubscribe = TimerService.addEventListener((data) => {
      setAvailableTime(data.availableTime);
    });

    // Play menu music
    SoundService.playMenuMusic();

    // Load score info
    setScoreInfo(ScoreService.getScoreInfo());

    return () => {
      unsubscribe();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(Math.abs(seconds) / 3600);
    const minutes = Math.floor((Math.abs(seconds) % 3600) / 60);
    const secs = Math.abs(seconds) % 60;
    
    const prefix = seconds < 0 ? '-' : '';
    
    if (hours > 0) {
      return `${prefix}${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${prefix}${minutes}m ${secs}s`;
    } else {
      return `${prefix}${secs}s`;
    }
  };

  const handleDifficultyPress = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    SoundService.playButtonPress();
    setSelectedDifficulty(difficulty);
    navigation.navigate('Quiz', { category: 'All', difficulty });
  };

  const renderDifficultyButton = (
    difficulty: 'Easy' | 'Medium' | 'Hard',
    icon: string,
    colors: string[],
    delay: number
  ) => (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
      style={styles.difficultyButtonWrapper}
    >
      <TouchableOpacity
        onPress={() => handleDifficultyPress(difficulty)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors}
          style={styles.difficultyButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name={icon} size={40} color={Colors.textOnPrimary} />
          <Text style={styles.difficultyText}>{difficulty}</Text>
          <Text style={styles.difficultySubtext}>
            {difficulty === 'Easy' && '1-2 grade level'}
            {difficulty === 'Medium' && '3-5 grade level'}
            {difficulty === 'Hard' && '6+ grade level'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.title}>BrainBites</Text>
          <TouchableOpacity
            onPress={() => {
              SoundService.playButtonPress();
              navigation.navigate('Settings');
            }}
          >
            <Icon name="cog" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <Icon name="timer" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{formatTime(availableTime)}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="fire" size={24} color={Colors.error} />
            <Text style={styles.statValue}>{dailyLoginStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="trophy" size={24} color={Colors.success} />
            <Text style={styles.statValue}>{scoreInfo.totalScore}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.quickActions}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              SoundService.playButtonPress();
              navigation.navigate('DailyGoals');
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.info, '#7986CB']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="target" size={24} color={Colors.textOnPrimary} />
              <Text style={styles.actionText}>Daily Goals</Text>
              <Icon name="chevron-right" size={24} color={Colors.textOnPrimary} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              SoundService.playButtonPress();
              navigation.navigate('Leaderboard');
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.accent, '#FFC107']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="podium" size={24} color={Colors.textPrimary} />
              <Text style={[styles.actionText, { color: Colors.textPrimary }]}>
                Leaderboard
              </Text>
              <Icon name="chevron-right" size={24} color={Colors.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Difficulty Selection */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(600)}
          style={styles.sectionContainer}
        >
          <Text style={styles.sectionTitle}>Choose Your Challenge</Text>
          
          {renderDifficultyButton(
            'Easy',
            'emoticon-happy',
            [Colors.easy, '#44B5AD'],
            700
          )}
          {renderDifficultyButton(
            'Medium',
            'emoticon-neutral',
            [Colors.medium, '#FF9800'],
            800
          )}
          {renderDifficultyButton(
            'Hard',
            'emoticon-cool',
            [Colors.hard, '#FF5252'],
            900
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
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.large,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.xs,
    ...Layout.shadow.medium,
  },
  statValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginVertical: Spacing.xs,
  },
  statLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  quickActions: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.large,
  },
  actionText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textOnPrimary,
    flex: 1,
    marginLeft: Spacing.md,
  },
  sectionContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  difficultyButtonWrapper: {
    marginBottom: Spacing.md,
  },
  difficultyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Layout.borderRadius.large,
    ...Layout.shadow.medium,
  },
  difficultyText: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textOnPrimary,
    flex: 1,
    marginLeft: Spacing.md,
  },
  difficultySubtext: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textOnPrimary,
    opacity: 0.8,
  },
});

export default HomeScreen;