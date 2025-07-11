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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriesButton: {
    padding: 8,
    marginRight: 8,
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
  timeGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 20,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  difficultyContainer: {
    marginBottom: 24,
  },
  difficultyButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  difficultyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  difficultyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  difficultyLevel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  difficultyDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  categoriesModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  categoriesContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  categoryItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
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
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  categoriesContainer: {
    marginBottom: 24,
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
  timeCardContent: {
    alignItems: 'center',
  },
});

export default HomeScreen;import React, { useState, useEffect } from 'react';
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

const { width, height } = Dimensions.get('window');

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
  const [showCategories, setShowCategories] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const easyAnim = useRef(new Animated.Value(0)).current;
  const mediumAnim = useRef(new Animated.Value(0)).current;
  const hardAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    loadData();
    checkMascotSettings();
    
    // Add timer listener
    const updateTime = (time: number) => setAvailableTime(time);
    EnhancedTimerService.addListener(updateTime);
    
    // Start animations
    animateEntrance();
    
    // Show welcome mascot after delay
    const timer = setTimeout(() => {
      if (mascotEnabled) {
        showWelcomeMascot();
      }
    }, 1500);
    
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

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(easyAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(450),
        Animated.spring(mediumAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(600),
        Animated.spring(hardAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

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
      `Welcome back! 🌟\n\nYou have ${EnhancedTimerService.formatTime(availableTime)} of app time.\nChoose a difficulty to get started!`,
      `Hey there, champion! 🏆\n\nYour streak is ${scoreInfo.dailyStreak} days!\nWhich difficulty will you conquer today?`,
      `Ready to grow your brain? 🧠\n\nPick your challenge level and let's learn something amazing!`,
    ];
    
    setMascotType('happy');
    setMascotMessage(messages[Math.floor(Math.random() * messages.length)]);
    setShowMascot(true);
  };

  const handleDifficultyPress = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    SoundService.playButtonPress();
    setShowCategories(false);
    
    // Navigate to quiz with difficulty
    navigation.navigate('Quiz', { 
      category: 'All',
      difficulty: difficulty 
    });
  };

  const handleCategoryPress = (categoryId: string) => {
    SoundService.playButtonPress();
    
    // Navigate to quiz with category
    navigation.navigate('Quiz', { 
      category: categoryId,
      difficulty: 'Mixed' 
    });
  };

  const toggleCategories = () => {
    SoundService.playButtonPress();
    
    if (showCategories) {
      // Hide categories
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setShowCategories(false);
      });
    } else {
      // Show categories
      setShowCategories(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSettingsPress = () => {
    SoundService.playButtonPress();
    navigation.navigate('Settings');
  };

  const handlePeekingMascotPress = () => {
    const stats = `📊 Your Stats:\n\n⏱️ Time: ${EnhancedTimerService.formatTime(availableTime)}\n⭐ Score: ${scoreInfo.totalScore.toLocaleString()}\n🔥 Daily Streak: ${scoreInfo.dailyStreak} days\n\nKeep up the great work! 💪`;
    
    setMascotType('encouraging');
    setMascotMessage(stats);
    setShowMascot(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.appTitle}>BrainBites</Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          onPress={toggleCategories}
          style={styles.categoriesButton}
        >
          <Icon name="apps" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
          <Icon name="cog" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTimeDisplay = () => (
    <Animated.View style={[styles.timeCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.timeGradient}
      >
        <Icon name="timer" size={32} color="#FFFFFF" />
        <Text style={styles.timeLabel}>Available Time</Text>
        <Text style={styles.timeValue}>{EnhancedTimerService.formatTime(availableTime)}</Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderDifficultyButtons = () => {
    const difficulties = [
      { level: 'Easy' as const, color: '#4CAF50', icon: 'emoticon-happy', anim: easyAnim },
      { level: 'Medium' as const, color: '#FF9800', icon: 'emoticon-neutral', anim: mediumAnim },
      { level: 'Hard' as const, color: '#F44336', icon: 'emoticon-cool', anim: hardAnim },
    ];

    return (
      <View style={styles.difficultyContainer}>
        <Text style={styles.sectionTitle}>Choose Your Difficulty</Text>
        {difficulties.map((diff) => (
          <Animated.View
            key={diff.level}
            style={[
              styles.difficultyButton,
              {
                opacity: diff.anim,
                transform: [
                  {
                    scale: diff.anim,
                  },
                  {
                    translateY: diff.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleDifficultyPress(diff.level)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[diff.color, diff.color + 'DD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.difficultyGradient}
              >
                <Icon name={diff.icon} size={40} color="#FFFFFF" />
                <View style={styles.difficultyInfo}>
                  <Text style={styles.difficultyLevel}>{diff.level}</Text>
                  <Text style={styles.difficultyDescription}>
                    {diff.level === 'Easy' && 'Perfect for beginners'}
                    {diff.level === 'Medium' && 'A balanced challenge'}
                    {diff.level === 'Hard' && 'Test your knowledge'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderStats = () => (
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Icon name="star" size={20} color={Colors.score} />
        <Text style={styles.statValue}>{scoreInfo.totalScore.toLocaleString()}</Text>
      </View>
      <View style={styles.statItem}>
        <Icon name="fire" size={20} color={Colors.streak} />
        <Text style={styles.statValue}>{scoreInfo.dailyStreak} days</Text>
      </View>
    </View>
  );

  const renderCategoriesModal = () => (
    <Animated.View
      style={[
        styles.categoriesModal,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={toggleCategories}
      />
      <View style={styles.categoriesContent}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Categories</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.categoriesGrid}>
            {Categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <Icon name={category.icon} size={32} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderTimeDisplay()}
        {renderStats()}
        {renderDifficultyButtons()}
      </ScrollView>

      {/* Categories Modal */}
      {showCategories && renderCategoriesModal()}

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