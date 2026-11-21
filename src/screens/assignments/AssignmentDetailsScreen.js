// Assignment details: info, camera submission (UPDATE), and native actions
// (calendar, reminder notification, WhatsApp). Edit and delete are in the header.
import { useLayoutEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Icon, IconButton, Portal, Snackbar, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAssignments } from '../../hooks/useAssignments';
import { useCourses } from '../../hooks/useCourses';
import { getCourseInfo } from '../../data/dummyCourseInfo';
import { deleteAssignment, removeSubmission, submitAssignment } from '../../services/assignments';
import { takeAssignmentPhoto } from '../../native/camera';
import { addAssignmentToCalendar } from '../../native/calendar';
import { scheduleAssignmentReminder } from '../../native/notifications';
import { shareAssignmentOnWhatsApp } from '../../native/share';
import SubmittedStamp from '../../components/SubmittedStamp';
import { COLORS, FONTS } from '../../theme';
import { daysUntil, formatDayMonth, formatLong, relativeDay } from '../../utils/dates';

function ActionTile({ icon, label, color = COLORS.burgundy, onPress, busy }) {
  return (
    <Pressable style={styles.tile} onPress={onPress} disabled={busy}>
      <View style={[styles.tileIcon, { backgroundColor: `${color}1A` }]}>
        {busy ? <ActivityIndicator size={18} color={color} /> : <Icon source={icon} size={22} color={color} />}
      </View>
      <Text style={styles.tileText}>{label}</Text>
    </Pressable>
  );
}

