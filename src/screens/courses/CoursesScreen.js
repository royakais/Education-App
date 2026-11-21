// Courses tab — the student's courses (read-only: every student gets the default CS courses).
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCourses } from '../../hooks/useCourses';
import { useAssignments } from '../../hooks/useAssignments';
import { getCourseInfo } from '../../data/dummyCourseInfo';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS } from '../../theme';
import { generateCrn } from '../../utils/crn';

export default function CoursesScreen({ navigation }) {
  const { courses, loading } = useCourses();
  const { assignments } = useAssignments();

  const renderCourse = ({ item, index }) => {
    const info = getCourseInfo(item);
    const mine = assignments.filter((a) => a.courseId === item.id);
    const toDo = mine.filter((a) => !a.submitted).length;
    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).duration(350)}>
        <Pressable style={styles.card} onPress={() => navigation.navigate('CourseDetails', { course: item })}>
          <View style={[styles.bar, { backgroundColor: item.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.code}>
              {info.code} <Text style={styles.crn}>· CRN {generateCrn(item.id)}</Text>
            </Text>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {mine.length} assignment{mine.length === 1 ? '' : 's'} · {toDo ? `${toDo} to do` : 'all submitted ✓'}
            </Text>
          </View>
          <Icon source="chevron-right" size={22} color={COLORS.muted} />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 14 }}>
            <ScreenHeader
              eyebrow={`${courses.length} ${courses.length === 1 ? 'COURSE' : 'COURSES'} THIS SEMESTER`}
              title="My courses"
            />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.empty}>
              <Icon source="book-outline" size={40} color={COLORS.gold} />
              <Text style={styles.emptyTitle}>No courses yet</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 18,
    marginBottom: 10,
    paddingVertical: 14,
    paddingLeft: 20,
    paddingRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
    overflow: 'hidden',
  },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  code: { fontFamily: FONTS.semibold, fontSize: 12, letterSpacing: 1, color: COLORS.burgundy },
  crn: { fontFamily: FONTS.regular, fontSize: 11, letterSpacing: 0, color: COLORS.muted },
  title: { fontFamily: FONTS.medium, fontSize: 15.5, color: COLORS.text, marginTop: 2 },
  meta: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted, marginTop: 1 },
  empty: { alignItems: 'center', marginTop: 50, gap: 6 },
  emptyTitle: { fontFamily: FONTS.semibold, fontSize: 16, color: COLORS.maroon },
});
