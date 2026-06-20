import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors, typography } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      
      if (!idToken) {
        throw new Error('No ID token received from Google. Please try again.');
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);
      // Navigation boundary automatically handles transition in App.js listener
    } catch (error) {
      // Don't show alert if user simply cancelled the sign-in
      if (error?.code === 'SIGN_IN_CANCELLED' || error?.code === '12501') {
        // User cancelled - do nothing
      } else {
        console.error('Google Login Error:', error);
        alert('Failed to login with Google. ' + (error?.message || ''));
      }
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>AarogyaVani</Text>
          <Text style={styles.subtitle}>Your AI Healthcare Companion</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>Sign in to access your prescriptions and anchored users.</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
               <ActivityIndicator color={colors.surface} />
            ) : (
               <Text style={styles.buttonText}>Continue with Google</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  title: {
    ...typography.header,
    fontSize: 42,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    ...typography.body,
    fontSize: 18,
    color: colors.primaryLight,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 30,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    minHeight: 55,
    justifyContent: 'center'
  },
  buttonText: {
    ...typography.button,
  },
});
