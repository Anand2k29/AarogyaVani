import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { db, auth } from '../config/firebase';
import { subscribeToAppointments, addAppointmentSync } from '../services/syncService';
import { colors, typography } from '../theme/colors';

export default function AppointmentScreen({ route }) {
  const { isCaregiver, patientId } = route.params || {};
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Appointment Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    // Determine which patient we are watching
    const targetUserId = isCaregiver ? patientId : auth.currentUser?.uid;
    if (!targetUserId) return;

    const unsubscribe = subscribeToAppointments(targetUserId, (data) => {
      setAppointments(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleAddAppointment = async () => {
    if (!title || !date || !time) {
      Alert.alert("Input Required", "Please fill in all fields.");
      return;
    }

    setAdding(true);
    try {
      await addAppointmentSync({
        patientId: isCaregiver ? patientId : auth.currentUser?.uid,
        title,
        date,
        time,
        status: 'upcoming',
        dateTime: new Date(date + ' ' + time).toISOString()
      });
      
      setTitle('');
      setDate('');
      setTime('');
      Alert.alert("Success", "Appointment synchronized to patient's device!");
    } catch (e) {
      Alert.alert("Error", "Could not sync appointment: " + e.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Appointments</Text>
        <Text style={styles.subtitle}>
          {isCaregiver ? "Managing health for your family" : "Keep track of your doctor visits"}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Only Caregiver can add new appointments */}
        {isCaregiver && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeader}>Schedule Appointment</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Title (e.g. Cardiologist Checkup)" 
              value={title}
              onChangeText={setTitle}
            />
            <TextInput 
              style={styles.input} 
              placeholder="Date (YYYY-MM-DD)" 
              value={date}
              onChangeText={setDate}
            />
            <TextInput 
              style={styles.input} 
              placeholder="Time (HH:MM AM/PM)" 
              value={time}
              onChangeText={setTime}
            />
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddAppointment}
              disabled={adding}
            >
              {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>Sync Appointment</Text>}
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>📅 Upcoming Schedule</Text>
        {appointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No upcoming appointments scheduled.</Text>
          </View>
        ) : (
          appointments.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).map(appt => (
            <View key={appt.id} style={styles.apptCard}>
              <View style={styles.dateCircle}>
                <Text style={styles.dateDay}>{new Date(appt.date).getDate()}</Text>
                <Text style={styles.dateMonth}>{new Date(appt.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
              </View>
              <View style={styles.apptInfo}>
                <Text style={styles.apptTitle}>{appt.title}</Text>
                <Text style={styles.apptTime}>{appt.time}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{appt.status.toUpperCase()}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 40,
  },
  title: {
    ...typography.header,
    color: '#fff',
    fontSize: 24,
  },
  subtitle: {
    ...typography.body,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
    marginTop: -20,
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  cardHeader: {
    ...typography.title,
    fontSize: 18,
    marginBottom: 15,
    color: colors.primary,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.button,
    color: '#fff',
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    marginBottom: 15,
    color: colors.text,
  },
  dateCircle: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  dateDay: {
    ...typography.title,
    fontSize: 20,
    color: colors.primary,
    lineHeight: 22,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  apptInfo: {
    flex: 1,
  },
  apptCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  apptTitle: {
    ...typography.title,
    fontSize: 16,
    color: colors.primary,
  },
  apptTime: {
    ...typography.body,
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    padding: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
  }
});
