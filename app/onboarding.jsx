import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedApp: '',
    otherApp: '',
    motivations: {
      lovedOnes: { selected: false, details: '' },
      hobbies: { selected: false, details: '' },
      physicalActivity: { selected: false, details: '' },
      other: { selected: false, details: '' },
    },
    nudgeFrequency: {
      type: 'interval', // 'interval' or 'surprise'
      interval: 5,
      unit: 'minutes', // 'minutes' or 'seconds'
    },
  });

  const apps = [
    { id: 'facebook', name: 'Facebook', packageName: 'com.facebook.katana' },
    { id: 'instagram', name: 'Instagram', packageName: 'com.instagram.android' },
    { id: 'x', name: 'X (Twitter)', packageName: 'com.twitter.android' },
    { id: 'tiktok', name: 'TikTok', packageName: 'com.zhiliaoapp.musically' },
    { id: 'other', name: 'Other', packageName: null },
  ];

  const motivationOptions = [
    { id: 'lovedOnes', label: 'Spend more time with my loved ones' },
    { id: 'hobbies', label: 'Dedicate my time to hobbies' },
    { id: 'physicalActivity', label: 'Do physical activity' },
    { id: 'other', label: 'Other' },
  ];

  const handleAppSelection = (appId) => {
    setFormData(prev => ({ ...prev, selectedApp: appId }));
  };

  const handleMotivationToggle = (motivationId) => {
    setFormData(prev => ({
      ...prev,
      motivations: {
        ...prev.motivations,
        [motivationId]: {
          ...prev.motivations[motivationId],
          selected: !prev.motivations[motivationId].selected,
        },
      },
    }));
  };

  const handleMotivationDetails = (motivationId, details) => {
    setFormData(prev => ({
      ...prev,
      motivations: {
        ...prev.motivations,
        [motivationId]: {
          ...prev.motivations[motivationId],
          details,
        },
      },
    }));
  };

  const handleNudgeFrequencyChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      nudgeFrequency: {
        ...prev.nudgeFrequency,
        [type]: value,
      },
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.selectedApp) {
          Alert.alert('Selection Required', 'Please select an app to monitor.');
          return false;
        }
        if (formData.selectedApp === 'other' && !formData.otherApp.trim()) {
          Alert.alert('App Name Required', 'Please specify which app you want to monitor.');
          return false;
        }
        return true;
      case 2:
        const hasSelectedMotivation = Object.values(formData.motivations).some(m => m.selected);
        if (!hasSelectedMotivation) {
          Alert.alert('Motivation Required', 'Please select at least one reason for reducing app usage.');
          return false;
        }
        return true;
      case 3:
        if (formData.nudgeFrequency.type === 'interval' && (!formData.nudgeFrequency.interval || formData.nudgeFrequency.interval <= 0)) {
          Alert.alert('Invalid Interval', 'Please enter a valid time interval.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        completeOnboarding();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingData', JSON.stringify(formData));
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      Alert.alert('Setup Complete!', 'Your preferences have been saved. You can now start using Nudge!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What is your poison? 🍎</Text>
      <Text style={styles.stepSubtitle}>Select the app you want to reduce time on:</Text>
      
      <View style={styles.optionsContainer}>
        {apps.map((app) => (
          <TouchableOpacity
            key={app.id}
            style={[
              styles.optionButton,
              formData.selectedApp === app.id && styles.optionButtonSelected,
            ]}
            onPress={() => handleAppSelection(app.id)}
          >
            <Text style={[
              styles.optionText,
              formData.selectedApp === app.id && styles.optionTextSelected,
            ]}>
              {app.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formData.selectedApp === 'other' && (
        <TextInput
          style={styles.textInput}
          placeholder="Enter app name..."
          value={formData.otherApp}
          onChangeText={(text) => setFormData(prev => ({ ...prev, otherApp: text }))}
        />
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Why reduce your usage? 🎯</Text>
      <Text style={styles.stepSubtitle}>Select your motivations (you can choose multiple):</Text>
      
      <View style={styles.motivationsContainer}>
        {motivationOptions.map((motivation) => (
          <View key={motivation.id} style={styles.motivationItem}>
            <TouchableOpacity
              style={[
                styles.motivationButton,
                formData.motivations[motivation.id].selected && styles.motivationButtonSelected,
              ]}
              onPress={() => handleMotivationToggle(motivation.id)}
            >
              <Text style={[
                styles.motivationText,
                formData.motivations[motivation.id].selected && styles.motivationTextSelected,
              ]}>
                {motivation.label}
              </Text>
            </TouchableOpacity>
            
            {formData.motivations[motivation.id].selected && (
              <TextInput
                style={styles.detailsInput}
                placeholder="Tell us more... (optional)"
                value={formData.motivations[motivation.id].details}
                onChangeText={(text) => handleMotivationDetails(motivation.id, text)}
                multiline
                numberOfLines={2}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How should we nudge you? ⏰</Text>
      <Text style={styles.stepSubtitle}>Choose your nudging preference:</Text>
      
      <View style={styles.nudgeOptionsContainer}>
        <TouchableOpacity
          style={[
            styles.nudgeOption,
            formData.nudgeFrequency.type === 'interval' && styles.nudgeOptionSelected,
          ]}
          onPress={() => handleNudgeFrequencyChange('type', 'interval')}
        >
          <Text style={[
            styles.nudgeOptionText,
            formData.nudgeFrequency.type === 'interval' && styles.nudgeOptionTextSelected,
          ]}>
            Every
          </Text>
        </TouchableOpacity>

        {formData.nudgeFrequency.type === 'interval' && (
          <View style={styles.intervalContainer}>
            <TextInput
              style={styles.intervalInput}
              value={formData.nudgeFrequency.interval.toString()}
              onChangeText={(text) => handleNudgeFrequencyChange('interval', parseInt(text) || 0)}
              keyboardType="numeric"
              placeholder="5"
            />
            
            <View style={styles.unitSelector}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  formData.nudgeFrequency.unit === 'minutes' && styles.unitButtonSelected,
                ]}
                onPress={() => handleNudgeFrequencyChange('unit', 'minutes')}
              >
                <Text style={[
                  styles.unitText,
                  formData.nudgeFrequency.unit === 'minutes' && styles.unitTextSelected,
                ]}>
                  minutes
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  formData.nudgeFrequency.unit === 'seconds' && styles.unitButtonSelected,
                ]}
                onPress={() => handleNudgeFrequencyChange('unit', 'seconds')}
              >
                <Text style={[
                  styles.unitText,
                  formData.nudgeFrequency.unit === 'seconds' && styles.unitTextSelected,
                ]}>
                  seconds
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.nudgeOption,
            formData.nudgeFrequency.type === 'surprise' && styles.nudgeOptionSelected,
          ]}
          onPress={() => handleNudgeFrequencyChange('type', 'surprise')}
        >
          <Text style={[
            styles.nudgeOptionText,
            formData.nudgeFrequency.type === 'surprise' && styles.nudgeOptionTextSelected,
          ]}>
            Surprise me! 🎲
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Setup Your Nudge</Text>
          <Text style={styles.stepIndicator}>Step {currentStep} of 3</Text>
        </View>

        {renderCurrentStep()}

        <View style={styles.navigationContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? 'Complete Setup' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#666',
  },
  stepContainer: {
    flex: 1,
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  motivationsContainer: {
    marginBottom: 20,
  },
  motivationItem: {
    marginBottom: 15,
  },
  motivationButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  motivationButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  motivationText: {
    fontSize: 16,
    color: '#333',
  },
  motivationTextSelected: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  detailsInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    marginTop: 10,
    minHeight: 60,
  },
  nudgeOptionsContainer: {
    marginBottom: 20,
  },
  nudgeOption: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  nudgeOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  nudgeOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  nudgeOptionTextSelected: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  intervalInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    width: 80,
    textAlign: 'center',
    marginRight: 10,
  },
  unitSelector: {
    flexDirection: 'row',
  },
  unitButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  unitButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  unitText: {
    fontSize: 14,
    color: '#333',
  },
  unitTextSelected: {
    color: '#fff',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    minWidth: 80,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
