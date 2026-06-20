import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { colors, typography } from '../theme/colors';
import { subscribeToMedications } from '../services/syncService';
import { auth } from '../config/firebase';

export default function MedsScreen() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsubscribe = subscribeToMedications(userId, (data) => {
      setMeds(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleToggleMed = async (medId) => {
    // In a real cloud app, this would update a 'logs' collection in Firestore.
    // For now, we simulate the interaction.
    Alert.alert("Recorded", "Adherence state synchronized to your Care Anchor.");
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
        <Text style={styles.title}>Prescription Vault</Text>
        <Text style={styles.subtitle}>Daily adherence for your health</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.adherenceCard}>
          <Text style={styles.cardTitle}>7-Day Success</Text>
          <View style={styles.streakContainer}>
            {[...Array(7)].map((_, i) => (
              <View key={i} style={[styles.streakDot, i < 6 && styles.streakDotActive]} />
            ))}
          </View>
          <Text style={styles.streakText}>Status: Optimal consistency (94%)</Text>
        </View>

        <Text style={styles.sectionTitle}>Active Medications</Text>
        {meds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No medications found.</Text>
            <Text style={styles.emptySubtext}>Scan a prescription from the Home tab to add medications to your cloud vault.</Text>
          </View>
        ) : (
          meds.map(med => (
            <TouchableOpacity 
              key={med.id} 
              style={styles.medItem} 
              onPress={() => handleToggleMed(med.id)}
            >
              <View style={styles.checkbox} />
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medTime}>{med.dosage || 'As prescribed'}</Text>
              </View>
            </TouchableOpacity>
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
    marginTop: 10,
  },
  adherenceCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    ...typography.title,
    fontSize: 16,
    marginBottom: 10,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  streakDot: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  streakDotActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  streakText: {
    ...typography.body,
    fontSize: 14,
    color: '#388E3C',
    fontWeight: 'bold',
    marginTop: 10,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 15,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  medTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 10,
  },
  emptyText: {
    ...typography.title,
    fontSize: 18,
    color: '#888',
  },
  emptySubtext: {
    ...typography.body,
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 8,
  }
});
