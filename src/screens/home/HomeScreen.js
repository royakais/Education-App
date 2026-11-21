// Home: welcome, centered course carousel with fading info, and a compact calendar.
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../hooks/useCourses';
import { useAssignments } from '../../hooks/useAssignments';
import { getCourseInfo } from '../../data/dummyCourseInfo';
import CourseCarousel from '../../components/CourseCarousel';
import WeekCalendar from '../../components/WeekCalendar';
import { COLORS, FONTS } from '../../theme';
import { daysUntil, formatHeaderDate, greeting, relativeDay } from '../../utils/dates';

const SIDE = 22;

// Types the name letter by letter, with a blinking cursor that disappears at the end.
function TypingName({ name }) {
  const [shown, setShown] = useState('');
  const [typing, setTyping] = useState(true);
  const blink = useSharedValue(1);

  useEffect(() => {
    let i = 0;
    setShown('');
    setTyping(true);
    const timer = setInterval(() => {
      i += 1;
      setShown(name.slice(0, i));
      if (i >= name.length) {
        clearInterval(timer);
        setTimeout(() => setTyping(false), 1200);
      }
    }, 90);
    blink.value = withRepeat(withSequence(withTiming(0, { duration: 450 }), withTiming(1, { duration: 450 })), -1);
    return () => clearInterval(timer);
  }, [name]);

  const cursorStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  return (
    <View style={styles.nameRow}>
      <Text style={styles.name}>{shown || ' '}</Text>
      {typing ? <Animated.View style={[styles.cursor, cursorStyle]} /> : null}
    </View>
  );
}

// Bottom line of the welcome card: rotates through updates every few seconds.
function Ticker({ messages }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    if (messages.length < 2) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % messages.length), 4000);
    return () => clearInterval(t);
  }, [messages.length]);

  const msg = messages[i % messages.length] ?? { icon: 'check', text: '' };
  return (
    <View style={styles.ticker}>
      <View style={styles.tickerIcon}>
        <Icon source={msg.icon} size={14} color={COLORS.burgundy} />
      </View>
      <Animated.Text key={msg.text} entering={FadeInDown.duration(450)} style={styles.tickerText} numberOfLines={1}>
        {msg.text}
      </Animated.Text>
      {messages.length > 1 ? (
        <Text style={styles.tickerCount}>
          {(i % messages.length) + 1} / {messages.length}
        </Text>
      ) : null}
    </View>
  );
}

