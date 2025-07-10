// src/screens/LeaderboardScreen.tsx
import React from 'react';
import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '@/utils/constants';
import { useNavigation } from '@react-navigation/native';

const LeaderboardScreen = () => {
    const navigation = useNavigation();
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Leaderboard</Text>
          <View style={{ width: 28 }} />
        </View>
        
        <View style={styles.content}>
          <Icon name="podium" size={80} color={Colors.primary} />
          <Text style={styles.message}>Leaderboard Screen</Text>
          <Text style={styles.info}>Coming soon...</Text>
        </View>
      </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors.textPrimary,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    message: {
      fontSize: 32,
      fontWeight: 'bold',
      color: Colors.textPrimary,
      marginTop: 24,
    },
    info: {
      fontSize: 16,
      color: Colors.textLight,
      marginTop: 16,
    },
  });
  export default LeaderboardScreen;