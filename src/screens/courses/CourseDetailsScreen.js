// Course page: everything about one course. Assignments are real (Firestore);
// schedule, lectures and tests are still DUMMY info.
import { useLayoutEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getCourseInfo } from '../../data/dummyCourseInfo';
import { useAssignments } from '../../hooks/useAssignments';
import { COLORS, FONTS } from '../../theme';
import { generateCrn } from '../../utils/crn';
import { MONTHS, daysUntil, formatShort, relativeDay } from '../../utils/dates';

function Section({ title, icon, delay = 0, children }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon source={icon} size={20} color={COLORS.burgundy} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </Animated.View>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <View style={styles.tile}>
      <Icon source={icon} size={18} color={COLORS.gold} />
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export default function CourseDetailsScreen({ route, navigation }) {
  const { course } = route.params;
  const { assignments } = useAssignments();
  const info = getCourseInfo(course, assignments);
  const next = info.nextAssignment;
  const doneLectures = info.lectures.filter((l) => l.done).length;
  const progress = info.lectures.length ? doneLectures / info.lectures.length : 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerRight: () => (
        <IconButton
          icon="pencil-outline"
          iconColor={COLORS.maroon}
          onPress={() => navigation.navigate('CourseForm', { course })}
        />
      ),
    });
  }, [navigation, course, info.code]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Floating course card (same style as the Home carousel card) */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.heroShadow}>
      <LinearGradient colors={[COLORS.burgundy, COLORS.maroon]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroCircle} />
        <View style={styles.codeRow}>
          <View style={[styles.colorDot, { backgroundColor: course.color }]} />
          <Text style={styles.code}>
            {info.code} · CRN {generateCrn(course.id)} · {info.credits} credits
          </Text>
        </View>
        <Text style={styles.title}>
          {course.title}
        </Text>
        <Text style={styles.instructor}>
          {course.instructor ? course.instructor : 'Tap ✎ to add the instructor'}
        </Text>

        <View style={styles.progressBox}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>Course progress</Text>
            <Text style={styles.progressValue}>
              {doneLectures}/{info.lectures.length} lectures
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </LinearGradient>
      </Animated.View>

      {/* Quick info */}
      <Animated.View entering={FadeInDown.duration(350)} style={styles.tiles}>
        <InfoTile icon="clock-outline" label="Schedule" value={info.schedule} />
        <InfoTile icon="map-marker-outline" label="Room" value={info.room} />
      </Animated.View>

      <Section title="About this course" icon="information-outline" delay={60}>
        <Text style={styles.body}>{info.description}</Text>
      </Section>

      {next ? (
        <Section title="Next deadline" icon="alarm" delay={120}>
          <Pressable
            style={styles.deadline}
            onPress={() => navigation.navigate('AssignmentDetails', { assignmentId: next.id })}
          >
            <View style={styles.deadlineDate}>
              <Text style={styles.deadlineDay}>{next.dueDate.getDate()}</Text>
              <Text style={styles.deadlineMonth}>{MONTHS[next.dueDate.getMonth()].slice(0, 3).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{next.title}</Text>
              <Text style={styles.itemMeta}>{next.description}</Text>
              <Text style={[styles.itemMeta, { color: COLORS.burgundy, fontFamily: FONTS.semibold, marginTop: 6 }]}>
                Due {relativeDay(next.dueDate)} · not submitted
              </Text>
            </View>
          </Pressable>
        </Section>
      ) : null}

      <Section title="Lectures" icon="play-box-multiple-outline" delay={180}>
        {info.lectures.map((l) => (
          <View key={l.id} style={styles.listRow}>
            <View style={[styles.listIcon, l.done && { backgroundColor: COLORS.burgundy }]}>
              <Icon
                source={l.done ? 'check' : 'play'}
                size={16}
                color={l.done ? COLORS.cream : COLORS.burgundy}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{l.title}</Text>
              <Text style={styles.itemMeta}>
                {l.week} · {formatShort(l.date)}
                {!l.done && daysUntil(l.date) >= 0 ? ` · ${relativeDay(l.date)}` : ''}
              </Text>
            </View>
          </View>
        ))}
      </Section>

      <Section title="Assignments" icon="clipboard-text-outline" delay={240}>
        {info.assignments.length === 0 ? (
          <Text style={styles.itemMeta}>No assignments yet.</Text>
        ) : null}
        {info.assignments.map((a) => (
          <Pressable
            key={a.id}
            style={styles.listRow}
            onPress={() => navigation.navigate('AssignmentDetails', { assignmentId: a.id })}
          >
            <View style={styles.listIcon}>
              <Icon source={a.submitted ? 'check' : 'clipboard-text-outline'} size={16} color={COLORS.burgundy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{a.title}</Text>
              <Text style={styles.itemMeta}>Due {formatShort(a.dueDate)}</Text>
            </View>
            <View style={[styles.status, a.submitted ? styles.statusDone : styles.statusPending]}>
              <Text style={[styles.statusText, { color: a.submitted ? '#2F5D3A' : COLORS.maroon }]}>
                {a.submitted ? 'Submitted' : 'Pending'}
              </Text>
            </View>
          </Pressable>
        ))}
      </Section>

      <Section title="Tests & exams" icon="file-document-edit-outline" delay={300}>
        {info.tests.map((t) => (
          <View key={t.id} style={styles.listRow}>
            <View style={[styles.listIcon, { backgroundColor: COLORS.goldLight }]}>
              <Icon source="pencil-outline" size={16} color={COLORS.caramel} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{t.title}</Text>
              <Text style={styles.itemMeta}>
                {t.kind} · {formatShort(t.date)} · {relativeDay(t.date)}
              </Text>
            </View>
          </View>
        ))}
      </Section>

      <Section title="Grading" icon="chart-donut" delay={360}>
        {info.grading.map((g) => (
          <View key={g.label} style={styles.gradeRow}>
            <Text style={styles.gradeLabel}>{g.label}</Text>
            <View style={styles.gradeTrack}>
              <View style={[styles.gradeFill, { width: `${g.weight}%` }]} />
            </View>
            <Text style={styles.gradeValue}>{g.weight}%</Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
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
  heroCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -70,
    bottom: -90,
    backgroundColor: 'rgba(251,246,238,0.07)',
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: COLORS.cream },
  code: { color: COLORS.gold, fontFamily: FONTS.semibold, fontSize: 12, letterSpacing: 1 },
  title: { color: COLORS.cream, fontFamily: FONTS.semibold, fontSize: 24, lineHeight: 32, marginTop: 8 },
  instructor: { color: 'rgba(251,246,238,0.8)', marginTop: 4 },
  progressBox: { marginTop: 18 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { color: 'rgba(251,246,238,0.8)', fontSize: 13 },
  progressValue: { color: COLORS.cream, fontFamily: FONTS.semibold, fontSize: 13 },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(251,246,238,0.2)' },
  fill: { height: 8, borderRadius: 4, backgroundColor: COLORS.gold },
  tiles: { flexDirection: 'row', gap: 12, marginHorizontal: 18, marginTop: 14 },
  tile: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
  },
  tileLabel: { color: COLORS.muted, fontSize: 12 },
  tileValue: { color: COLORS.text, fontFamily: FONTS.semibold, fontSize: 13 },
  section: {
    marginHorizontal: 18,
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { color: COLORS.maroon, fontFamily: FONTS.semibold, fontSize: 16 },
  body: { color: COLORS.text, lineHeight: 21 },
  deadline: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  deadlineDate: {
    width: 58,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineDay: { color: COLORS.cream, fontFamily: FONTS.semibold, fontSize: 24, lineHeight: 28 },
  deadlineMonth: { color: COLORS.gold, fontFamily: FONTS.semibold, fontSize: 12 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  listIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundyLight,
  },
  itemTitle: { color: COLORS.text, fontFamily: FONTS.medium },
  itemMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDone: { backgroundColor: '#E3EEDF' },
  statusPending: { backgroundColor: COLORS.goldLight },
  statusText: { fontSize: 12, fontFamily: FONTS.semibold },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  gradeLabel: { width: 90, color: COLORS.text },
  gradeTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: COLORS.creamDark },
  gradeFill: { height: 8, borderRadius: 4, backgroundColor: COLORS.burgundy },
  gradeValue: { width: 36, textAlign: 'right', color: COLORS.muted, fontFamily: FONTS.semibold },
});
