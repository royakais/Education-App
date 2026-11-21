// One course in the home carousel. Tap the card to open the course;
// tap "Assignment & lectures" to drop down the details with an animation.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../theme';
import { daysUntil, formatShort, relativeDay } from '../utils/dates';

export default function CourseCard({ course, info, width, highlight, onOpen }) {
  const [open, setOpen] = useState(false);
  const rotation = useSharedValue(0);
  const next = info.nextAssignment;
  const urgent = next && daysUntil(next.dueDate) <= 3;

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggle = () => {
    rotation.value = withTiming(open ? 0 : 180, { duration: 250 });
    setOpen(!open);
  };

  return (
    <Animated.View layout={LinearTransition.duration(280)} style={[styles.shadow, { width }]}>
      <LinearGradient
        colors={[COLORS.burgundy, COLORS.maroon]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circleBig]} />
        <View style={[styles.circle, styles.circleSmall]} />

        <Pressable onPress={onOpen}>
          <View style={styles.topRow}>
            <View style={styles.codeChip}>
              <View style={[styles.colorDot, { backgroundColor: course.color }]} />
              <Text style={styles.codeText}>{info.code}</Text>
            </View>
            {highlight && next ? (
              <View style={styles.badge}>
                <Icon source="fire" size={14} color={COLORS.maroon} />
                <Text style={styles.badgeText}>Due soonest</Text>
              </View>
            ) : null}
          </View>

          <Text variant="headlineSmall" style={styles.title} numberOfLines={2}>
            {course.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {course.instructor ? `${course.instructor} · ` : ''}
            {info.schedule}
          </Text>

          {/* Next deadline */}
          <View style={styles.dueBox}>
            <View style={[styles.dueIcon, urgent && { backgroundColor: COLORS.gold }]}>
              <Icon
                source={next ? 'calendar-clock' : 'check-all'}
                size={22}
                color={urgent ? COLORS.maroon : COLORS.cream}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dueLabel}>{next ? 'NEXT DEADLINE' : 'ALL CAUGHT UP'}</Text>
              <Text style={styles.dueTitle} numberOfLines={1}>
                {next ? next.title : 'No upcoming assignments'}
              </Text>
              {next ? (
                <Text style={styles.dueDate}>
                  {formatShort(next.dueDate)} · {relativeDay(next.dueDate)}
                </Text>
              ) : null}
            </View>
          </View>
        </Pressable>

        {/* Dropdown */}
        {open ? (
          <Animated.View
            entering={FadeInUp.duration(280)}
            exiting={FadeOut.duration(150)}
            style={styles.dropdown}
          >
            <Text style={styles.sectionLabel}>ASSIGNMENT</Text>
            {next ? (
              <>
                <Text style={styles.dropTitle}>{next.title}</Text>
                <Text style={styles.dropText}>{next.description}</Text>
                <View style={styles.chipsRow}>
                  <View style={styles.infoChip}>
                    <Icon source="calendar" size={14} color={COLORS.burgundy} />
                    <Text style={styles.infoChipText}>Due {formatShort(next.dueDate)}</Text>
                  </View>
                  <View style={[styles.infoChip, styles.pendingChip]}>
                    <Icon source="upload-outline" size={14} color={COLORS.maroon} />
                    <Text style={[styles.infoChipText, { color: COLORS.maroon }]}>
                      Not submitted yet
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.dropText}>Everything is submitted. Nice work!</Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>RECENT LECTURES</Text>
            {info.recentLectures.slice(0, 3).map((lecture) => (
              <View key={lecture.id} style={styles.lectureRow}>
                <View style={styles.lectureIcon}>
                  <Icon source="play-circle-outline" size={18} color={COLORS.burgundy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lectureTitle} numberOfLines={1}>
                    {lecture.title}
                  </Text>
                  <Text style={styles.lectureMeta}>
                    {lecture.week} · {formatShort(lecture.date)}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        ) : null}

        {/* Bottom actions */}
        <View style={styles.actions}>
          <Pressable onPress={toggle} style={styles.toggle} hitSlop={8}>
            <Text style={styles.toggleText}>{open ? 'Hide details' : 'Assignment & lectures'}</Text>
            <Animated.View style={chevronStyle}>
              <Icon source="chevron-down" size={20} color={COLORS.cream} />
            </Animated.View>
          </Pressable>
          <Pressable onPress={onOpen} style={styles.openBtn} hitSlop={8}>
            <Text style={styles.openText}>Open</Text>
            <Icon source="arrow-right" size={16} color={COLORS.maroon} />
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 24,
    shadowColor: COLORS.maroon,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    backgroundColor: COLORS.maroon,
  },
  card: { borderRadius: 24, padding: 20, overflow: 'hidden' },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  circleBig: { width: 200, height: 200, top: -80, right: -60 },
  circleSmall: { width: 110, height: 110, top: 60, right: -30 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(251,246,238,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  colorDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: COLORS.cream },
  codeText: { color: COLORS.cream, fontWeight: 'bold', letterSpacing: 1, fontSize: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { color: COLORS.maroon, fontWeight: 'bold', fontSize: 12 },
  // Room for 2 lines so every card has the same height when closed.
  title: { color: COLORS.cream, fontWeight: 'bold', marginTop: 16, lineHeight: 32, minHeight: 64 },
  subtitle: { color: 'rgba(251,246,238,0.75)', marginTop: 4, fontSize: 13 },
  dueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  dueIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,246,238,0.15)',
  },
  dueLabel: { color: COLORS.gold, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  dueTitle: { color: COLORS.cream, fontWeight: 'bold', fontSize: 15, marginTop: 2 },
  dueDate: { color: 'rgba(251,246,238,0.75)', fontSize: 12, marginTop: 2 },
  dropdown: { marginTop: 14, padding: 16, borderRadius: 18, backgroundColor: COLORS.cream },
  sectionLabel: {
    color: COLORS.burgundy,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  dropTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 15 },
  dropText: { color: COLORS.muted, marginTop: 4, lineHeight: 20 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.burgundyLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pendingChip: { backgroundColor: COLORS.goldLight },
  infoChipText: { color: COLORS.burgundy, fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.creamDark, marginVertical: 14 },
  lectureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  lectureIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundyLight,
  },
  lectureTitle: { color: COLORS.text, fontWeight: '600' },
  lectureMeta: { color: COLORS.muted, fontSize: 12 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toggleText: { color: COLORS.cream, fontWeight: '600' },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  openText: { color: COLORS.maroon, fontWeight: 'bold' },
});
