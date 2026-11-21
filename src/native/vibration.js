// NATIVE FEATURE: Vibration (React Native Vibration API) + Haptics (expo-haptics).
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

// Long "submitted!" vibration: buzz – pause – long buzz (about 1.5 seconds).
// Pattern = [wait, vibrate, wait, vibrate, ...] in milliseconds.
export function vibrateSubmitted() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  Vibration.vibrate([0, 400, 150, 900]);
}

// Short tap for small actions (saving changes, removing a photo).
export function tapFeedback() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
