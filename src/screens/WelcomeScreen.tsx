// src/screens/WelcomeScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';

import { RootStackParamList } from '@/navigation/AppNavigator';
import useStore from '@/store/useStore';
import { Colors, Fonts, Spacing } from '@/utils/constants';
import SoundService from '@/services/SoundService';

const { width, height } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useStore();
  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Check if onboarding is already completed
    if (hasCompletedOnboarding) {
      navigation.replace('Home');
      return;
    }

    // Start animations
    scale.value = withSpring(1, { damping: 15 });
    rotation.value = withSequence(
      withDelay(500, withSpring(-5)),
      withSpring(5),
      withSpring(0)
    );

    // Play welcome music
    SoundService.playMenuMusic();
  }, [hasCompletedOnboarding, navigation, scale, rotation]);

  const animatedBrainStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handleGetStarted = () => {
    SoundService.playButtonPress();
    setHasCompletedOnboarding(true);
    navigation.replace('Home');
  };

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            entering={FadeIn.duration(600)}
            style={styles.logoContainer}
          >
            <Animated.View style={animatedBrainStyle}>
              <Icon name="brain" size={120} color={Colors.textOnPrimary} />
            </Animated.View>
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(600).delay(300)}
            style={styles.textContainer}
          >
            <Text style={styles.title}>BrainBites</Text>
            <Text style={styles.subtitle}>Learn & Earn Screen Time!</Text>
          </Animated.View>

          <Animated.View
            entering={SlideInDown.duration(600).delay(600)}
            style={styles.descriptionContainer}
          >
            <Text style={styles.description}>
              Answer questions correctly to earn screen time for your favorite apps.
              The more you learn, the more you play!
            </Text>
          </Animated.View>

          <Animated.View
            entering={SlideInDown.duration(600).delay(900)}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>Get Started</Text>
              <Icon name="arrow-right" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textOnPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Fonts.sizes.xl,
    color: Colors.textOnPrimary,
    opacity: 0.9,
  },
  descriptionContainer: {
    marginBottom: Spacing.xxl,
    maxWidth: width * 0.8,
  },
  description: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textOnPrimary,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 30,
    gap: Spacing.sm,
  },
  startButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
});

export default WelcomeScreen;