import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import services
import QuizService from '../services/QuizService';
import EnhancedTimerService from '../services/EnhancedTimerService';
import SoundService from '../services/SoundService';
import ScoreService from '../services/ScoreService';

// Import components
import Mascot from '../components/Mascot';
import PeekingMascot from '../components/PeekingMascot';

// Types
interface QuizScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any, any>;
}

interface Question {
  id: number;
  category: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Progress state
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [category] = useState(route.params?.category || 'funfacts');
  
  // Points and rewards
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streakLevel, setStreakLevel] = useState(0);
  const [isStreakMilestone, setIsStreakMilestone] = useState(false);
  
  // Mascot state
  const [showMascot, setShowMascot] = useState(false);
  const [mascotType, setMascotType] = useState<'happy' | 'excited' | 'thoughtful' | 'encouraging' | 'celebration' | 'sad'>('happy');
  const [mascotMessage, setMascotMessage] = useState('');
  const [mascotEnabled, setMascotEnabled] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const pointsSlideAnim = useRef(new Animated.Value(0)).current;
  const explanationAnim = useRef(new Animated.Value(0)).current;
  
  // Create animation values for each option
  const optionAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  useEffect(() => {
    initializeQuiz();
    
    // Handle back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true;
    });
    
    return () => backHandler.remove();
  }, []);
  
  const initializeQuiz = async () => {
    try {
      // Load quiz data
      await QuizService.initialize();
      
      // Load user preferences
      const mascotSetting = await AsyncStorage.getItem('brainbites_show_mascot');
      if (mascotSetting !== null) {
        setMascotEnabled(mascotSetting === 'true');
      }
      
      // Load score info
      const scoreInfo = ScoreService.getScoreInfo();
      setTotalScore(scoreInfo.totalScore);
      setStreak(scoreInfo.currentStreak);
      
      // Load first question
      loadQuestion();
      
      // Show welcome mascot after a delay
      setTimeout(() => {
        if (mascotEnabled) {
          setMascotType('happy');
          setMascotMessage('Welcome to the quiz! 🎯\n\nTake your time and think carefully. You\'ve got this! 💪');
          setShowMascot(true);
        }
      }, 1000);
    } catch (error) {
      console.error('Error initializing quiz:', error);
      Alert.alert('Error', 'Failed to load quiz. Please try again.');
      navigation.goBack();
    }
  };
  
  const loadQuestion = async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
    
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.95);
    optionAnims.forEach(anim => anim.setValue(0));
    
    try {
      const question = await QuizService.getRandomQuestion(category);
      if (question) {
        setCurrentQuestion(question);
        
        // Animate question entrance
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Animate options with stagger
        const staggerDelay = 100;
        optionAnims.forEach((anim, index) => {
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            delay: 300 + (index * staggerDelay),
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        });
        
        setIsLoading(false);
      } else {
        // No more questions
        Alert.alert(
          'Quiz Complete!',
          'You\'ve answered all available questions in this category.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error loading question:', error);
      setIsLoading(false);
    }
  };
  
  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer !== null) return;
    
    // Play selection sound
    SoundService.playButtonPress();
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion?.correctAnswer;
    setIsCorrect(correct);
    
    // Update statistics
    setQuestionsAnswered(prev => prev + 1);
    
    if (correct) {
      // Play success sound
      SoundService.playCorrectAnswer();
      
      // Update correct answers and streak
      setCorrectAnswers(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Check for milestone
      const milestone = checkStreakMilestone(newStreak);
      setIsStreakMilestone(milestone);
      
      // Calculate points
      const basePoints = 10;
      const streakBonus = Math.floor(newStreak / 5) * 5;
      const points = basePoints + streakBonus + (milestone ? 50 : 0);
      setPointsEarned(points);
      
      // Update score
      ScoreService.addPoints(points, newStreak);
      setTotalScore(prev => prev + points);
      
      // Add time reward
      const timeReward = milestone ? 120 : 30; // 2 minutes for milestone, 30 seconds otherwise
      await EnhancedTimerService.addTime(timeReward);
      
      // Show points animation
      showPointsAnimationEffect();
      
      // Show success mascot
      if (mascotEnabled) {
        showSuccessMascot(milestone);
      }
    } else {
      // Play wrong answer sound
      SoundService.playWrongAnswer();
      
      // Reset streak
      setStreak(0);
      ScoreService.resetStreak();
      
      // Show explanation after a delay
      setTimeout(() => {
        setShowExplanation(true);
        animateExplanation();
        
        // Show explanation mascot
        if (mascotEnabled) {
          showExplanationMascot();
        }
      }, 1000);
    }
  };
  
  const checkStreakMilestone = (currentStreak: number): boolean => {
    // Milestones at 5, 10, 15, 20, etc.
    return currentStreak > 0 && currentStreak % 5 === 0;
  };
  
  const showPointsAnimationEffect = () => {
    setShowPointsAnimation(true);
    
    Animated.parallel([
      Animated.timing(pointsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pointsSlideAnim, {
        toValue: -30,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(pointsAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowPointsAnimation(false);
          pointsSlideAnim.setValue(0);
        });
      }, 1500);
    });
  };
  
  const animateExplanation = () => {
    Animated.spring(explanationAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  const showSuccessMascot = (milestone: boolean) => {
    if (milestone) {
      setMascotType('celebration');
      setMascotMessage(`🎉 AMAZING! ${streak} in a row! 🎉\n\nYou earned 2 bonus minutes of app time!\n\nKeep this streak going! 🔥`);
    } else {
      const messages = [
        'Correct! Well done! 🌟',
        'You got it! Great job! 👏',
        'Excellent! Keep it up! 💪',
        'Perfect! You\'re on fire! 🔥',
        'Brilliant answer! 🧠',
      ];
      setMascotType('excited');
      setMascotMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
    setShowMascot(true);
  };
  
  const showExplanationMascot = () => {
    if (!currentQuestion) return;
    
    setMascotType('thoughtful');
    setMascotMessage(`The correct answer was "${currentQuestion.correctAnswer}".\n\n${currentQuestion.explanation}\n\nDon't worry, you'll get the next one! 💪`);
    setShowMascot(true);
  };
  
  const handleContinue = () => {
    // Play button sound
    SoundService.playButtonPress();
    
    // Hide mascot
    setShowMascot(false);
    
    // Load next question
    loadQuestion();
  };
  
  const handleGoBack = () => {
    Alert.alert(
      'Leave Quiz?',
      'Your progress will be saved. Are you sure you want to leave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            SoundService.playButtonPress();
            navigation.goBack();
          },
        },
      ]
    );
  };
  
  const handleMascotDismiss = () => {
    setShowMascot(false);
  };
  
  const handlePeekingMascotPress = () => {
    if (!mascotEnabled) return;
    
    setMascotType('encouraging');
    setMascotMessage(`You're doing great! 💪\n\n🔥 Current streak: ${streak}\n⭐ Score: ${totalScore.toLocaleString()}\n✅ Correct: ${correctAnswers}/${questionsAnswered}`);
    setShowMascot(true);
  };
  
  const renderOption = (optionKey: string, index: number) => {
    if (!currentQuestion) return null;
    
    const option = currentQuestion.options[optionKey as keyof typeof currentQuestion.options];
    const isSelected = selectedAnswer === optionKey;
    const isCorrectOption = optionKey === currentQuestion.correctAnswer;
    const showResult = selectedAnswer !== null;
    
    let backgroundColor = '#FFFFFF';
    let borderColor = '#E0E0E0';
    let textColor = '#333333';
    let iconName = null;
    let iconColor = '#FFFFFF';
    
    if (showResult) {
      if (isCorrectOption) {
        backgroundColor = '#4CAF50';
        borderColor = '#4CAF50';
        textColor = '#FFFFFF';
        iconName = 'check-circle';
        iconColor = '#FFFFFF';
      } else if (isSelected && !isCorrect) {
        backgroundColor = '#F44336';
        borderColor = '#F44336';
        textColor = '#FFFFFF';
        iconName = 'close-circle';
        iconColor = '#FFFFFF';
      }
    } else if (isSelected) {
      borderColor = '#FF9F1C';
    }
    
    return (
      <Animated.View
        key={optionKey}
        style={[
          styles.optionContainer,
          {
            opacity: optionAnims[index],
            transform: [{
              translateX: optionAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.option,
            { backgroundColor, borderColor },
          ]}
          onPress={() => handleAnswerSelect(optionKey)}
          disabled={selectedAnswer !== null}
          activeOpacity={0.7}
        >
          <View style={styles.optionContent}>
            <View style={[styles.optionLabel, { backgroundColor: borderColor }]}>
              <Text style={[styles.optionLabelText, { color: textColor }]}>{optionKey}</Text>
            </View>
            <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
            {iconName && (
              <Icon name={iconName} size={24} color={iconColor} style={styles.optionIcon} />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9F1C" />
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8E7" />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.statsContainer}>
            <Icon name="fire" size={20} color="#FF6B6B" />
            <Text style={styles.statsText}>{streak}</Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <Icon name="star" size={20} color="#FFD700" />
            <Text style={styles.scoreText}>{totalScore.toLocaleString()}</Text>
          </View>
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(correctAnswers / Math.max(questionsAnswered, 1)) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {correctAnswers}/{questionsAnswered} correct
          </Text>
        </View>
        
        {/* Question */}
        <Animated.View
          style={[
            styles.questionContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Text style={styles.categoryText}>{category.toUpperCase()}</Text>
          <Text style={styles.questionText}>{currentQuestion?.question}</Text>
        </Animated.View>
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {['A', 'B', 'C', 'D'].map((option, index) => renderOption(option, index))}
        </View>
        
        {/* Explanation */}
        {showExplanation && (
          <Animated.View
            style={[
              styles.explanationContainer,
              {
                opacity: explanationAnim,
                transform: [{
                  scale: explanationAnim,
                }],
              },
            ]}
          >
            <Icon name="lightbulb-outline" size={24} color="#FF9F1C" />
            <Text style={styles.explanationTitle}>Explanation</Text>
            <Text style={styles.explanationText}>{currentQuestion?.explanation}</Text>
          </Animated.View>
        )}
        
        {/* Points animation */}
        {showPointsAnimation && (
          <Animated.View
            style={[
              styles.pointsAnimation,
              {
                opacity: pointsAnim,
                transform: [{
                  translateY: pointsSlideAnim,
                }],
              },
            ]}
          >
            <Icon name="star" size={20} color="#FFD700" style={styles.pointsIcon} />
            <Text style={styles.pointsText}>+{pointsEarned}</Text>
          </Animated.View>
        )}
        
        {/* Continue button */}
        {selectedAnswer !== null && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={['#FF9F1C', '#FF7043']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Next Question</Text>
              <Icon name="arrow-right" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* Mascot */}
      {showMascot && mascotEnabled && (
        <Mascot
          type={mascotType}
          message={mascotMessage}
          onDismiss={handleMascotDismiss}
          position="bottom"
          autoHide={true}
          autoHideDelay={5000}
        />
      )}
      
      {/* Peeking Mascot */}
      {!showMascot && mascotEnabled && (
        <PeekingMascot
          onPress={handlePeekingMascotPress}
          side="right"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#777',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scoreText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF9F1C',
    marginBottom: 12,
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionContainer: {
    marginBottom: 12,
  },
  option: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  optionIcon: {
    marginLeft: 12,
  },
  explanationContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9F1C',
    marginTop: 8,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    textAlign: 'center',
  },
  pointsAnimation: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pointsIcon: {
    marginRight: 8,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  continueButton: {
    marginTop: 'auto',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default QuizScreen;