import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "aarogyavani-7c666.firebaseapp.com",
  projectId: "aarogyavani-7c666",
  storageBucket: "aarogyavani-7c666.firebasestorage.app",
  messagingSenderId: "76369135608",
  appId: "1:76369135608:android:96a9386148918cc7c0780d",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
