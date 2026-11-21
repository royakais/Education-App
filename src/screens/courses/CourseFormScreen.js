// Add or edit a course — CREATE and UPDATE.
// Opened with no params to add, or with { course } to edit.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { addCourse, updateCourse } from '../../services/courses';
import { COURSE_COLORS } from '../../data/defaultCourses';
import { COLORS } from '../../theme';
import { GradientButton } from '../../components/Gradient';

export default function CourseFormScreen({ route, navigation }) {
  const { user } = useAuth();
  const course = route.params?.course; // undefined when adding
  const isEditing = !!course;

  const [title, setTitle] = useState(course?.title ?? '');
  const [color, setColor] = useState(course?.color ?? COURSE_COLORS[0]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a course title.');
      return;
    }
    setError('');
    setSaving(true);
    const data = { title: title.trim(), color };
    try {
      if (isEditing) {
        await updateCourse(course.id, data);
        // If we came from the details screen, send it the updated course so it shows
        // the new values. If we came from the list, just go back (the list updates live).
        const cameFromDetails = navigation
          .getState()
          .routes.some((r) => r.name === 'CourseDetails');
        if (cameFromDetails) {
          navigation.popTo('CourseDetails', { course: { ...course, ...data } });
        } else {
          navigation.goBack();
        }
      } else {
        await addCourse(user.uid, data);
        navigation.goBack();
      }
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        label="Course title"
        mode="outlined"
        value={title}
        onChangeText={setTitle}
        left={<TextInput.Icon icon="book-outline" />}
        style={styles.input}
      />

      <Text variant="titleSmall" style={styles.label}>
        Color
      </Text>
      <View style={styles.colors}>
        {COURSE_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={[styles.swatch, { backgroundColor: c }, color === c && styles.selected]}
          >
            {color === c ? <Icon source="check" size={20} color="#FFFFFF" /> : null}
          </Pressable>
        ))}
      </View>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <GradientButton
        title={isEditing ? 'Save changes' : 'Add course'}
        icon={isEditing ? 'content-save-outline' : 'plus'}
        onPress={handleSave}
        loading={saving}
        floating
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 12 },
  label: { marginTop: 8, marginBottom: 12, color: COLORS.text },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { borderWidth: 3, borderColor: COLORS.gold },
});
