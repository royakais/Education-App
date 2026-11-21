// Add or edit an assignment — CREATE and UPDATE.
// Params: { assignment } to edit, or { courseId } to pre-select a course when adding.
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text, TextInput } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../hooks/useCourses';
import { addAssignment, updateAssignment } from '../../services/assignments';
import { getCourseInfo } from '../../data/dummyCourseInfo';
import { COLORS, FONTS } from '../../theme';
import { addDays, formatLong, relativeDay } from '../../utils/dates';

export default function AssignmentFormScreen({ route, navigation }) {
  const { user } = useAuth();
  const { courses } = useCourses();
  const editing = route.params?.assignment;

  const [courseId, setCourseId] = useState(editing?.courseId ?? route.params?.courseId ?? null);
  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [dueDate, setDueDate] = useState(editing?.dueDate ? new Date(editing.dueDate) : addDays(7));
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const pickDate = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dueDate,
        mode: 'date',
        onChange: (event, date) => event.type === 'set' && date && setDueDate(date),
      });
    } else {
      setShowIosPicker(!showIosPicker);
    }
  };

  const save = async () => {
    if (!courseId) return setError('Choose a course.');
    if (!title.trim()) return setError('Enter a title.');
    setError('');
    setSaving(true);
    const data = { courseId, title: title.trim(), description: description.trim(), dueDate };
    try {
      if (editing) await updateAssignment(editing.id, data);
      else await addAssignment(user.uid, data);
      navigation.goBack();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Course</Text>
      <View style={styles.chips}>
        {courses.map((c) => {
          const selected = c.id === courseId;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCourseId(c.id)}
              style={[styles.chip, selected && styles.chipOn]}
            >
              <View style={[styles.chipDot, { backgroundColor: c.color }]} />
              <Text style={[styles.chipText, selected && { color: COLORS.cream }]}>
                {getCourseInfo(c).code}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        label="Title"
        mode="outlined"
        value={title}
        onChangeText={setTitle}
        left={<TextInput.Icon icon="clipboard-text-outline" />}
        style={styles.input}
      />
      <TextInput
        label="Description (optional)"
        mode="outlined"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Text style={styles.label}>Due date</Text>
      <Pressable style={styles.dateBox} onPress={pickDate}>
        <View style={styles.dateIcon}>
          <Icon source="calendar-month-outline" size={20} color={COLORS.burgundy} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.dateText}>{formatLong(dueDate)}</Text>
          <Text style={styles.dateSub}>{relativeDay(dueDate)}</Text>
        </View>
        <Icon source="chevron-right" size={20} color={COLORS.muted} />
      </Pressable>
      {Platform.OS === 'ios' && showIosPicker ? (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="inline"
          accentColor={COLORS.burgundy}
          onChange={(_, date) => date && setDueDate(date)}
        />
      ) : null}

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <Button
        mode="contained"
        icon={editing ? 'content-save-outline' : 'plus'}
        onPress={save}
        loading={saving}
        disabled={saving}
        contentStyle={{ paddingVertical: 4 }}
      >
        {editing ? 'Save changes' : 'Add assignment'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontFamily: FONTS.semibold, fontSize: 13, color: COLORS.maroon, marginBottom: 8, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
  },
  chipOn: { backgroundColor: COLORS.burgundy, borderColor: COLORS.burgundy },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontFamily: FONTS.semibold, fontSize: 13, color: COLORS.burgundy },
  input: { marginBottom: 12 },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
  },
  dateIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.burgundyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.text },
  dateSub: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted },
});
