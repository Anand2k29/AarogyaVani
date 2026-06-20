import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { addHealthRecordSync } from '../services/syncService';
import { colors, typography } from '../theme/colors';

export default function AddHealthRecordScreen({ route, navigation }) {
  const { patientId } = route.params || {};
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!systolic || !diastolic || !pulse) {
      Alert.alert("Required Fields", "Please enter blood pressure and pulse readings.");
      return;
    }

    setLoading(true);
    try {
      await addHealthRecordSync({
        patientId,
        type: 'vitals',
        readings: {
          bloodPressure: `${systolic}/${diastolic}`,
          pulse: parseInt(pulse),
          weight: weight ? parseFloat(weight) : null
        },
        unit: 'mmHg / bpm / kg',
        date: new Date().toISOString()
      });

      Alert.alert("Success", "Health record synchronized to patient's PHI vault.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Failed to sync record: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Vitals Record</Text>
        <Text style={styles.subtitle}>Updating patient health telemetry</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Blood Pressure (Systolic / Diastolic)</Text>
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              placeholder="120" 
              keyboardType="numeric"
              value={systolic}
              onChangeText={setSystolic}
            />
            <Text style={styles.separator}>/</Text>
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              placeholder="80" 
              keyboardType="numeric"
              value={diastolic}
              onChangeText={setDiastolic}
            />
          </View>

          <Text style={styles.label}>Pulse Rate (bpm)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="72" 
            keyboardType="numeric"
            value={pulse}
            onChangeText={setPulse}
          />

          <Text style={styles.label}>Weight (kg - Optional)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="65.5" 
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save to PHI Vault</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🛡️ All health records are encrypted and stored in the patient's private AarogyaVani folder. Only linked caregivers can view this data.
          </Text>
        </View>
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
    padding: 25,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 40,
  },
  title: {
    ...typography.header,
    color: '#fff',
    fontSize: 22,
  },
  subtitle: {
    ...typography.body,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
    marginTop: -30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  label: {
    ...typography.body,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    fontSize: 24,
    marginHorizontal: 10,
    marginBottom: 20,
    color: '#ccc',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    ...typography.button,
    fontSize: 18,
  },
  infoBox: {
    marginTop: 25,
    padding: 15,
    backgroundColor: 'rgba(233,30,99,0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(233,30,99,0.1)',
  },
  infoText: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 18,
  }
});
