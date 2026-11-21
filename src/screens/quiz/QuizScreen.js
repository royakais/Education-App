// Quiz tab — the quizzes and exams of the student's courses. Each one can be practiced
// with questions from the Open Trivia DB public API (see QuizPlayScreen).
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCourses } from '../../hooks/useCourses';
import { getQuizzes } from '../../data/quizzes';
import { getItem } from '../../native/storage';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS } from '../../theme';
import { GradientFill } from '../../components/Gradient';
import { daysUntil, formatDayMonth, relativeDay } from '../../utils/dates';

export default function QuizScreen({ navigation }) {
  const { courses, loading } = useCourses();
  const quizzes = useMemo(() => getQuizzes(courses), [courses]);
  const [best, setBest] = useState({});

  // Reload best scores each time the tab is shown (they change after practicing).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      Promise.all(quizzes.map(async (q) => [q.id, await getItem(`quiz-best:${q.id}`)])).then((pairs) => {
        if (alive) setBest(Object.fromEntries(pairs));
      });
      return () => {
        alive = false;
      };
    }, [quizzes])
  );

  const upcoming = quizzes.filter((q) => daysUntil(q.date) >= 0);
  const past = quizzes.filter((q) => daysUntil(q.date) < 0);

  const renderQuiz = (q, i) => {
    const score = best[q.id];
    return (
      <Animated.View key={q.id} entering={FadeInDown.delay(Math.min(i, 8) * 50).duration(350)}>
        <Pressable style={styles.card} onPress={() => navigation.navigate('QuizPlay', { quizId: q.id })}>
          <View style={[styles.bar, { backgroundColor: q.course.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.code}>
              {q.code} · {q.kind.toUpperCase()}
            </Text>
            <Text style={styles.title} numberOfLines={1}>
              {q.title}
            </Text>
            <Text style={styles.meta}>
              {formatDayMonth(q.date)} · {relativeDay(q.date)}
              {score ? `  ·  Best ${score.score}/${score.total}` : ''}
            </Text>
          </View>
          <GradientFill style={styles.practice}>
            <Icon source="play" size={16} color={COLORS.cream} />
            <Text style={styles.practiceText}>Practice</Text>
          </GradientFill>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.cream }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader eyebrow={`${upcoming.length} COMING UP`} title="Quizzes" />
      <View style={styles.apiNote}>
        <Icon source="web" size={16} color={COLORS.caramel} />
        <Text style={styles.apiText}>Practice questions come from Open Trivia DB (opentdb.com).</Text>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 30 }} /> : null}
      {upcoming.map(renderQuiz)}
      {past.length ? <Text style={styles.sectionLabel}>PAST</Text> : null}
      {past.map((q, i) => renderQuiz(q, upcoming.length + i))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  apiNote: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 22, marginTop: 8, marginBottom: 14 },
  apiText: { flex: 1, fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted },
  sectionLabel: { fontFamily: FONTS.medium, fontSize: 11, letterSpacing: 2, color: COLORS.muted, marginHorizontal: 22, marginTop: 14, marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 14,
    paddingLeft: 20,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
    overflow: 'hidden',
  },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  code: { fontFamily: FONTS.semibold, fontSize: 11, letterSpacing: 1, color: COLORS.burgundy },
  title: { fontFamily: FONTS.medium, fontSize: 15, color: COLORS.text, marginTop: 1 },
  meta: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted, marginTop: 1 },
  practice: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  practiceText: { fontFamily: FONTS.semibold, fontSize: 12, color: COLORS.cream },
});
