// Assignments tab — every default assignment with its submission status (live from Firestore).
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Icon, Text } from 'react-native-paper';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { useAssignments } from '../../hooks/useAssignments';
import { useCourses } from '../../hooks/useCourses';
import { getCourseInfo } from '../../data/dummyCourseInfo';
import { createDefaultAssignmentsFor } from '../../services/assignments';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS } from '../../theme';
import { daysUntil, formatDayMonth, relativeDay } from '../../utils/dates';

const FILTERS = [
  { key: 'todo', label: 'To do' },
  { key: 'done', label: 'Submitted' },
  { key: 'all', label: 'All' },
];

export default function AssignmentsScreen({ navigation }) {
  const { user } = useAuth();
  const { assignments, loading } = useAssignments();
  const { courses } = useCourses();
  const [filter, setFilter] = useState('todo');
  const [seeding, setSeeding] = useState(false);

  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses]);

  const list = useMemo(() => {
    const visible = assignments.filter((a) => courseById[a.courseId]);
    if (filter === 'todo') return visible.filter((a) => !a.submitted);
    if (filter === 'done') return [...visible.filter((a) => a.submitted)].reverse();
    return visible;
  }, [assignments, filter, courseById]);

  const seed = async () => {
    setSeeding(true);
    try {
      await createDefaultAssignmentsFor(user.uid, courses);
    } finally {
      setSeeding(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const course = courseById[item.courseId];
    const days = daysUntil(item.dueDate);
    const late = !item.submitted && days < 0;
    const status = item.submitted
      ? { text: 'Submitted', bg: '#E3EEDF', fg: '#2F6B3E', icon: 'check' }
      : late
        ? { text: 'Late', bg: '#F7D9D6', fg: '#B3261E', icon: 'alert-circle-outline' }
        : { text: relativeDay(item.dueDate), bg: days <= 2 ? COLORS.goldLight : COLORS.burgundyLight, fg: COLORS.maroon, icon: 'clock-outline' };

    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).duration(350)} layout={LinearTransition}>
        <Pressable style={styles.card} onPress={() => navigation.navigate('AssignmentDetails', { assignmentId: item.id })}>
          <View style={[styles.bar, { backgroundColor: course.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.code}>{getCourseInfo(course).code}</Text>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.meta}>Due {formatDayMonth(item.dueDate)}</Text>
          </View>
          <View style={[styles.status, { backgroundColor: status.bg }]}>
            <Icon source={status.icon} size={13} color={status.fg} />
            <Text style={[styles.statusText, { color: status.fg }]}>{status.text}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      {loading ? (
        <View>
          <ScreenHeader title="Assignments" />
          <ActivityIndicator style={{ marginTop: 40 }} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(a) => a.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
          ListHeaderComponent={
            <View style={{ marginHorizontal: -18, marginBottom: 14 }}>
              <ScreenHeader eyebrow={`${assignments.filter((a) => !a.submitted && courseById[a.courseId]).length} TO DO`} title="Assignments" />
              <View style={styles.filters}>
                {FILTERS.map((f) => (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[styles.filter, filter === f.key && styles.filterOn]}
                  >
                    <Text style={[styles.filterText, filter === f.key && { color: COLORS.cream }]}>{f.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon source={filter === 'done' ? 'tray' : 'party-popper'} size={40} color={COLORS.gold} />
              <Text style={styles.emptyTitle}>
                {assignments.length === 0 ? 'No assignments yet' : filter === 'done' ? 'Nothing submitted yet' : 'All caught up!'}
              </Text>
              {assignments.length === 0 && courses.length > 0 ? (
                <Button mode="outlined" icon="auto-fix" onPress={seed} loading={seeding} style={{ marginTop: 8 }}>
                  Load my assignments
                </Button>
              ) : null}
            </View>
          }
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 22, paddingTop: 14 },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
  },
  filterOn: { backgroundColor: COLORS.burgundy, borderColor: COLORS.burgundy },
  filterText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.maroon },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingLeft: 20,
    marginBottom: 10,
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
  status: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontFamily: FONTS.semibold, fontSize: 11.5 },
  empty: { alignItems: 'center', marginTop: 60, gap: 6 },
  emptyTitle: { fontFamily: FONTS.semibold, fontSize: 16, color: COLORS.maroon },
  fab: { position: 'absolute', right: 18, bottom: 18, backgroundColor: COLORS.burgundy, borderRadius: 20 },
});
