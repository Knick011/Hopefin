import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import services
import EnhancedTimerService from '../services/EnhancedTimerService';
import ScoreService from '../services/ScoreService';
import SoundService from '../services/SoundService';

// Import components
import Mascot from '../components/Mascot';
import PeekingMascot from '../components/PeekingMascot';

// Import constants
import { Colors, Categories } from '../utils/constants';

interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [availableTime, setAvailableTime] = useState(0);
  const [scoreInfo, setScoreInfo] = useState({
    totalScore: 0,
    currentStreak: 0,
    dailyStreak: 0,
  });
  const [showMascot, setShowMascot] = useState(false);
  const [mascotType, setMascotType] = useState<'happy' | 'excited' | 'thoughtful' | 'encouraging' | 'celebration' | 'sad'>('happy');
  const [mascotMessage, setMascotMessage] = useState('');
  const [mascotEnabled, setMascotEnabled] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    checkMascotSettings();
    
    // Add timer listener
    const updateTime = (time: number) => setAvailableTime(time);
    EnhancedTimerService.addListener(updateTime);
    
    // Show welcome mascot after delay
    const timer = setTimeout(() => {
      if (mascotEnabled) {
        showWelcomeMascot();
      }
    }, 1000);
    
    return () => {
      EnhancedTimerService.removeListener(updateTime);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Refresh data when returning to home screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
      SoundService.playMenuMusic();
    });

    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    // Load timer data
    const time = EnhancedTimerService.getAvailableTime();
    setAvailableTime(time);
    
    // Load score data
    const score = ScoreService.getScoreInfo();
    setScoreInfo({
      totalScore: score.totalScore,
      currentStreak: score.currentStreak,
      dailyStreak: score.dailyStreak,
    });
  };

  const checkMascotSettings = async () => {
    const mascotSetting = await AsyncStorage.getItem('brainbites_show_mascot');
    setMascotEnabled(mascotSetting !== 'false');
  };

  const showWelcomeMascot = () => {
    const messages = [
      `Welcome back! 🌟\n\nYou have ${EnhancedTimerService.formatTime(availableTime)} of app time.\nReady to earn more?`,
      `Hey there, knowledge seeker! 🧠\n\nYour streak is ${scoreInfo.dailyStreak} days!\nLet's keep it going!`,
      `Great to see you! 🎯\n\nPick a category and let's learn something new today!`,
    ];
    
    setMascotType('happy');
    setMascotMessage(messages[Math.floor(Math.random() * messages.length)]);
    setShowMascot(true);
  };

  const handleCategoryPress = (categoryId: string) => {
    SoundService.playButtonPress();
    setSelectedCategory(categoryId);
    
    // Navigate to quiz after a short animation
    setTimeout(() => {
      navigation.navigate('Quiz', { category: categoryId });
    }, 200);
  };

  const handleSettingsPress = () => {
    SoundService.playButtonPress();
    navigation.navigate('Settings');
  };

  const handlePeekingMascotPress = () => {
    const stats = [
      `📊 Your Stats:\n\n⏱️ Time: ${EnhancedTimerService.formatTime(availableTime)}\n⭐ Score: ${scoreInfo.totalScore.toLocaleString()}\n🔥 Streak: ${scoreInfo.dailyStreak} days`,
      `Keep going! 💪\n\nYou're doing amazing!\nEvery question brings you closer to your goals!`,
      `Fun fact! 🌟\n\nDid you know that learning new things every day can improve your memory and cognitive abilities?`,
    ];
    
    setMascotType('encouraging');
    setMascotMessage(stats[Math.floor(Math.random() * stats.length)]);
    setShowMascot(true);
  };

  const renderTimeCard = () => (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.timeCard}
    >
      <View style={styles.timeCardContent}>
        <Icon name="timer" size={32} color="#FFFFFF" />
        <Text style={styles.timeLabel}>Available Time</Text>
        <Text style={styles.timeValue}>{EnhancedTimerService.formatTime(availableTime)}</Text>
      </View>
    </LinearGradient>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Icon name="star" size={24} color={Colors.score} />
        <Text style={styles.statValue}>{scoreInfo.totalScore.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Total Score</Text>
      </View>
      
      <View style={styles.statCard}>
        <Icon name="fire" size={24} color={Colors.streak} />
        <Text style={styles.statValue}>{scoreInfo.dailyStreak}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Choose a Category</Text>
      <View style={styles.categoriesGrid}>
        {Categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.categoryCardSelected,
            ]}
            onPress={() => handleCategoryPress(category.id)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[category.color, category.color + 'DD']}
              style={styles.categoryGradient}
            >
              <Icon name={category.icon} size={32} color="#FFFFFF" />
              <Text style={styles.categoryName}>{category.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>BrainBites</Text>
          <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
            <Icon name="cog" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Time Card */}
        {renderTimeCard()}

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Categories */}
        {renderCategories()}
      </ScrollView>

      {/* Mascot */}
      {showMascot && mascotEnabled && (
        <Mascot
          type={mascotType}
          message={mascotMessage}
          onDismiss={() => setShowMascot(false)}
          position="bottom"
          autoHide={true}
          autoHideDelay={5000}
        />
      )}

      {/* Peeking Mascot */}
      {!showMascot && mascotEnabled && (
        <PeekingMascot
          onPress={handlePeekingMascotPress}
          side="left"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
  },
  settingsButton: {
    padding: 8,
  },
  timeCard: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  timeCardContent: {
    padding: 24,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardSelected: {
    transform: [{ scale: 0.95 }],
  },
  categoryGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;