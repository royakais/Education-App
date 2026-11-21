// Practice one of the app's quizzes with 10 questions from Open Trivia DB (public web API).
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Icon, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { useCourses } from '../../hooks/useCourses';
import { findQuiz } from '../../data/quizzes';
import { fetchQuestions } from '../../services/trivia';
import { getItem, setItem } from '../../native/storage';
import { COLORS, FONTS } from '../../theme';
import { formatDayMonth } from '../../utils/dates';
import { GradientButton } from '../../components/Gradient';

const GREEN = '#2F6B3E';
const RED = '#B3261E';

export default function QuizPlayScreen({ route, navigation }) {
  const { quizId } = route.params;
  const { courses } = useCourses();
  const quiz = findQuiz(courses, quizId);

  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: quiz ? `${quiz.code} practice` : 'Practice' });
  }, [navigation, quiz?.code]);

  const load = useCallback(async () => {
    if (!quiz) return;
    setQuestions(null);
    setError('');
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    try {
      setQuestions(await fetchQuestions(quiz.category.id));
    } catch (e) {
      setError(e.message);
    }
  }, [quiz?.id]);

  useEffect(() => {
    load();
    if (quiz) getItem(`quiz-best:${quiz.id}`).then(setBest);
  }, [quiz?.id]);

  if (!quiz) return <ActivityIndicator style={{ marginTop: 60 }} />;

  const q = questions?.[index];

  const choose = (answer) => {
    if (picked) return;
    setPicked(answer);
    const right = answer === q.correct;
    if (right) setScore((s) => s + 1);
    Haptics.notificationAsync(right ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
  };

  const next = async () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    setDone(true);
    const result = { score, total: questions.length, at: Date.now() };
    if (!best || score > best.score) {
      await setItem(`quiz-best:${quiz.id}`, result);
      setBest(result);
    }
  };

  const percent = questions ? Math.round((score / questions.length) * 100) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.cream }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Quiz card */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.heroShadow}>
        <LinearGradient colors={[COLORS.burgundy, COLORS.maroon]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.circle} />
          <Text style={styles.heroCode}>
            {quiz.code} · {quiz.kind.toUpperCase()} · {formatDayMonth(quiz.date)}
          </Text>
          <Text style={styles.heroTitle}>{quiz.title}</Text>
          <Text style={styles.heroSub}>
            Practice · {quiz.category.name} questions from Open Trivia DB
            {best ? ` · Best ${best.score}/${best.total}` : ''}
          </Text>
          {questions && !done ? (
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${((index + (picked ? 1 : 0)) / questions.length) * 100}%` }]} />
            </View>
          ) : null}
        </LinearGradient>
      </Animated.View>

      {error ? (
        <View style={styles.section}>
          <Icon source="wifi-off" size={28} color={COLORS.burgundy} />
          <Text style={styles.errorText}>{error}</Text>
          <GradientButton title="Try again" icon="refresh" onPress={load} />
        </View>
      ) : !questions ? (
        <View style={[styles.section, { alignItems: 'center' }]}>
          <ActivityIndicator />
          <Text style={styles.muted}>Loading questions from Open Trivia DB…</Text>
        </View>
      ) : done ? (
        <Animated.View entering={ZoomIn.duration(350)} style={[styles.section, { alignItems: 'center' }]}>
          <View style={styles.scoreRing}>
            <Text style={styles.scoreBig}>
              {score}/{questions.length}
            </Text>
            <Text style={styles.scorePct}>{percent}%</Text>
          </View>
          <Text style={styles.resultTitle}>
            {percent >= 80 ? 'Excellent! You’re ready 🎉' : percent >= 50 ? 'Good job — keep practicing 💪' : 'Keep going, you’ll get there 📚'}
          </Text>
          {best ? <Text style={styles.muted}>Best score: {best.score}/{best.total}</Text> : null}
          <View style={styles.row}>
            <Button mode="outlined" onPress={() => navigation.goBack()} style={{ flex: 1 }} textColor={COLORS.maroon}>
              Back
            </Button>
            <GradientButton title="New questions" icon="refresh" onPress={load} style={{ flex: 1 }} />
          </View>
        </Animated.View>
      ) : (
        <Animated.View key={index} entering={FadeInRight.duration(300)} style={styles.section}>
          <Text style={styles.counter}>
            QUESTION {index + 1} OF {questions.length} · {q.difficulty.toUpperCase()}
          </Text>
          <Text style={styles.question}>{q.question}</Text>
          {q.answers.map((a) => {
            const isCorrect = picked && a === q.correct;
            const isWrong = picked === a && a !== q.correct;
            return (
              <Pressable
                key={a}
                onPress={() => choose(a)}
                style={[styles.answer, isCorrect && styles.answerCorrect, isWrong && styles.answerWrong, picked && !isCorrect && !isWrong && { opacity: 0.5 }]}
              >
                <Text style={[styles.answerText, (isCorrect || isWrong) && { color: COLORS.cream }]}>{a}</Text>
                {isCorrect ? <Icon source="check" size={18} color={COLORS.cream} /> : null}
                {isWrong ? <Icon source="close" size={18} color={COLORS.cream} /> : null}
              </Pressable>
            );
          })}
          {picked ? (
            <Animated.View entering={FadeIn.duration(250)}>
              <GradientButton
                title={index + 1 < questions.length ? 'Next question' : 'See my score'}
                icon={index + 1 < questions.length ? 'arrow-right' : 'flag-checkered'}
                onPress={next}
                style={{ marginTop: 6 }}
              />
            </Animated.View>
          ) : null}
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroShadow: {
    marginHorizontal: 18,
    marginTop: 6,
    borderRadius: 26,
    backgroundColor: COLORS.maroon,
    shadowColor: COLORS.maroon,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  hero: { padding: 22, borderRadius: 26, overflow: 'hidden' },
  circle: { position: 'absolute', width: 200, height: 200, borderRadius: 100, right: -70, top: -60, backgroundColor: 'rgba(255,255,255,0.07)' },
  heroCode: { fontFamily: FONTS.semibold, fontSize: 11.5, letterSpacing: 1, color: COLORS.gold },
  heroTitle: { fontFamily: FONTS.semibold, fontSize: 22, lineHeight: 30, color: COLORS.cream, marginTop: 6 },
  heroSub: { fontFamily: FONTS.regular, fontSize: 12.5, color: 'rgba(251,246,238,0.75)', marginTop: 4 },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(251,246,238,0.2)', marginTop: 16 },
  fill: { height: 6, borderRadius: 3, backgroundColor: COLORS.gold },
  section: { marginHorizontal: 18, marginTop: 14, padding: 18, borderRadius: 22, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.creamDark, gap: 10 },
  counter: { fontFamily: FONTS.medium, fontSize: 11, letterSpacing: 1.5, color: COLORS.muted },
  question: { fontFamily: FONTS.semibold, fontSize: 17, lineHeight: 25, color: COLORS.text, marginBottom: 4 },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.cream,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
  },
  answerCorrect: { backgroundColor: GREEN, borderColor: GREEN },
  answerWrong: { backgroundColor: RED, borderColor: RED },
  answerText: { flex: 1, fontFamily: FONTS.medium, fontSize: 14.5, color: COLORS.text },
  muted: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  errorText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.text },
  scoreRing: { width: 130, height: 130, borderRadius: 65, borderWidth: 8, borderColor: COLORS.burgundy, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  scoreBig: { fontFamily: FONTS.semibold, fontSize: 30, color: COLORS.maroon },
  scorePct: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.muted },
  resultTitle: { fontFamily: FONTS.semibold, fontSize: 16, color: COLORS.maroon, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 6 },
});
