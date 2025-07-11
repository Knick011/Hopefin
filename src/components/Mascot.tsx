import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SoundService from '../services/SoundService';

const { width, height } = Dimensions.get('window');

interface MascotProps {
  type?: 'happy' | 'excited' | 'thoughtful' | 'encouraging' | 'celebration' | 'sad' | 'peeking';
  message?: string;
  onDismiss?: () => void;
  onPress?: () => void;
  position?: 'left' | 'right' | 'center' | 'bottom';
  size?: 'small' | 'medium' | 'large';
  showBubble?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const Mascot: React.FC<MascotProps> = ({
  type = 'happy',
  message = '',
  onDismiss,
  onPress,
  position = 'center',
  size = 'medium',
  showBubble = true,
  autoHide = false,
  autoHideDelay = 5000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Continuous animations based on type
    if (type === 'excited' || type === 'celebration') {
      // Bouncing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else if (type === 'happy' || type === 'encouraging') {
      // Gentle wiggle
      Animated.loop(
        Animated.sequence([
          Animated.timing(wiggleAnim, {
            toValue: 5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: -5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
    
    // Auto-hide functionality
    if (autoHide && onDismiss) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [type, autoHide, autoHideDelay]);
  
  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };
  
  const handlePress = () => {
    // Play tap sound
    SoundService.playButtonPress();
    
    // Animate press
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress?.();
  };
  
  // Get mascot image based on type
  const getMascotImage = () => {
    const images = {
      happy: require('../assets/images/mascot_happy.png'),
      excited: require('../assets/images/mascot_excited.png'),
      thoughtful: require('../assets/images/mascot_thoughtful.png'),
      encouraging: require('../assets/images/mascot_encouraging.png'),
      celebration: require('../assets/images/mascot_celebration.png'),
      sad: require('../assets/images/mascot_sad.png'),
      peeking: require('../assets/images/mascot_peeking.png'),
    };
    
    return images[type] || images.happy;
  };
  
  // Get position styles
  const getPositionStyles = () => {
    const basePosition: any = {
      position: 'absolute',
    };
    
    switch (position) {
      case 'left':
        return {
          ...basePosition,
          bottom: 100,
          left: 20,
        };
      case 'right':
        return {
          ...basePosition,
          bottom: 100,
          right: 20,
        };
      case 'bottom':
        return {
          ...basePosition,
          bottom: 50,
          alignSelf: 'center',
        };
      case 'center':
      default:
        return {
          ...basePosition,
          top: '50%',
          left: '50%',
          transform: [
            { translateX: -75 },
            { translateY: -100 },
          ],
        };
    }
  };
  
  // Get size dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 80 };
      case 'large':
        return { width: 150, height: 150 };
      case 'medium':
      default:
        return { width: 120, height: 120 };
    }
  };
  
  const dimensions = getSizeDimensions();
  
  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyles(),
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: bounceAnim },
            { rotate: wiggleAnim.interpolate({
              inputRange: [-5, 5],
              outputRange: ['-5deg', '5deg'],
            })},
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.mascotContainer}
      >
        <Image
          source={getMascotImage()}
          style={[
            styles.mascotImage,
            dimensions,
          ]}
          resizeMode="contain"
        />
        
        {/* Speech bubble */}
        {showBubble && message && (
          <Animated.View
            style={[
              styles.bubble,
              {
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                }],
              },
            ]}
          >
            <Text style={styles.bubbleText}>{message}</Text>
            
            {/* Bubble tail */}
            <View style={styles.bubbleTail} />
            
            {/* Close button */}
            {onDismiss && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleDismiss}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  mascotContainer: {
    alignItems: 'center',
  },
  mascotImage: {
    // Dimensions set dynamically
  },
  bubble: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minWidth: 200,
    maxWidth: width * 0.7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default Mascot;