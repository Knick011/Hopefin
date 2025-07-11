import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
} from 'react-native';
import SoundService from '../services/SoundService';

const { width, height } = Dimensions.get('window');

interface PeekingMascotProps {
  onPress?: () => void;
  side?: 'left' | 'right';
  peekInterval?: number;
  peekDuration?: number;
}

const PeekingMascot: React.FC<PeekingMascotProps> = ({
  onPress,
  side = 'right',
  peekInterval = 20000, // Peek every 20 seconds
  peekDuration = 3000, // Stay visible for 3 seconds
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isPeeking, setIsPeeking] = useState(false);
  
  useEffect(() => {
    let peekTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;
    
    const startPeekCycle = () => {
      peekTimer = setTimeout(() => {
        if (!isPeeking) {
          peek();
        }
      }, peekInterval);
    };
    
    const peek = () => {
      setIsPeeking(true);
      
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      // Auto-hide after duration
      hideTimer = setTimeout(() => {
        hide();
      }, peekDuration);
    };
    
    const hide = () => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsPeeking(false);
        // Start next cycle
        startPeekCycle();
      });
    };
    
    // Start the first peek cycle
    startPeekCycle();
    
    return () => {
      clearTimeout(peekTimer);
      clearTimeout(hideTimer);
    };
  }, [isPeeking, peekInterval, peekDuration]);
  
  const handlePress = () => {
    // Play tap sound
    SoundService.playButtonPress();
    
    // Animate tap
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPeeking(false);
      onPress?.();
    });
  };
  
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: side === 'left' ? [-100, 0] : [100, 0],
  });
  
  return (
    <Animated.View
      style={[
        styles.container,
        side === 'left' ? styles.leftSide : styles.rightSide,
        {
          transform: [{ translateX }],
        },
      ]}
      pointerEvents={isPeeking ? 'auto' : 'none'}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.touchable}
      >
        <Image
          source={require('../assets/images/mascot_peeking.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: height * 0.3,
    width: 100,
    height: 100,
    zIndex: 999,
  },
  leftSide: {
    left: -20,
  },
  rightSide: {
    right: -20,
  },
  touchable: {
    width: '100%',
    height: '100%',
  },
  mascot: {
    width: '100%',
    height: '100%',
  },
});

export default PeekingMascot;