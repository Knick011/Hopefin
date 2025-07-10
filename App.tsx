import React, { useEffect } from 'react';
import { StatusBar, Platform, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from '@/navigation/AppNavigator';
import TimerService from '@/services/TimerService';
import ScoreService from '@/services/ScoreService';
import QuizService from '@/services/QuizService';
import SoundService from '@/services/SoundService';
import useStore from '@/store/useStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App(): React.JSX.Element {
  const updateDailyLoginStreak = useStore(state => state.updateDailyLoginStreak);

  useEffect(() => {
    // Hide status bar for full screen
    StatusBar.setHidden(true);
    
    // For Android, set full screen mode
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }

    const initializeApp = async () => {
      try {
        await TimerService.initialize();
        await ScoreService.initialize();
        await QuizService.initialize();
        await SoundService.initialize();
        
        updateDailyLoginStreak();
        
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();

    return () => {
      TimerService.cleanup();
      SoundService.release();
    };
  }, [updateDailyLoginStreak]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <View style={{ flex: 1, backgroundColor: '#FFFCF2' }}>
            <AppNavigator />
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;