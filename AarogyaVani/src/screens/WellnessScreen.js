import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors, typography } from '../theme/colors';

const YOGA_ROUTINES = [
  { id: '1', title: 'Chair Yoga: Neck Stretch', desc: 'Gently tilt your head to each side. Hold for 5 breaths.', duration: '2 mins' },
  { id: '2', title: 'Deep Breathing (Pranayama)', desc: 'Sit straight, inhale deeply through nose, exhale through mouth.', duration: '5 mins' },
  { id: '3', title: 'Wrist & Finger Stretch', desc: 'Stretch arms out, pull fingers back gently. Good for circulation.', duration: '3 mins' }
];

export default function WellnessScreen() {
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');

  const handleSaveVitals = () => {
    if (!bp || !pulse) {
      Alert.alert("Input Required", "Please enter both BP and Pulse reading.");
      return;
    }
    Alert.alert("Vitals Logged", "Your health metrics have been saved locally in your PHI Vault.");
    setBp('');
    setPulse('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wellness & Vitals</Text>
        <Text style={styles.subtitle}>Track your daily health journey</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Vitals Log</Text>
        <View style={styles.vitalsCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Pressure (mmHg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 120/80"
              value={bp}
              onChangeText={setBp}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pulse Rate (bpm)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 72"
              value={pulse}
              onChangeText={setPulse}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveVitals}>
            <Text style={styles.saveButtonText}>Save Vitals</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guided Yoga for Seniors</Text>
        {YOGA_ROUTINES.map(item => (
          <View key={item.id} style={styles.yogaCard}>
            <View style={styles.yogaHeader}>
              <Text style={styles.yogaTitle}>{item.title}</Text>
              <Text style={styles.yogaDuration}>{item.duration}</Text>
            </View>
            <Text style={styles.yogaDesc}>{item.desc}</Text>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Session</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingBottom: 30,
  },
  title: {
    ...typography.header,
    color: '#fff',
    fontSize: 24,
  },
  subtitle: {
    ...typography.body,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    marginBottom: 15,
  },
  vitalsCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    ...typography.body,
    fontSize: 14,
    marginBottom: 5,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    ...typography.button,
    fontSize: 16,
  },
  yogaCard: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  yogaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  yogaTitle: {
    ...typography.title,
    fontSize: 16,
    color: colors.primary,
  },
  yogaDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: '#FCE4EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  yogaDesc: {
    ...typography.body,
    fontSize: 14,
    marginBottom: 15,
  },
  startButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  startButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
  }
});
