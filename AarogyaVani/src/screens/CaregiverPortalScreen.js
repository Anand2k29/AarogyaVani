import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { colors, typography } from '../theme/colors';
import { getUserProfileSync } from '../services/syncService';

export default function CaregiverPortalScreen({ route, navigation }) {
  const { patientId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState('Pending...');

  useEffect(() => {
    async function loadPatient() {
      if (patientId) {
        const profile = await getUserProfileSync(patientId);
        if (profile?.fullName) setPatientName(profile.fullName);
        else setPatientName(`Patient ${patientId.slice(0,6)}`);
      }
      setLoading(false);
    }
    loadPatient();
  }, [patientId]);

  const handleShareSummary = async () => {
    try {
      await Share.share({
        message: `📋 AarogyaVani Care Summary — Linked Patient: ${patientId}\n\n💊 Medications Today: 2 taken, 0 skipped\n📊 Today's Adherence: 100%\n📅 Upcoming Appointments: 1 scheduled\n🆘 Emergency Contacts: 2 Active`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🔗 Securely Linking to Patient...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.successHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.successTitle}>Active Connection</Text>
            <Text style={styles.patientId}>Care Anchor for: {patientName}</Text>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareSummary}>
            <Text style={styles.shareText}>📤 Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Health Summary</Text>
        
        {/* 4 Stat Cards */}
        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💊</Text>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>MEDS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statIcon, {color: '#4CAF50'}]}>📊</Text>
            <Text style={[styles.statValue, {color: '#4CAF50'}]}>92%</Text>
            <Text style={styles.statLabel}>ADHERENCE</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>APPTS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statIcon, {color: colors.primary}]}>🆘</Text>
            <Text style={[styles.statValue, {color: colors.primary}]}>2</Text>
            <Text style={styles.statLabel}>CONTACTS</Text>
          </View>
        </View>

        {/* Remote Actions */}
        <Text style={styles.sectionTitle}>Shared Health Records</Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Appointments', { isCaregiver: true, patientId })}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Set Appointment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('AddRecord', { patientId })}
          >
            <Text style={styles.actionIcon}>📁</Text>
            <Text style={styles.actionText}>Add Records</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Events */}
        <View style={styles.whiteCard}>
          <Text style={styles.cardHeader}>Recent Activity</Text>
          <View style={styles.eventItem}>
            <Text style={styles.eventLabel}>Last Dose Logged</Text>
            <Text style={styles.eventTime}>Today, 8:45 AM (Taken)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.eventItem}>
            <Text style={styles.eventLabel}>Upcoming Reminder</Text>
            <Text style={styles.eventTime}>Today, 9:00 PM (Dinner Dose)</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.sosTestButton}
          onPress={() => Alert.alert("SOS Status", "No emergency alerts received. Patient's safety module is active.")}
        >
          <Text style={styles.sosTestText}>📡 View Live SOS Monitor</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.backButtonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.title,
    color: colors.primary,
  },
  successHeader: {
    backgroundColor: colors.primary,
    padding: 25,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successTitle: {
    ...typography.header,
    color: '#fff',
    fontSize: 22,
  },
  patientId: {
    ...typography.body,
    color: '#fff',
    opacity: 0.9,
    fontSize: 12,
    marginTop: 5,
  },
  shareButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  shareText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    marginBottom: 15,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    width: '23%',
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  statValue: {
    ...typography.title,
    fontSize: 16,
    color: colors.text,
  },
  statLabel: {
    fontSize: 8,
    color: '#888',
    marginTop: 2,
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3F2FD',
    elevation: 2,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  actionText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  whiteCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    ...typography.title,
    fontSize: 16,
    marginBottom: 15,
    color: colors.primary,
  },
  eventItem: {
    marginVertical: 8,
  },
  eventLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  eventTime: {
    ...typography.body,
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  sosTestButton: {
    backgroundColor: '#FFF0F5',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    marginBottom: 20,
  },
  sosTestText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 16,
  },
  backButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    ...typography.button,
  }
});
