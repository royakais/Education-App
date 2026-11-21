// NATIVE FEATURE: Sensor (expo-sensors Accelerometer) + Haptics (expo-haptics).
// A "SUBMITTED" stamp that drops in with a vibration, then tilts and floats with the phone's movement.
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../theme';
import { formatDayMonth } from '../utils/dates';

export default function SubmittedStamp({ submittedAt, celebrate }) {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const scale = useSharedValue(celebrate ? 2 : 1);
  const opacity = useSharedValue(celebrate ? 0 : 1);

  useEffect(() => {
    // Stamp drops in, with a success vibration.
    if (celebrate) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(withSpring(0.9, { damping: 8 }), withSpring(1));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Accelerometer: x/y are about -1…1 depending on how the phone is tilted.
    Accelerometer.setUpdateInterval(60);
    const sub = Accelerometer.addListener(({ x, y }) => {
      tiltX.value = withSpring(x * 18, { damping: 12 });
      tiltY.value = withSpring(y * 12, { damping: 12 });
    });
    return () => sub.remove();
  }, [celebrate]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: -tiltX.value },
      { translateY: tiltY.value * 0.6 },
      { rotate: `${-8 + tiltX.value * 0.6}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.stamp, stampStyle]}>
        <Icon source="check-decagram" size={22} color="#2F6B3E" />
        <View>
          <Text style={styles.stampText}>SUBMITTED</Text>
          {submittedAt ? <Text style={styles.stampDate}>{formatDayMonth(submittedAt)}</Text> : null}
        </View>
      </Animated.View>
      <Text style={styles.hint}>Tilt your phone 📱</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 10 },
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#2F6B3E',
    backgroundColor: 'rgba(227,238,223,0.85)',
  },
  stampText: { fontFamily: FONTS.bold, fontSize: 16, letterSpacing: 2, color: '#2F6B3E' },
  stampDate: { fontFamily: FONTS.medium, fontSize: 11, color: '#2F6B3E' },
  hint: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.muted, marginTop: 8 },
});
