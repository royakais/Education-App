// Courses tab — READ (live list) and DELETE, with buttons to CREATE and UPDATE.
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, FAB, Icon, IconButton, Menu, Portal, Snackbar, Text } from 'react-native-paper';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../hooks/useCourses';
import { deleteCourse } from '../../services/courses';
import { getCourseInfo } from '../../data/dummyCourseInfo';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS } from '../../theme';
import { generateCrn } from '../../utils/crn';

export default function CoursesScreen({ navigation }) {
  const { user } = useAuth();
  const { courses, loading } = useCourses();
  const [menuFor, setMenuFor] = useState(null); // course id whose ⋮ menu is open
  const [toDelete, setToDelete] = useState(null); // course waiting for delete confirmation
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteCourse(user.uid, toDelete.id);
      setMessage(`${getCourseInfo(toDelete).code} deleted`);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const renderCourse = ({ item, index }) => {
    const info = getCourseInfo(item);
    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).duration(350)} layout={LinearTransition}>
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
              {item.instructor ? item.instructor : info.schedule}
            </Text>
          </View>
          <Menu
            visible={menuFor === item.id}
            onDismiss={() => setMenuFor(null)}
            contentStyle={{ backgroundColor: COLORS.card }}
            anchor={<IconButton icon="dots-vertical" iconColor={COLORS.muted} onPress={() => setMenuFor(item.id)} />}
          >
            <Menu.Item
              leadingIcon="pencil-outline"
              title="Edit"
              onPress={() => {
                setMenuFor(null);
                navigation.navigate('CourseForm', { course: item });
              }}
            />
            <Menu.Item
              leadingIcon="delete-outline"
              title="Delete"
              onPress={() => {
                setMenuFor(null);
                setToDelete(item);
              }}
            />
          </Menu>
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
        contentContainerStyle={{ paddingBottom: 110 }}
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
              <Icon source="book-plus-outline" size={40} color={COLORS.gold} />
              <Text style={styles.emptyTitle}>No courses yet</Text>
              <Text style={styles.emptyText}>Tap “Add course” to create your first one.</Text>
            </View>
          )
        }
      />

      {/* CREATE */}
      <FAB icon="plus" label="Add course" color={COLORS.cream} style={styles.fab} onPress={() => navigation.navigate('CourseForm')} />

      {/* DELETE confirmation */}
      <Portal>
        <Dialog visible={!!toDelete} onDismiss={() => setToDelete(null)} style={{ backgroundColor: COLORS.card }}>
          <Dialog.Icon icon="alert-outline" />
          <Dialog.Title style={styles.dialogTitle}>Delete course?</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              {toDelete ? getCourseInfo(toDelete).code : ''} and all of its assignments will be deleted.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setToDelete(null)}>Cancel</Button>
            <Button onPress={confirmDelete} loading={deleting} textColor="#B3261E">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!message} onDismiss={() => setMessage('')} duration={2500}>
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 10,
    paddingVertical: 14,
    paddingLeft: 20,
    paddingRight: 4,
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
  emptyText: { fontFamily: FONTS.regular, color: COLORS.muted },
  dialogTitle: { textAlign: 'center', fontFamily: FONTS.semibold, color: COLORS.maroon },
  dialogText: { fontFamily: FONTS.regular, color: COLORS.text },
  fab: { position: 'absolute', right: 18, bottom: 18, backgroundColor: COLORS.burgundy, borderRadius: 20 },
});
