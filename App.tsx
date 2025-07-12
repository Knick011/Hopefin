import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  LogBox,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import services
import EnhancedTimerService from './src/services/EnhancedTimerService';
import SoundService from './src/services/SoundService';
import QuizService from './src/services/QuizService';
import ScoreService from './src/services/ScoreService';

// Import constants
import { Colors } from './src/utils/constants';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Non-serializable values were found in the navigation state',
]);

export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Quiz: { category?: string; difficulty?: string };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing BrainBites...');

      // Check if first launch
      const hasLaunchedBefore = await AsyncStorage.getItem('brainbites_onboarding_complete');
      setIsFirstLaunch(hasLaunchedBefore !== 'true');

      // Initialize services in order
      await SoundService.initialize();
      console.log('✓ Sound service initialized');

      await QuizService.initialize();
      console.log('✓ Quiz service initialized');

      await ScoreService.loadSavedData();
      console.log('✓ Score service initialized');

      // Initialize timer service with native timer
      await EnhancedTimerService.initialize();
      console.log('✓ Timer service initialized');

      // Small delay for smooth transition
      setTimeout(() => {
        setIsInitializing(false);
        console.log('✅ BrainBites initialization complete!');
      }, 500);
    } catch (error) {
      console.error('❌ Initialization error:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error');
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading BrainBites...</Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <Text style={styles.errorText}>Failed to initialize app</Text>
        <Text style={styles.errorDetail}>{initError}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isFirstLaunch ? 'Welcome' : 'Home'}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default App;