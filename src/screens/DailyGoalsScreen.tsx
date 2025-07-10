// src/screens/DailyGoalsScreen.tsx
import React from 'react';
import { StyleSheet, SafeAreaView, View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Fonts, Spacing } from '@/utils/constants';
const DailyGoalsScreen = () => {
    const navigation = useNavigation();
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Daily Goals</Text>
          <View style={{ width: 28 }} />
        </View>
        
        <View style={styles.content}>
          <Icon name="target" size={80} color={Colors.primary} />
          <Text style={styles.message}>Daily Goals Screen</Text>
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
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    title: {
      fontSize: Fonts.sizes.xl,
      fontWeight: Fonts.weights.bold,
      color: Colors.textPrimary,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    message: {
      fontSize: Fonts.sizes.xxl,
      fontWeight: Fonts.weights.bold,
      color: Colors.textPrimary,
      marginTop: Spacing.lg,
    },
    submessage: {
      fontSize: Fonts.sizes.lg,
      color: Colors.textSecondary,
      marginTop: Spacing.sm,
    },
    info: {
      fontSize: Fonts.sizes.md,
      color: Colors.textLight,
      marginTop: Spacing.md,
    },
  });

  export default DailyGoalsScreen ;