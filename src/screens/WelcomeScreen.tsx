import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';

// Import services
import SoundService from '../services/SoundService';

// Import components
import Mascot from '../components/Mascot';

// Import constants
import { Colors } from '../utils/constants';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: NavigationProp<any>;
}

interface OnboardingPage {
  title: string;
  description: string;
  icon: string;
  color: string;
  mascotMessage: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showMascot, setShowMascot] = useState(false);
  const [mascotType, setMascotType] = useState<'happy' | 'excited' | 'thoughtful' | 'encouraging' | 'celebration' | 'sad'>('excited');
  const [mascotMessage, setMascotMessage] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const pages: OnboardingPage[] = [
    {
      title: 'Welcome to BrainBites!',
      description: 'Learn something new every day and earn time for your favorite apps!',
      icon: 'brain',
      color: Colors.primary,
      mascotMessage: "Hi there! I'm Brainy! 🧠\n\nI'll be your learning companion. Let's make learning fun and rewarding together!",
    },
    {
      title: 'Learn & Earn',
      description: 'Answer quiz questions correctly to earn screen time. The more you learn, the more you earn!',
      icon: 'timer',
      color: Colors.info,
      mascotMessage: "Every correct answer earns you time! ⏱️\n\nBuild streaks for bonus rewards. Learning has never been this rewarding!",
    },
    {
      title: 'Track Your Progress',
      description: 'Watch your knowledge grow with streaks, scores, and achievements!',
      icon: 'chart-line',
      color: Colors.success,
      mascotMessage: "I'll celebrate every milestone with you! 🎉\n\nFrom your first correct answer to amazing streaks, we're in this together!",
    },
    {
      title: 'Ready to Start?',
      description: "Let's begin your learning journey and make every moment count!",
      icon: 'rocket',
      color: Colors.primary,
      mascotMessage: "You're all set! 🚀\n\nLet's turn learning into your superpower. Ready when you are!",
    },
  ];

  React.useEffect(() => {
    // Play welcome sound
    SoundService.playMenuMusic();
    
    // Animate entrance
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
    ]).start();

    // Show mascot after delay
    setTimeout(() => {
      updateMascotForPage(0);
    }, 1000);
  }, []);

  const updateMascotForPage = (pageIndex: number) => {
    const page = pages[pageIndex];
    const mascotTypes: Array<'happy' | 'excited' | 'thoughtful' | 'encouraging' | 'celebration' | 'sad'> = ['excited', 'happy', 'encouraging', 'celebration'];
    
    setMascotType(mascotTypes[pageIndex]);
    setMascotMessage(page.mascotMessage);
    setShowMascot(true);
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      SoundService.playButtonPress();
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
      
      // Update mascot for new page
      setTimeout(() => {
        updateMascotForPage(nextPage);
      }, 300);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    SoundService.playButtonPress();
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('brainbites_onboarding_complete', 'true');
      navigation.replace('Home');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      navigation.replace('Home');
    }
  };

  const renderPage = (page: OnboardingPage, index: number) => (
    <View key={index} style={styles.page}>
      <Animated.View
        style={[
          styles.pageContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: page.color + '20' }]}>
          <Icon name={page.icon} size={80} color={page.color} />
        </View>
        
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </Animated.View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {pages.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentPage === index && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {pages.map((page, index) => renderPage(page, index))}
      </ScrollView>

      {renderDots()}

      <View style={styles.buttonContainer}>
        {currentPage < pages.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextText}>Next</Text>
                <Icon name="arrow-right" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={handleNext} style={styles.startButton}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startText}>Get Started</Text>
              <Icon name="rocket" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Mascot */}
      {showMascot && (
        <Mascot
          type={mascotType}
          message={mascotMessage}
          onDismiss={() => setShowMascot(false)}
          position="bottom"
          size="large"
          autoHide={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pageContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
  },
  description: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary + '40',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  startButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  startText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default WelcomeScreen;import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';

// Import services
import SoundService from '../services/SoundService';

// Import components
import Mascot from '../components/Mascot';

// Import constants
import { Colors } from '../utils/constants';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: NavigationProp<any>;
}

interface OnboardingPage {
  title: string;
  description: string;
  icon: string;
  color: string;
  mascotMessage: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showMascot, setShowMascot] = useState(false);
  const [mascotType, setMascotType] = useState<'happy' | 'excited' | 'thoughtful' | 'encouraging' | 'celebration' | 'sad'>('excited');
  const [mascotMessage, setMascotMessage] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const pages: OnboardingPage[] = [
    {
      title: 'Welcome to BrainBites!',
      description: 'Learn something new every day and earn time for your favorite apps!',
      icon: 'brain',
      color: Colors.primary,
      mascotMessage: "Hi there! I'm Brainy! 🧠\n\nI'll be your learning companion. Let's make learning fun and rewarding together!",
    },
    {
      title: 'Learn & Earn',
      description: 'Answer quiz questions correctly to earn screen time. The more you learn, the more you earn!',
      icon: 'timer',
      color: Colors.info,
      mascotMessage: "Every correct answer earns you time! ⏱️\n\nBuild streaks for bonus rewards. Learning has never been this rewarding!",
    },
    {
      title: 'Track Your Progress',
      description: 'Watch your knowledge grow with streaks, scores, and achievements!',
      icon: 'chart-line',
      color: Colors.success,
      mascotMessage: "I'll celebrate every milestone with you! 🎉\n\nFrom your first correct answer to amazing streaks, we're in this together!",
    },
    {
      title: 'Ready to Start?',
      description: "Let's begin your learning journey and make every moment count!",
      icon: 'rocket',
      color: Colors.primary,
      mascotMessage: "You're all set! 🚀\n\nLet's turn learning into your superpower. Ready when you are!",
    },
  ];

  React.useEffect(() => {
    // Play welcome sound
    SoundService.playMenuMusic();
    
    // Animate entrance
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
    ]).start();

    // Show mascot after delay
    setTimeout(() => {
      updateMascotForPage(0);
    }, 1000);
  }, []);

  const updateMascotForPage = (pageIndex: number) => {
    const page = pages[pageIndex];
    const mascotTypes: Array<'happy' | 'excited' | 'thoughtful' | 'encouraging' | 'celebration' | 'sad'> = ['excited', 'happy', 'encouraging', 'celebration'];
    
    setMascotType(mascotTypes[pageIndex]);
    setMascotMessage(page.mascotMessage);
    setShowMascot(true);
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      SoundService.playButtonPress();
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
      
      // Update mascot for new page
      setTimeout(() => {
        updateMascotForPage(nextPage);
      }, 300);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    SoundService.playButtonPress();
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('brainbites_onboarding_complete', 'true');
      navigation.replace('Home');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      navigation.replace('Home');
    }
  };

  const renderPage = (page: OnboardingPage, index: number) => (
    <View key={index} style={styles.page}>
      <Animated.View
        style={[
          styles.pageContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: page.color + '20' }]}>
          <Icon name={page.icon} size={80} color={page.color} />
        </View>
        
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </Animated.View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {pages.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentPage === index && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {pages.map((page, index) => renderPage(page, index))}
      </ScrollView>

      {renderDots()}

      <View style={styles.buttonContainer}>
        {currentPage < pages.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextText}>Next</Text>
                <Icon name="arrow-right" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={handleNext} style={styles.startButton}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startText}>Get Started</Text>
              <Icon name="rocket" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Mascot */}
      {showMascot && (
        <Mascot
          type={mascotType}
          message={mascotMessage}
          onDismiss={() => setShowMascot(false)}
          position="bottom"
          size="large"
          autoHide={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pageContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
  },
  description: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary + '40',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  startButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  startText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default WelcomeScreen;