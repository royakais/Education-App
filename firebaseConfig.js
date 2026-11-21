// Firebase setup: connects the app to the "education-app" Firebase project.
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBW3wwtebADu6IswZFHSFgfi6TFwUBomMA',
  authDomain: 'education-app-c6c5c.firebaseapp.com',
  projectId: 'education-app-c6c5c',
  storageBucket: 'education-app-c6c5c.firebasestorage.app',
  messagingSenderId: '1024840630642',
  appId: '1:1024840630642:web:1408c94b8d1b58a29dddeb',
};

const app = initializeApp(firebaseConfig);

// Auth keeps the user logged in between app restarts (saved with AsyncStorage).
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore database: collections "users", "courses", "assignments".
export const db = getFirestore(app);
