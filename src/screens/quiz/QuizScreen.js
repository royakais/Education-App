// Quiz tab — practice questions from the Open Trivia DB public API (coming next).
import { ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS } from '../../theme';

export default function QuizScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.cream }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader eyebrow="TEST YOURSELF" title="Practice quiz" />
      <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.cardShadow}>
        <LinearGradient colors={[COLORS.burgundy, COLORS.maroon]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          <View style={styles.circle} />
          <View style={styles.iconWrap}>
            <Icon source="head-question-outline" size={28} color={COLORS.maroon} />
          </View>
          <Text style={styles.title}>Coming soon</Text>
          <Text style={styles.text}>
            10 quick questions from Open Trivia DB (opentdb.com), with your score at the end.
          </Text>
        </LinearGradient>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    marginHorizontal: 18,
    marginTop: 20,
    borderRadius: 26,
    shadowColor: COLORS.maroon,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    backgroundColor: COLORS.maroon,
  },
  card: { borderRadius: 26, padding: 22, overflow: 'hidden' },
  circle: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -60, top: -60, backgroundColor: 'rgba(255,255,255,0.07)' },
  iconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FONTS.semibold, fontSize: 22, color: COLORS.cream, marginTop: 16 },
  text: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 21, color: 'rgba(251,246,238,0.8)', marginTop: 6 },
});
