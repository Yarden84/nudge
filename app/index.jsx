import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('onboardingCompleted');
      if (completed === 'true') {
        setOnboardingCompleted(true);
      } else {
        // Redirect to onboarding if not completed
        router.replace('/onboarding');
        return;
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToOnboarding = () => {
    router.push('/onboarding');
  };

  const resetOnboarding = async () => {
    Alert.alert(
      'Reset Setup',
      'Are you sure you want to reset your setup? This will clear all your preferences.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('onboardingCompleted');
              await AsyncStorage.removeItem('onboardingData');
              router.replace('/onboarding');
            } catch (error) {
              console.error('Error resetting onboarding:', error);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Nudge! 📱</Text>
      <Text style={styles.subtitle}>
        Your app usage monitoring is ready to help you build healthier digital habits.
      </Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert('Coming Soon', 'App monitoring features will be implemented next!')}>
          <Text style={styles.primaryButtonText}>Start Monitoring</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={goToOnboarding}>
          <Text style={styles.secondaryButtonText}>View/Edit Setup</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetOnboarding}>
          <Text style={styles.resetButtonText}>Reset Setup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 300,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 15,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  resetButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
  },
});
