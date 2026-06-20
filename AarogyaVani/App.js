import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, Text } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { onAuthStateChanged } from 'firebase/auth';
import * as Linking from 'expo-linking';

import { auth } from './src/config/firebase';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MedsScreen from './src/screens/MedsScreen';
import WellnessScreen from './src/screens/WellnessScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import CaregiverPortalScreen from './src/screens/CaregiverPortalScreen';
import AppointmentScreen from './src/screens/AppointmentScreen';
import AddHealthRecordScreen from './src/screens/AddHealthRecordScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const prefix = Linking.createURL('/');

const linking = {
  prefixes: [prefix, 'aarogyavani://'],
  config: {
    screens: {
      MainTabs: {
        screens: { Home: 'home', Meds: 'meds', Wellness: 'wellness', Family: 'family' }
      },
      CaregiverPortal: 'anchor/:patientId',
      Appointments: 'appointments',
      AddRecord: 'add-record',
      Profile: 'profile',
      Login: 'login',
    },
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Meds') icon = '💊';
          else if (route.name === 'Wellness') icon = '🧘';
          else if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: size }}>{icon}</Text>;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Meds" component={MedsScreen} />
      <Tab.Screen name="Wellness" component={WellnessScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
      });
    } catch (e) {
      console.error('Failed to configure GoogleSignin:', e);
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsReady(true);
    }, (error) => {
      console.error('Auth state error:', error);
      setIsReady(true);
    });

    return unsubscribe;
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer linking={linking} fallback={<ActivityIndicator color={colors.primary} />}>
        <Stack.Navigator 
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.surface,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          {user ? (
            <>
              <Stack.Screen 
                name="MainTabs" 
                component={TabNavigator} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="Scanner" 
                component={ScannerScreen} 
                options={{ title: 'Scan Prescription' }} 
              />
              <Stack.Screen 
                name="Details" 
                component={DetailsScreen} 
                options={{ title: 'Analysis Results' }} 
              />
              <Stack.Screen 
                name="CaregiverPortal" 
                component={CaregiverPortalScreen} 
                options={{ title: 'Care Anchor Portal' }} 
              />
              <Stack.Screen 
                name="Appointments" 
                component={AppointmentScreen} 
                options={{ title: 'Medical Appointments' }} 
              />
              <Stack.Screen 
                name="AddRecord" 
                component={AddHealthRecordScreen} 
                options={{ title: 'Add Health Record' }} 
              />
              <Stack.Screen 
                name="Insights" 
                component={InsightsScreen} 
                options={{ title: 'Health Insights' }} 
              />
            </>
          ) : (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
