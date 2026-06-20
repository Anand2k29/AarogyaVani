import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { triggerSOSSync, subscribeToMedications, subscribeToAppointments, getUserProfileSync } from '../services/syncService';
import { colors, typography } from '../theme/colors';
import { getMedications, getAdherenceLogs, logAdherence } from '../services/storage';


export default function DashboardScreen({ navigation }) {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [meds, setMeds] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [logs, setLogs] = useState({});
  const [sosActive, setSosActive] = useState(false);

  const [userName, setUserName] = useState('AarogyaVani User');

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    let unsubMeds = () => {};
    let unsubAppts = () => {};

    try {
      unsubMeds = subscribeToMedications(userId, (data) => {
        setMeds(data);
      });
    } catch (e) {
      console.error('Failed to subscribe to medications:', e);
    }

    try {
      unsubAppts = subscribeToAppointments(userId, (data) => {
        setAppointments(data);
      });
    } catch (e) {
      console.error('Failed to subscribe to appointments:', e);
    }

    async function loadProfile() {
      try {
        const profile = await getUserProfileSync(userId);
        if (profile?.fullName) setUserName(profile.fullName);
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
    }
    loadProfile();

    return () => {
      unsubMeds();
      unsubAppts();
    };
  }, []);

  const handleToggleMed = async (medId) => {
    const today = new Date().toISOString().split('T')[0];
    const isTaken = logs[today] && logs[today][medId];
    const newLogs = await logAdherence(today, medId, !isTaken);
    if (newLogs) setLogs(newLogs);
  };

  const triggerSOS = async () => {
    setSosActive(true);
    const userId = auth.currentUser?.uid || "mock-user-123";
    
    try {
      await triggerSOSSync(userId);
      setSosActive(false);
      Alert.alert(
        "EMERGENCY ALERT SENT!",
        "Your Care Anchors have been notified via cloud sync and help is on the way."
      );
    } catch (e) {
      setSosActive(false);
      Alert.alert("SOS Error", "Could not sync emergency alert. Please call emergency services directly.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigation listener in App.js will detect this and redirect
    } catch (e) {
      console.error('Failed to logout.', e);
    }
  };

  // Generate a mock unique anchoring code for this user
  const anchorCode = `aarogyavani://anchor/${auth?.currentUser?.uid || "mock-id-12345"}`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Hello,</Text>
            <Text style={styles.nameText}>{userName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {/* SOS Emergency Button */}
        <TouchableOpacity 
          style={[styles.sosButton, sosActive && styles.sosButtonActive]} 
          onPress={triggerSOS}
        >
          <Text style={styles.sosButtonText}>🆘 SOS EMERGENCY</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.scanCard]} 
          onPress={() => navigation.navigate('Scanner')}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>📸 Scan Prescription</Text>
            <Text style={styles.cardTag}>AI POWERED</Text>
          </View>
          <Text style={styles.cardDesc}>Extract medicine info, dosage, and translate instructions instantly.</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.smallCard, styles.apptCard]} 
            onPress={() => navigation.navigate('Appointments', { isCaregiver: false })}
          >
            <Text style={styles.smallCardIcon}>📅</Text>
            <Text style={styles.smallCardTitle}>Schedule ({appointments.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.smallCard, styles.insightsCard]} 
            onPress={() => navigation.navigate('Insights')}
          >
            <Text style={styles.smallCardIcon}>📈</Text>
            <Text style={styles.smallCardTitle}>Insights</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.card, styles.anchorCard]} 
          onPress={() => setQrModalVisible(true)}
        >
          <Text style={styles.cardTitle}>🔗 Link Care Anchor</Text>
          <Text style={styles.cardDesc}>Allow family members to monitor prescriptions and assist with checkups.</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* QR Code Modal for Anchoring */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Care Anchor QR</Text>
            <Text style={styles.modalDesc}>
              Have your family member scan this code with their AarogyaVani app to securely link accounts.
            </Text>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={anchorCode}
                size={200}
                color="black"
                backgroundColor="white"
              />
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={() => setQrModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    paddingBottom: 40,
  },
  welcomeText: {
    ...typography.body,
    color: '#fff',
    fontSize: 18,
    opacity: 0.9,
  },
  nameText: {
    ...typography.header,
    color: '#fff',
    fontSize: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightsBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  insightsBtnText: {
    ...typography.body,
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardContainer: {
    padding: 20,
    marginTop: -25,
  },
  card: {
    padding: 25,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  scanCard: {
    backgroundColor: colors.surface,
  },
  wellnessCard: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  anchorCard: {
    backgroundColor: '#FFEBF0',
    borderWidth: 1,
    borderColor: '#FFD1DC',
  },
  cardTitle: {
    ...typography.title,
    fontSize: 20,
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTag: {
    fontSize: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    color: colors.primary,
    fontWeight: 'bold',
  },
  cardDesc: {
    ...typography.body,
    fontSize: 14,
    color: '#555',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  smallCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  smallCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  smallCardTitle: {
    ...typography.title,
    fontSize: 15,
  },
  apptCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#BBDEFB',
  },
  insightsCard: {
    backgroundColor: '#F3E5F5',
    borderColor: '#E1BEE7',
  },
  logoutContainer: {
    padding: 20,
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4d4d',
    alignItems: 'center',
  },
  logoutText: {
    ...typography.button,
    color: '#ff4d4d',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    ...typography.title,
    fontSize: 22,
    marginBottom: 15,
    color: colors.primary,
  },
  modalDesc: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  qrContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 30,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  closeButtonText: {
    ...typography.button,
  },
  sosButton: {
    backgroundColor: '#FF3B30',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  sosButtonActive: {
    backgroundColor: '#B00020',
    transform: [{ scale: 0.98 }],
  },
  sosButtonText: {
    ...typography.button,
    fontSize: 20,
    letterSpacing: 1.2,
  },
  adherenceCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  streakDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  streakDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  streakText: {
    ...typography.body,
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  medicationSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    marginBottom: 15,
    color: colors.textSector,
  },
  emptyText: {
    ...typography.body,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medItemTaken: {
    backgroundColor: '#F1F8E9',
    borderColor: '#A5D6A7',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 15,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  medNameTaken: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  medTime: {
    fontSize: 12,
    color: '#888',
  },
  reportContainer: {
    width: '100%',
    marginBottom: 20,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  reportLabel: {
    ...typography.body,
    fontSize: 16,
  },
  reportValue: {
    ...typography.title,
    fontSize: 16,
    color: colors.primary,
  }
});
