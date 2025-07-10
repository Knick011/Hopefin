// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '@/utils/constants';

// Screen imports (we'll create these next)
import WelcomeScreen from '@/screens/WelcomeScreen';
import HomeScreen from '@/screens/HomeScreen';
import QuizScreen from '@/screens/QuizScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import LeaderboardScreen from '@/screens/LeaderboardScreen';
import DailyGoalsScreen from '@/screens/DailyGoalsScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Quiz: {
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  };
  Settings: undefined;
  Leaderboard: undefined;
  DailyGoals: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="DailyGoals" component={DailyGoalsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;