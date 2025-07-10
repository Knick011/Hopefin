import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TestScreen = () => {
  return (
    <View style={styles.container}>
      <Icon name="brain" size={80} color="#FF9F1C" />
      <Text style={styles.title}>BrainBites is Ready!</Text>
      <Text style={styles.subtitle}>React Native 0.80.1 with New Architecture</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFCF2',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9F1C',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default TestScreen;