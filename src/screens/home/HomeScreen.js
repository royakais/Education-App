// Home: welcome, swipeable course cards (most urgent first) and a calendar.
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../hooks/useCourses';
import { getCourseInfo } from '../../data/dummyCourseInfo';
import CourseCard from '../../components/CourseCard';
import EventCalendar from '../../components/EventCalendar';
import MenuButton from '../../components/MenuButton';
import { COLORS } from '../../theme';
import { daysUntil, greeting } from '../../utils/dates';

const CARD_GAP = 14;
const SIDE = 20;

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { courses, loading } = useCourses();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const cardWidth = width - SIDE * 2;
  const firstName = (user?.displayName || 'Student').split(' ')[0];

  // Attach the (dummy) info to each course and sort: nearest deadline first.
  const items = useMemo(() => {
    const withInfo = courses.map((course) => ({ course, info: getCourseInfo(course) }));
    const due = (x) => (x.info.nextAssignment ? x.info.nextAssignment.dueDate.getTime() : Infinity);
    return withInfo.sort((a, b) => due(a) - due(b));
  }, [courses]);

  // Everything for the calendar: assignment deadlines + tests of all courses.
  const events = useMemo(
    () =>
      items.flatMap(({ course, info }) => [
        ...info.assignments.map((a) => ({ ...a, date: a.dueDate, course })),
        ...info.tests.map((t) => ({ ...t, course })),
      ]),
    [items]
  );

  const dueThisWeek = events.filter(
    (e) => e.type === 'assignment' && !e.submitted && daysUntil(e.date) >= 0 && daysUntil(e.date) <= 7
  ).length;
  const testsSoon = events.filter(
    (e) => e.type === 'test' && daysUntil(e.date) >= 0 && daysUntil(e.date) <= 14
  ).length;

  const openCourse = (course) => navigation.navigate('CourseDetails', { course });

  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP));
    if (i !== index) setIndex(i);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome header */}
      <LinearGradient
        colors={[COLORS.maroon, COLORS.burgundy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 4 }]}
      >
        <View style={styles.heroCircle} />
        <View style={styles.heroTop}>
          <MenuButton />
          <Pressable style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text variant="headlineLarge" style={styles.welcome}>
            Welcome, {firstName} 👋
          </Text>
          <Text style={styles.heroSub}>Ready to learn something new today?</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.stats}>
          <View style={styles.stat}>
            <Icon source="clipboard-clock-outline" size={22} color={COLORS.gold} />
            <View>
              <Text style={styles.statNumber}>{dueThisWeek}</Text>
              <Text style={styles.statLabel}>due this week</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Icon source="file-document-edit-outline" size={22} color={COLORS.gold} />
            <View>
              <Text style={styles.statNumber}>{testsSoon}</Text>
              <Text style={styles.statLabel}>tests in 2 weeks</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Courses carousel */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Choose a course</Text>
          <Text style={styles.sectionHint}>Most urgent first · swipe for more</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Courses')} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginVertical: 40 }} />
      ) : items.length === 0 ? (
        <Pressable style={styles.emptyCard} onPress={() => navigation.navigate('Courses')}>
          <Icon source="book-plus-outline" size={36} color={COLORS.burgundy} />
          <Text style={styles.emptyTitle}>No courses yet</Text>
          <Text style={styles.emptyText}>Tap here to add your first course</Text>
        </Pressable>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.course.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + CARD_GAP}
            decelerationRate="fast"
            disableIntervalMomentum
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carousel}
            ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            renderItem={({ item, index: i }) => (
              <CourseCard
                course={item.course}
                info={item.info}
                width={cardWidth}
                highlight={i === 0}
                onOpen={() => openCourse(item.course)}
              />
            )}
          />
          <View style={styles.pager}>
            {items.map((item, i) => (
              <View key={item.course.id} style={[styles.pageDot, i === index && styles.pageDotActive]} />
            ))}
          </View>
        </>
      )}

      {/* Calendar */}
      <Animated.View layout={LinearTransition.duration(280)} style={styles.calendarSection}>
        <Text style={styles.sectionTitle}>Your calendar</Text>
        <Text style={[styles.sectionHint, { marginBottom: 12 }]}>Deadlines and tests at a glance</Text>
        <EventCalendar events={events} onEventPress={(e) => openCourse(e.course)} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  hero: {
    paddingHorizontal: SIDE,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -90,
    top: -70,
    backgroundColor: 'rgba(251,246,238,0.07)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: -8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.maroon, fontWeight: 'bold', fontSize: 17 },
  greeting: { color: COLORS.gold, fontSize: 15, marginTop: 10, fontWeight: '600' },
  welcome: { color: COLORS.cream, fontWeight: 'bold', marginTop: 2 },
  heroSub: { color: 'rgba(251,246,238,0.75)', marginTop: 4 },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' },
  statNumber: { color: COLORS.cream, fontWeight: 'bold', fontSize: 20, lineHeight: 24 },
  statLabel: { color: 'rgba(251,246,238,0.75)', fontSize: 12 },
  statDivider: { width: 1, height: 34, backgroundColor: 'rgba(251,246,238,0.2)' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SIDE,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: { color: COLORS.maroon, fontWeight: 'bold', fontSize: 20 },
  sectionHint: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  seeAll: { color: COLORS.burgundy, fontWeight: 'bold' },
  carousel: { paddingHorizontal: SIDE, alignItems: 'flex-start', paddingBottom: 8 },
  pager: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  pageDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E2D3C6' },
  pageDotActive: { width: 22, backgroundColor: COLORS.burgundy },
  emptyCard: {
    marginHorizontal: SIDE,
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.gold,
    backgroundColor: COLORS.card,
  },
  emptyTitle: { color: COLORS.maroon, fontWeight: 'bold', fontSize: 16 },
  emptyText: { color: COLORS.muted },
  calendarSection: { paddingHorizontal: SIDE, marginTop: 28 },
});
