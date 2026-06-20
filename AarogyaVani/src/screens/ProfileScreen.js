import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors, typography } from '../theme/colors';
import { auth, db } from '../config/firebase';
import { getUserProfileSync, updateUserProfileSync } from '../services/syncService';

const UIInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      placeholderTextColor="#999"
    />
  </View>
);

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    age: '',
    emergencyContact: '',
    healthNotes: '',
    bloodGroup: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const data = await getUserProfileSync(userId);
        if (data) {
          setProfile({
            fullName: data.fullName || '',
            age: data.age || '',
            emergencyContact: data.emergencyContact || '',
            healthNotes: data.healthNotes || '',
            bloodGroup: data.bloodGroup || ''
          });
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setSaving(true);
    try {
      await updateUserProfileSync(userId, profile);
      Alert.alert("Success", "Profile updated in the AarogyaVani cloud.");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. " + error.message);
    } finally {
      setSaving(false);
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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.fullName?.charAt(0) || '👤'}</Text>
        </View>
        <Text style={styles.headerTitle}>{profile.fullName || 'User Profile'}</Text>
        <Text style={styles.headerSubtitle}>{auth.currentUser?.email}</Text>
      </View>

      <View style={styles.form}>
        <UIInput 
          label="Full Name" 
          value={profile.fullName} 
          onChangeText={(t) => setProfile({...profile, fullName: t})} 
          placeholder="Enter your name"
        />
        <UIInput 
          label="Age" 
          value={profile.age} 
          onChangeText={(t) => setProfile({...profile, age: t})} 
          placeholder="e.g. 72"
          keyboardType="numeric"
        />
        <UIInput 
          label="Emergency Contact" 
          value={profile.emergencyContact} 
          onChangeText={(t) => setProfile({...profile, emergencyContact: t})} 
          placeholder="Mobile number"
          keyboardType="phone-pad"
        />
        <UIInput 
          label="Blood Group" 
          value={profile.bloodGroup} 
          onChangeText={(t) => setProfile({...profile, bloodGroup: t})} 
          placeholder="e.g. O+ve"
        />
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Health Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.healthNotes}
            onChangeText={(t) => setProfile({...profile, healthNotes: t})}
            placeholder="Chronic conditions, allergies, etc."
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={() => auth.signOut()}
        >
          <Text style={styles.signOutText}>Sign Out Securely</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.primary,
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
  },
  headerTitle: {
    ...typography.header,
    color: '#fff',
    fontSize: 22,
  },
  headerSubtitle: {
    ...typography.body,
    color: '#fff',
    opacity: 0.8,
    fontSize: 12,
  },
  form: {
    padding: 20,
    paddingTop: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    ...typography.title,
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    color: colors.text,
    fontSize: 16,
    elevation: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  saveButtonText: {
    ...typography.button,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signOutButton: {
    marginTop: 25,
    padding: 15,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FF5252',
    fontWeight: 'bold',
  }
});
