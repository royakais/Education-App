// Courses tab — READ (live list) and DELETE, with buttons to CREATE and UPDATE.
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  FAB,
  IconButton,
  Menu,
  Portal,
  Snackbar,
  Text,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { deleteCourse, subscribeToCourses } from '../../services/courses';
import Placeholder from '../../components/Placeholder';
import { COLORS } from '../../theme';

export default function CoursesScreen({ navigation }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuFor, setMenuFor] = useState(null); // course id whose ⋮ menu is open
  const [toDelete, setToDelete] = useState(null); // course waiting for delete confirmation
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  // READ: subscribe to the student's courses; updates live when anything changes.
  useEffect(() => {
    const unsubscribe = subscribeToCourses(
      user.uid,
      (data) => {
        setCourses(data);
        setLoading(false);
      },
      (error) => {
        setMessage(error.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user.uid]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteCourse(user.uid, toDelete.id);
      setMessage(`"${toDelete.title}" deleted`);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderCourse = ({ item }) => (
    <Card
      style={styles.card}
      mode="elevated"
      onPress={() => navigation.navigate('CourseDetails', { course: item })}
    >
      <View style={styles.row}>
        <View style={[styles.colorBar, { backgroundColor: item.color }]} />
        <View style={styles.cardText}>
          <Text variant="titleMedium" style={styles.title}>
            {item.title}
          </Text>
          <Text variant="bodySmall" style={styles.instructor}>
            {item.instructor ? item.instructor : 'No instructor added'}
          </Text>
        </View>
        <Menu
          visible={menuFor === item.id}
          onDismiss={() => setMenuFor(null)}
          anchor={<IconButton icon="dots-vertical" onPress={() => setMenuFor(item.id)} />}
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
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {courses.length === 0 ? (
        <Placeholder
          icon="book-open-variant"
          title="No courses yet"
          description="Tap + to add your first course."
        />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderCourse}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text variant="labelLarge" style={styles.count}>
              {courses.length} {courses.length === 1 ? 'COURSE' : 'COURSES'}
            </Text>
          }
        />
      )}

      {/* CREATE */}
      <FAB
        icon="plus"
        label="Add course"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => navigation.navigate('CourseForm')}
      />

      {/* DELETE confirmation */}
      <Portal>
        <Dialog visible={!!toDelete} onDismiss={() => setToDelete(null)}>
          <Dialog.Icon icon="alert-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Delete course?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              "{toDelete?.title}" and all of its assignments will be deleted.
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
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 96 },
  count: { color: COLORS.muted, marginBottom: 8, letterSpacing: 1 },
  card: { marginBottom: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center' },
  colorBar: { width: 6, alignSelf: 'stretch' },
  cardText: { flex: 1, paddingVertical: 16, paddingLeft: 14 },
  title: { fontWeight: 'bold', color: COLORS.text },
  instructor: { color: COLORS.muted, marginTop: 2 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: COLORS.burgundy },
});
