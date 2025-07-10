// src/screens/QuizScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  BackHandler,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

import { RootStackParamList } from '@/navigation/AppNavigator';
import { Colors, Fonts, Spacing, Layout, Question } from '@/utils/constants';
import QuizService from '@/services/QuizService';
import TimerService from '@/services/TimerService';
import ScoreService from '@/services/ScoreService';
import SoundService from '@/services/SoundService';
import useStore from '@/store/useStore';

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList, 'Quiz'>;
type RoutePropType = RouteProp<RootStackParamList, 'Quiz'>;

const QuizScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { category, difficulty } = route.params;
  
  const { setCurrentStreak } = useStore();
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [streakCount, setStreakCount] = useState(0);
  const [timeEarned, setTimeEarned] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  });
  
  // Animation values
  const buttonScales = {
    A: useSharedValue(1),
    B: useSharedValue(1),
    C: useSharedValue(1),
    D: useSharedValue(1),
  };
  const progressWidth = useSharedValue(0);
  const streakScale = useSharedValue(1);

  // Move useAnimatedStyle hooks to top level
  const buttonAnimatedStyles = {
    A: useAnimatedStyle(() => ({
      transform: [{ scale: buttonScales.A.value }],
    })),
    B: useAnimatedStyle(() => ({
      transform: [{ scale: buttonScales.B.value }],
    })),
    C: useAnimatedStyle(() => ({
      transform: [{ scale: buttonScales.C.value }],
    })),
    D: useAnimatedStyle(() => ({
      transform: [{ scale: buttonScales.D.value }],
    })),
  };
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));
  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));
  
  useEffect(() => {
    loadNewQuestion();
    
    // Handle back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => {
      backHandler.remove();
      SoundService.stopMusic();
    };
  }, []);
  
  useEffect(() => {
    // Update progress animation
    const progress = (sessionStats.correctAnswers / Math.max(1, sessionStats.totalQuestions)) * 100;
    progressWidth.value = withSpring(progress);
  }, [sessionStats]);
  
  const loadNewQuestion = () => {
    const question = QuizService.getRandomQuestion(category, difficulty);
    
    if (!question) {
      Alert.alert(
        'No Questions Available',
        'Unable to load questions. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
  };
  
  const handleAnswerSelect = async (option: string) => {
    if (selectedAnswer) return;
    
    // Animate button press
    buttonScales[option as keyof typeof buttonScales].value = withSequence(
      withSpring(0.9),
      withSpring(1)
    );
    
    const correct = option === currentQuestion?.correctAnswer;
    
    setSelectedAnswer(option);
    setIsCorrect(correct);
    setShowExplanation(true);
    
    // Update session stats
    const newStats = {
      ...sessionStats,
      totalQuestions: sessionStats.totalQuestions + 1,
      correctAnswers: correct ? sessionStats.correctAnswers + 1 : sessionStats.correctAnswers,
      wrongAnswers: correct ? sessionStats.wrongAnswers : sessionStats.wrongAnswers + 1,
    };
    setSessionStats(newStats);
    
    if (correct) {
      SoundService.playCorrect();
      
      // Update streak
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      setCurrentStreak(newStreak);
      
      // Animate streak
      streakScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      
      // Calculate time earned
      const baseTime = 30;
      let bonusTime = 0;
      
      if (ScoreService.checkStreakMilestone(newStreak)) {
        bonusTime = 120; // 2 minutes bonus
        SoundService.playStreak();
      }
      
      const totalTimeAdded = baseTime + bonusTime;
      await TimerService.addEarnedTime(totalTimeAdded);
      setTimeEarned(timeEarned + totalTimeAdded);
      
      // Update score
      await ScoreService.addCorrectAnswer();
    } else {
      SoundService.playWrong();
      
      // Reset streak
      setStreakCount(0);
      setCurrentStreak(0);
      await ScoreService.addWrongAnswer();
    }
    
    // Auto-advance after delay
    setTimeout(() => {
      handleNextQuestion();
    }, 2500);
  };
  
  const handleNextQuestion = () => {
    setQuestionNumber(questionNumber + 1);
    loadNewQuestion();
  };
  
  const handleSkipQuestion = () => {
    SoundService.playButtonPress();
    handleNextQuestion();
  };
  
  const handleBackPress = () => {
    Alert.alert(
      'Exit Quiz?',
      'Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          onPress: () => {
            navigation.goBack();
          }
        },
      ]
    );
    return true;
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };
  
  const renderOption = (option: 'A' | 'B' | 'C' | 'D') => {
    const isSelected = selectedAnswer === option;
    const isCorrectOption = option === currentQuestion?.correctAnswer;
    const showResult = selectedAnswer !== null;
    
    let colors = ['#FFFFFF', '#F5F5F5'];
    let textColor = Colors.textPrimary;
    let iconName = null;
    
    if (showResult) {
      if (isCorrectOption) {
        colors = [Colors.success, '#44B5AD'];
        textColor = Colors.textOnPrimary;
        iconName = 'check-circle';
      } else if (isSelected && !isCorrect) {
        colors = [Colors.error, '#FF5252'];
        textColor = Colors.textOnPrimary;
        iconName = 'close-circle';
      }
    }
    // Use the precomputed animated style
    const animatedStyle = buttonAnimatedStyles[option];
    
    return (
      <Animated.View
        key={option}
        entering={SlideInRight.delay(100 * ['A', 'B', 'C', 'D'].indexOf(option))}
        style={[styles.optionWrapper, animatedStyle]}
      >
        <TouchableOpacity
          onPress={() => handleAnswerSelect(option)}
          disabled={selectedAnswer !== null}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors}
            style={[
              styles.optionButton,
              showResult && !isCorrectOption && !isSelected && styles.optionDisabled,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={[styles.optionLabel, { backgroundColor: colors[0] }]}> 
              <Text style={[styles.optionLetter, { color: textColor }]}>{option}</Text>
            </View>
            <Text style={[styles.optionText, { color: textColor }]}> 
              {currentQuestion?.options[option]}
            </Text>
            {iconName && (
              <Icon name={iconName} size={24} color={textColor} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="close" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.categoryText}>{category} • {difficulty}</Text>
            <Text style={styles.questionNumber}>Question {questionNumber}</Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
          </View>
        </View>
        
        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Icon name="fire" size={20} color={Colors.error} />
            <Animated.Text style={[styles.statValue, streakAnimatedStyle]}>
              {streakCount}
            </Animated.Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="timer" size={20} color={Colors.primary} />
            <Text style={styles.statValue}>+{formatTime(timeEarned)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="check" size={20} color={Colors.success} />
            <Text style={styles.statValue}>
              {sessionStats.correctAnswers}/{sessionStats.totalQuestions}
            </Text>
          </View>
        </View>
        
        {/* Question */}
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.questionContainer}
        >
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </Animated.View>
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {(['A', 'B', 'C', 'D'] as const).map(renderOption)}
        </View>
        
        {/* Explanation */}
        {showExplanation && (
          <Animated.View
            entering={FadeIn}
            style={styles.explanationContainer}
          >
            <Icon
              name={isCorrect ? 'lightbulb-on' : 'information'}
              size={24}
              color={isCorrect ? Colors.success : Colors.warning}
            />
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </Animated.View>
        )}
        
        {/* Skip Button */}
        {!selectedAnswer && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipQuestion}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip Question</Text>
            <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 36,
  },
  categoryText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  questionNumber: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.large,
    gap: Spacing.xs,
    ...Layout.shadow.small,
  },
  statValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
  },
  questionContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Layout.borderRadius.large,
    marginBottom: Spacing.xl,
    minHeight: 120,
    justifyContent: 'center',
    ...Layout.shadow.medium,
  },
  questionText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: Spacing.lg,
  },
  optionWrapper: {
    marginBottom: Spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.medium,
    ...Layout.shadow.small,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    opacity: 0.9,
  },
  optionLetter: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
  },
  optionText: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    lineHeight: 22,
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    ...Layout.shadow.small,
  },
  explanationText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  skipText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
});

export default QuizScreen;