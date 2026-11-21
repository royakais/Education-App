// "SUBMITTED" stamp shown on a submitted assignment. It drops in when the student has just submitted.
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { FONTS } from '../theme';
import { formatDayMonth } from '../utils/dates';

export default function SubmittedStamp({ submittedAt, celebrate }) {
  const scale = useSharedValue(celebrate ? 2 : 1);
  const opacity = useSharedValue(celebrate ? 0 : 1);

  useEffect(() => {
    if (celebrate) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(withSpring(0.9, { damping: 8 }), withSpring(1));
    }
  }, [celebrate]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: '-6deg' }, { scale: scale.value }],
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 12 },
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
});
