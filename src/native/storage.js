// NATIVE FEATURE: Local storage (AsyncStorage) — small data kept on the phone only:
// the calendar event created for each assignment, and the best score of each practice quiz.
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setItem(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key) {
  await AsyncStorage.removeItem(key);
}