// Glass card: a thin burgundy → sand gradient edge around a soft cream gradient.
function WelcomeCard({ firstName, messages }) {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.welcomeShadow}>
      <LinearGradient
        colors={['rgba(129,23,27,0.55)', 'rgba(212,165,116,0.5)', 'rgba(129,23,27,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeEdge}
      >
        <LinearGradient
          colors={['#FFFCF7', '#F8ECE4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeInner}
        >
          <Text style={styles.date}>{formatHeaderDate()}</Text>
          <Text style={styles.greet}>{greeting()},</Text>
          <TypingName name={firstName} />
          <Ticker messages={messages} />
        </LinearGradient>
      </LinearGradient>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { courses, loading } = useCourses();
  const { assignments } = useAssignments();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(0);
  const firstName = (user?.displayName || 'Student').split(' ')[0];

  // Course + its (dummy) info, nearest deadline first.
  const items = useMemo(() => {
    const list = courses.map((course) => ({ course, info: getCourseInfo(course, assignments) }));
    const due = (x) => (x.info.nextAssignment ? x.info.nextAssignment.dueDate.getTime() : Infinity);
    return list.sort((a, b) => due(a) - due(b));
  }, [courses, assignments]);

  const events = useMemo(
    () =>
      items.flatMap(({ course, info }) => [
        ...info.assignments.map((a) => ({ ...a, date: a.dueDate, course, code: info.code })),
        ...info.tests.map((t) => ({ ...t, course, code: info.code, quizId: `${course.id}:${t.id}` })),
      ]),
    [items]
  );

  const messages = useMemo(() => {
    const dueWeek = events.filter(
      (e) => e.type === 'assignment' && !e.submitted && daysUntil(e.date) >= 0 && daysUntil(e.date) <= 7
    );
    const tests = events.filter((e) => e.type === 'test' && daysUntil(e.date) >= 0 && daysUntil(e.date) <= 7);
    const list = [];
    if (dueWeek.length || tests.length) {
      const parts = [];
      if (dueWeek.length) parts.push(`${dueWeek.length} deadline${dueWeek.length > 1 ? 's' : ''} this week`);
      if (tests.length) parts.push(`${tests.length} ${tests.length > 1 ? 'tests' : 'test'}`);
      list.push({ icon: 'calendar-check-outline', text: parts.join(' · ') });
    } else {
      list.push({ icon: 'check-all', text: 'Nothing due this week' });
    }
    const next = [...dueWeek].sort((a, b) => a.date - b.date)[0];
    if (next) list.push({ icon: 'clock-outline', text: `${next.title.split(':')[0]} is due ${relativeDay(next.date)}` });
    const nextTest = [...tests].sort((a, b) => a.date - b.date)[0];
    if (nextTest)
      list.push({
        icon: 'file-document-edit-outline',
        text: `${nextTest.code} ${nextTest.kind.toLowerCase()} ${relativeDay(nextTest.date)}`,
      });
    return list;
  }, [events]);

  const openCourse = (course) => navigation.navigate('CourseDetails', { course });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon source="menu" size={20} color={COLORS.maroon} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Profile')}>
          <LinearGradient colors={[COLORS.burgundy, COLORS.maroon]} style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Welcome */}
      <WelcomeCard firstName={firstName} messages={messages} />

      {/* Courses */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Choose a course</Text>
        {items.length ? (
          <Text style={styles.counter}>
            {Math.min(active + 1, items.length)} / {items.length}
          </Text>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginVertical: 40 }} />
      ) : items.length === 0 ? (
        <Pressable style={styles.empty} onPress={() => navigation.navigate('Courses')}>
          <Icon source="book-plus-outline" size={30} color={COLORS.burgundy} />
          <Text style={styles.emptyText}>No courses yet — tap to add one</Text>
        </Pressable>
      ) : (
        <Animated.View entering={FadeIn.delay(150).duration(500)}>
          <CourseCarousel items={items} onOpenCourse={openCourse} onIndexChange={setActive} />
        </Animated.View>
      )}

      {/* Calendar */}
      <View style={styles.calendar}>
        <WeekCalendar
          events={events}
          onEventPress={(e) =>
            e.type === 'assignment'
              ? navigation.navigate('AssignmentDetails', { assignmentId: e.id })
              : navigation.navigate('QuizPlay', { quizId: e.quizId })
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIDE },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FONTS.semibold, fontSize: 16, color: COLORS.cream },
  welcomeShadow: {
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 28,
    backgroundColor: COLORS.cream,
    shadowColor: COLORS.maroon,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  welcomeEdge: { borderRadius: 28, padding: 1.2 },
  welcomeInner: { borderRadius: 27, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14 },
  date: { fontFamily: FONTS.medium, fontSize: 11, letterSpacing: 2, color: COLORS.muted },
  greet: { fontFamily: FONTS.light, fontSize: 15, color: COLORS.muted, marginTop: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', minHeight: 42 },
  name: { fontFamily: FONTS.semibold, fontSize: 30, lineHeight: 40, color: COLORS.maroon },
  cursor: { width: 3, height: 28, borderRadius: 2, backgroundColor: COLORS.burgundy, marginLeft: 4 },
  ticker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(129,23,27,0.08)',
  },
  tickerIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: COLORS.burgundyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickerText: { flex: 1, fontFamily: FONTS.regular, fontSize: 12.5, color: COLORS.text },
  tickerCount: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.muted },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: SIDE,
    marginTop: 26,
    marginBottom: 4,
  },
  sectionTitle: { fontFamily: FONTS.semibold, fontSize: 16, color: COLORS.maroon },
  counter: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted },
  empty: {
    marginHorizontal: SIDE,
    marginTop: 10,
    padding: 24,
    borderRadius: 22,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.gold,
  },
  emptyText: { fontFamily: FONTS.regular, color: COLORS.muted },
  calendar: { paddingHorizontal: SIDE, marginTop: 8 },
});