export default function AssignmentDetailsScreen({ route, navigation }) {
  const { assignmentId } = route.params;
  const { assignments, loading } = useAssignments();
  const { courses } = useCourses();
  const assignment = assignments.find((a) => a.id === assignmentId);
  const course = courses.find((c) => c.id === assignment?.courseId);
  const code = course ? getCourseInfo(course).code : '';

  const [preview, setPreview] = useState(null); // { base64, uri } before submitting
  const [busy, setBusy] = useState(null); // which action is running
  const [celebrate, setCelebrate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: code,
      headerRight: () =>
        assignment ? (
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="pencil-outline"
              iconColor={COLORS.cream}
              onPress={() =>
                navigation.navigate('AssignmentForm', {
                  assignment: {
                    id: assignment.id,
                    courseId: assignment.courseId,
                    title: assignment.title,
                    description: assignment.description,
                    dueDate: assignment.dueDate.toISOString(),
                  },
                })
              }
            />
            <IconButton icon="delete-outline" iconColor={COLORS.cream} onPress={() => setConfirmDelete(true)} />
          </View>
        ) : null,
    });
  }, [navigation, assignment, code]);

  const run = async (name, fn) => {
    setBusy(name);
    try {
      await fn();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} />;
  if (!assignment) {
    return <Text style={{ textAlign: 'center', marginTop: 60, fontFamily: FONTS.regular }}>Assignment not found.</Text>;
  }

  const days = daysUntil(assignment.dueDate);
  const late = !assignment.submitted && days < 0;
  const info = { title: assignment.title, description: assignment.description, dueDate: assignment.dueDate, courseCode: code };

  // --- Camera → preview → submit ---
  const pickPhoto = (fromGallery) =>
    run(fromGallery ? 'gallery' : 'camera', async () => {
      const photo = await takeAssignmentPhoto({ fromGallery });
      if (photo) setPreview(photo);
    });

  const submit = () =>
    run('submit', async () => {
      await submitAssignment(assignment.id, preview.base64);
      setPreview(null);
      setCelebrate(true); // stamp drops in with a vibration (see SubmittedStamp)
    });

  const unsubmit = () =>
    run('remove', async () => {
      await removeSubmission(assignment.id);
      setCelebrate(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });

  // --- Other native actions ---
  const addToCalendar = () =>
    run('calendar', async () => {
      const when = await addAssignmentToCalendar(info);
      setMessage(`Added to your calendar for ${formatDayMonth(when)} ✓`);
    });

  const remind = () =>
    run('remind', async () => {
      const { when, soon } = await scheduleAssignmentReminder(info);
      setMessage(soon ? 'Reminder coming in 10 seconds 🔔' : `Reminder set for ${formatDayMonth(when)}, 9:00 🔔`);
    });

  const share = () => run('share', () => shareAssignmentOnWhatsApp({ ...info, submitted: assignment.submitted }));

  const imageUri = preview?.uri ?? (assignment.imageBase64 ? `data:image/jpeg;base64,${assignment.imageBase64}` : null);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <LinearGradient colors={[COLORS.maroon, COLORS.burgundy]} style={styles.hero}>
          <View style={styles.circle} />
          <Text style={styles.heroCourse}>{course?.title}</Text>
          <Text style={styles.heroTitle}>{assignment.title}</Text>
          <View style={styles.heroRow}>
            <View style={styles.heroChip}>
              <Icon source="calendar" size={14} color={COLORS.cream} />
              <Text style={styles.heroChipText}>{formatLong(assignment.dueDate)}</Text>
            </View>
            <View style={[styles.heroChip, { backgroundColor: assignment.submitted ? '#E3EEDF' : late ? '#F7D9D6' : COLORS.gold }]}>
              <Text style={[styles.heroChipText, { color: assignment.submitted ? '#2F6B3E' : COLORS.maroon }]}>
                {assignment.submitted ? 'Submitted' : late ? 'Late' : `Due ${relativeDay(assignment.dueDate)}`}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {assignment.description ? (
          <Animated.View entering={FadeInDown.duration(350)} style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.body}>{assignment.description}</Text>
          </Animated.View>
        ) : null}

        {/* Submission */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)} style={styles.section}>
          <Text style={styles.sectionTitle}>Your submission</Text>

          {assignment.submitted && !preview ? (
            <>
              <SubmittedStamp submittedAt={assignment.submittedAt} celebrate={celebrate} />
              {imageUri ? (
                <Animated.View entering={FadeIn.duration(400)}>
                  <Image source={{ uri: imageUri }} style={styles.photo} />
                </Animated.View>
              ) : (
                <Text style={styles.muted}>Submitted without a photo.</Text>
              )}
              <View style={styles.row}>
                <Button mode="outlined" icon="camera-retake-outline" onPress={() => pickPhoto(false)} style={{ flex: 1 }}>
                  Replace photo
                </Button>
                <Button mode="text" textColor="#B3261E" onPress={unsubmit} loading={busy === 'remove'}>
                  Unsubmit
                </Button>
              </View>
            </>
          ) : preview ? (
            <Animated.View entering={FadeIn.duration(300)}>
              <Image source={{ uri: preview.uri }} style={styles.photo} />
              <Text style={styles.muted}>Looks good? Submit it, or take another one.</Text>
              <View style={styles.row}>
                <Button mode="outlined" icon="camera-retake-outline" onPress={() => pickPhoto(false)} style={{ flex: 1 }}>
                  Retake
                </Button>
                <Button mode="contained" icon="upload" onPress={submit} loading={busy === 'submit'} style={{ flex: 1 }}>
                  Submit
                </Button>
              </View>
            </Animated.View>
          ) : (
            <>
              <Text style={styles.muted}>Take a clear photo of your work to submit it.</Text>
              <Pressable style={styles.cameraBtn} onPress={() => pickPhoto(false)} disabled={!!busy}>
                <LinearGradient colors={[COLORS.burgundy, COLORS.maroon]} style={styles.cameraInner}>
                  {busy === 'camera' ? (
                    <ActivityIndicator color={COLORS.cream} />
                  ) : (
                    <Icon source="camera" size={26} color={COLORS.cream} />
                  )}
                  <Text style={styles.cameraText}>Take a photo</Text>
                </LinearGradient>
              </Pressable>
              <Button mode="text" icon="image-outline" onPress={() => pickPhoto(true)} loading={busy === 'gallery'}>
                Choose from gallery
              </Button>
            </>
          )}
        </Animated.View>

        {/* Native actions */}
        <Animated.View entering={FadeInDown.delay(160).duration(350)} style={styles.section}>
          <Text style={styles.sectionTitle}>Stay on track</Text>
          <View style={styles.tiles}>
            <ActionTile icon="calendar-plus" label="Add to calendar" onPress={addToCalendar} busy={busy === 'calendar'} />
            <ActionTile icon="bell-ring-outline" label="Remind me" onPress={remind} busy={busy === 'remind'} color={COLORS.caramel} />
            <ActionTile icon="whatsapp" label="Share" onPress={share} busy={busy === 'share'} color="#25A244" />
          </View>
        </Animated.View>
      </ScrollView>

      <Portal>
        <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
          <Dialog.Icon icon="alert-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Delete assignment?</Dialog.Title>
          <Dialog.Content>
            <Text>"{assignment.title}" and its submission will be deleted.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              textColor="#B3261E"
              onPress={async () => {
                setConfirmDelete(false);
                await deleteAssignment(assignment.id);
                navigation.goBack();
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!message} onDismiss={() => setMessage('')} duration={3000}>
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  hero: { padding: 20, paddingTop: 10, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  circle: { position: 'absolute', width: 200, height: 200, borderRadius: 100, right: -70, top: -60, backgroundColor: 'rgba(255,255,255,0.07)' },
  heroCourse: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(251,246,238,0.75)' },
  heroTitle: { fontFamily: FONTS.semibold, fontSize: 22, lineHeight: 30, color: COLORS.cream, marginTop: 4 },
  heroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(251,246,238,0.15)',
  },
  heroChipText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.cream },
  section: {
    marginHorizontal: 18,
    marginTop: 16,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
  },
  sectionTitle: { fontFamily: FONTS.semibold, fontSize: 15, color: COLORS.maroon, marginBottom: 8 },
  body: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 21, color: COLORS.text },
  muted: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.muted, marginVertical: 6 },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 16, marginTop: 8, backgroundColor: COLORS.creamDark },
  row: { flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'center' },
  cameraBtn: { marginTop: 8, borderRadius: 18, overflow: 'hidden' },
  cameraInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  cameraText: { fontFamily: FONTS.semibold, fontSize: 15, color: COLORS.cream },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, backgroundColor: COLORS.cream },
  tileIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontFamily: FONTS.medium, fontSize: 11.5, color: COLORS.text, textAlign: 'center' },
});
