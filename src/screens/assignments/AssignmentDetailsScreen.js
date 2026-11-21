// Assignment page. Assignments are default (read-only); the student's CRUD entity is the SUBMISSION:
//   Create — take/choose several photos, then Submit
//   Read   — see the submitted photos (tap one to open it)
//   Update — Edit: add, remove or replace photos, then Save
//   Delete — Delete submission
// Plus native actions: calendar, reminders (with a demo button), WhatsApp share.
import { useEffect, useLayoutEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Button, Dialog, Icon, Portal, Snackbar, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';
import { useAssignments } from '../../hooks/useAssignments';
import { useCourses } from '../../hooks/useCourses';
import { getCourseInfo } from '../../data/dummyCourseInfo';
import { MAX_PHOTOS, createSubmission, deleteSubmission, updateSubmission } from '../../services/submissions';
import { pickPhotos, takePhoto } from '../../native/camera';
import { addAssignmentToCalendar, isInCalendar, removeAssignmentFromCalendar } from '../../native/calendar';
import { scheduleDemoReminders, upcomingReminders } from '../../native/notifications';
import { shareAssignmentOnWhatsApp } from '../../native/share';
import { tapFeedback, vibrateSubmitted } from '../../native/vibration';
import SubmittedStamp from '../../components/SubmittedStamp';
import { COLORS, FONTS } from '../../theme';
import { daysUntil, formatDayMonth, formatLong, relativeDay } from '../../utils/dates';

const uri = (b64) => `data:image/jpeg;base64,${b64}`;

function ActionTile({ icon, label, color = COLORS.burgundy, onPress, busy, disabled }) {
  return (
    <Pressable style={[styles.tile, disabled && { opacity: 0.4 }]} onPress={onPress} disabled={busy || disabled}>
      <View style={[styles.tileIcon, { backgroundColor: `${color}1A` }]}>
        {busy ? <ActivityIndicator size={18} color={color} /> : <Icon source={icon} size={22} color={color} />}
      </View>
      <Text style={styles.tileText}>{label}</Text>
    </Pressable>
  );
}

export default function AssignmentDetailsScreen({ route, navigation }) {
  const { assignmentId } = route.params;
  const { user } = useAuth();
  const { assignments, loading } = useAssignments();
  const { courses } = useCourses();
  const { width } = useWindowDimensions();
  const assignment = assignments.find((a) => a.id === assignmentId);
  const course = courses.find((c) => c.id === assignment?.courseId);
  const code = course ? getCourseInfo(course).code : '';
  const submission = assignment?.submission;

  const [draft, setDraft] = useState(null); // array of base64 while creating/editing, null otherwise
  const [busy, setBusy] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewer, setViewer] = useState(null); // photo opened full screen
  const [message, setMessage] = useState('');
  const [messageAction, setMessageAction] = useState(null); // optional button on the snackbar
  const [inCalendar, setInCalendar] = useState(false);

  // Was this deadline already added to the phone calendar? (remembered in local storage)
  useEffect(() => {
    isInCalendar(assignmentId).then(setInCalendar);
  }, [assignmentId]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: code });
  }, [navigation, code]);

  const run = async (name, fn) => {
    setBusy(name);
    try {
      await fn();
    } catch (e) {
      // If Android blocked notifications/permissions, offer a shortcut to the app's settings.
      setMessageAction(
        e.code === 'notifications-blocked' || /permission/i.test(e.message)
          ? { label: 'Settings', onPress: () => Linking.openSettings() }
          : null
      );
      setMessage(e.message);
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} />;
  if (!assignment) {
    return <Text style={{ textAlign: 'center', marginTop: 60, fontFamily: FONTS.regular }}>Assignment not found.</Text>;
  }

  const editing = draft !== null;
  const late = !assignment.submitted && daysUntil(assignment.dueDate) < 0;
  const info = { assignmentId: assignment.id, title: assignment.title, description: assignment.description, dueDate: assignment.dueDate, courseCode: code };
  const thumb = Math.floor((width - 36 - 34 - 16) / 3); // 3 photos per row inside the card (margins, padding, border, gaps)
  const reminders = upcomingReminders(assignment);

  // ---------- photos (draft) ----------
  const addFromCamera = (replaceIndex = null) =>
    run('camera', async () => {
      const photos = await takePhoto();
      if (!photos.length) return;
      setDraft((d) => {
        const list = [...(d ?? [])];
        if (replaceIndex !== null) list[replaceIndex] = photos[0];
        else list.push(photos[0]);
        return list;
      });
    });

  const addFromGallery = () =>
    run('gallery', async () => {
      const room = MAX_PHOTOS - (draft?.length ?? 0);
      if (room <= 0) throw new Error(`You can add up to ${MAX_PHOTOS} photos.`);
      const photos = await pickPhotos(room);
      if (photos.length) setDraft((d) => [...(d ?? []), ...photos]);
    });

  const removeFromDraft = (i) => {
    tapFeedback();
    setDraft((d) => d.filter((_, idx) => idx !== i));
  };

  // ---------- CRUD ----------
  const submit = () =>
    run('save', async () => {
      if (submission) {
        await updateSubmission(submission.id, draft); // UPDATE
        tapFeedback();
        setMessage('Submission updated ✓');
      } else {
        await createSubmission(user.uid, assignment, draft); // CREATE
        vibrateSubmitted(); // long vibration = submitted
        setCelebrate(true);
        // Submitted → the deadline isn't needed in the calendar anymore (reminders are cancelled by ReminderSync).
        const removed = await removeAssignmentFromCalendar(assignment.id).catch(() => false);
        setInCalendar(false);
        setMessageAction(null);
        setMessage(removed ? 'Submitted ✓ — removed from your calendar and reminders' : 'Submitted ✓ — reminders turned off');
      }
      setDraft(null);
    });

  const remove = () =>
    run('delete', async () => {
      setConfirmDelete(false);
      await deleteSubmission(submission.id); // DELETE
      setCelebrate(false);
      tapFeedback();
      setMessage('Submission deleted — reminders are back on 🔔');
    });

  // ---------- other native actions ----------
  const addToCalendar = () =>
    run('calendar', async () => {
      const result = await addAssignmentToCalendar(info);
      if (result.mode === 'added') setInCalendar(true);
      setMessageAction(null);
      setMessage(
        result.mode === 'added'
          ? `Added to your calendar for ${formatDayMonth(result.when)} ✓`
          : 'Opened your calendar — tap Save to add it ✓'
      );
    });
  const demo = () =>
    run('demo', async () => {
      await scheduleDemoReminders(assignment, code);
      setMessageAction(null);
      setMessage('Demo: 3 reminders in 5, 10 and 15 seconds 🔔 — lock your phone to see them');
    });
  const share = () => run('share', () => shareAssignmentOnWhatsApp({ ...info, submitted: assignment.submitted }));

  // ---------- UI pieces ----------
  const renderGrid = (photos, editable) => (
    <View style={styles.grid}>
      {photos.map((b64, i) => (
        <Animated.View key={`${i}-${b64.length}`} entering={ZoomIn.duration(250)} exiting={FadeOut.duration(150)} layout={LinearTransition}>
          <Pressable onPress={() => setViewer(b64)}>
            <Image source={{ uri: uri(b64) }} style={[styles.thumb, { width: thumb, height: thumb }]} />
          </Pressable>
          {editable ? (
            <View style={styles.thumbActions}>
              <Pressable style={styles.thumbBtn} onPress={() => addFromCamera(i)} hitSlop={6}>
                <Icon source="camera-retake-outline" size={14} color={COLORS.cream} />
              </Pressable>
              <Pressable style={styles.thumbBtn} onPress={() => removeFromDraft(i)} hitSlop={6}>
                <Icon source="close" size={14} color={COLORS.cream} />
              </Pressable>
            </View>
          ) : null}
        </Animated.View>
      ))}
      {editable && photos.length < MAX_PHOTOS ? (
        <>
          <Pressable style={[styles.addTile, { width: thumb, height: thumb }]} onPress={() => addFromCamera()}>
            {busy === 'camera' ? <ActivityIndicator color={COLORS.burgundy} /> : <Icon source="camera-plus-outline" size={26} color={COLORS.burgundy} />}
            <Text style={styles.addTileText}>Camera</Text>
          </Pressable>
          <Pressable style={[styles.addTile, { width: thumb, height: thumb }]} onPress={addFromGallery}>
            {busy === 'gallery' ? <ActivityIndicator color={COLORS.burgundy} /> : <Icon source="image-multiple-outline" size={26} color={COLORS.burgundy} />}
            <Text style={styles.addTileText}>Gallery</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );

  let submissionBody;
  if (editing) {
    submissionBody = (
      <Animated.View entering={FadeIn.duration(250)}>
        <Text style={styles.muted}>
          {draft.length} / {MAX_PHOTOS} photos · ↻ replaces a photo, ✕ removes it
        </Text>
        {renderGrid(draft, true)}
        <View style={styles.row}>
          <Button mode="outlined" onPress={() => setDraft(null)} style={{ flex: 1 }} textColor={COLORS.maroon}>
            Cancel
          </Button>
          <Button
            mode="contained"
            icon={submission ? 'content-save-outline' : 'upload'}
            onPress={submit}
            loading={busy === 'save'}
            disabled={!draft.length || !!busy}
            style={{ flex: 1 }}
          >
            {submission ? 'Save' : 'Submit'}
          </Button>
        </View>
      </Animated.View>
    );
  } else if (submission) {
    submissionBody = (
      <>
        <SubmittedStamp submittedAt={assignment.submittedAt} celebrate={celebrate} />
        <Text style={styles.muted}>
          {submission.images.length} photo{submission.images.length > 1 ? 's' : ''} submitted · tap one to open it
        </Text>
        {renderGrid(submission.images, false)}
        <View style={styles.row}>
          <Button mode="outlined" icon="pencil-outline" onPress={() => setDraft([...submission.images])} style={{ flex: 1 }} textColor={COLORS.maroon}>
            Edit submission
          </Button>
          <Button mode="text" textColor="#B3261E" onPress={() => setConfirmDelete(true)} loading={busy === 'delete'}>
            Delete
          </Button>
        </View>
      </>
    );
  } else {
    submissionBody = (
      <>
        <Text style={styles.muted}>Take clear photos of your work (up to {MAX_PHOTOS}), then submit.</Text>
        <Pressable style={styles.cameraBtn} onPress={() => addFromCamera()} disabled={!!busy}>
          <LinearGradient colors={[COLORS.burgundy, COLORS.maroon]} style={styles.cameraInner}>
            {busy === 'camera' ? <ActivityIndicator color={COLORS.cream} /> : <Icon source="camera" size={26} color={COLORS.cream} />}
            <Text style={styles.cameraText}>Take a photo</Text>
          </LinearGradient>
        </Pressable>
        <Button mode="text" icon="image-multiple-outline" onPress={addFromGallery} loading={busy === 'gallery'}>
          Choose from gallery
        </Button>
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Floating assignment card */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.heroShadow}>
          <LinearGradient colors={[COLORS.burgundy, COLORS.maroon]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.circle} />
            <Text style={styles.heroCourse}>{course?.title}</Text>
            <Text style={styles.heroTitle}>{assignment.title}</Text>
            <View style={styles.heroRow}>
              <View style={styles.heroChip}>
                <Icon source="calendar" size={14} color={COLORS.cream} />
                <Text style={styles.heroChipText}>{formatLong(assignment.dueDate)} · 23:59</Text>
              </View>
              <View style={[styles.heroChip, { backgroundColor: assignment.submitted ? '#E3EEDF' : late ? '#F7D9D6' : COLORS.gold }]}>
                <Text style={[styles.heroChipText, { color: assignment.submitted ? '#2F6B3E' : COLORS.maroon }]}>
                  {assignment.submitted ? 'Submitted' : late ? 'Late' : `Due ${relativeDay(assignment.dueDate)}`}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {assignment.description ? (
          <Animated.View entering={FadeInDown.delay(60).duration(350)} style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.body}>{assignment.description}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(120).duration(350)} layout={LinearTransition} style={styles.section}>
          <Text style={styles.sectionTitle}>Your submission</Text>
          {submissionBody}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(350)} layout={LinearTransition} style={styles.section}>
          <Text style={styles.sectionTitle}>Stay on track</Text>
          <View style={styles.reminderLine}>
            <Icon source={reminders.length ? 'bell-ring-outline' : 'bell-off-outline'} size={16} color={COLORS.caramel} />
            <Text style={styles.reminderText}>
              {assignment.submitted
                ? 'Submitted — reminders are off and the deadline was removed from your calendar.'
                : reminders.length
                  ? `Reminders: ${reminders.map((r) => r.label.replace(' hours', ' h')).join(' · ')} before the deadline`
                  : 'No reminders left before this deadline.'}
            </Text>
          </View>
          <View style={styles.tiles}>
            <ActionTile
              icon={inCalendar ? 'calendar-check' : 'calendar-plus'}
              label={inCalendar ? 'In calendar' : 'Add to calendar'}
              onPress={addToCalendar}
              busy={busy === 'calendar'}
              disabled={assignment.submitted || inCalendar}
            />
            <ActionTile
              icon="bell-ring-outline"
              label="Test reminders"
              onPress={demo}
              busy={busy === 'demo'}
              color={COLORS.caramel}
              disabled={assignment.submitted}
            />
            <ActionTile icon="whatsapp" label="Share" onPress={share} busy={busy === 'share'} color="#25A244" />
          </View>
        </Animated.View>
      </ScrollView>

      <Portal>
        <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)} style={{ backgroundColor: COLORS.card }}>
          <Dialog.Icon icon="alert-outline" />
          <Dialog.Title style={{ textAlign: 'center', fontFamily: FONTS.semibold, color: COLORS.maroon }}>Delete submission?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontFamily: FONTS.regular }}>Your photos for this assignment will be removed.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(false)}>Cancel</Button>
            <Button textColor="#B3261E" onPress={remove}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        {viewer ? (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.viewer}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setViewer(null)} />
            <Image source={{ uri: uri(viewer) }} style={styles.viewerImage} resizeMode="contain" />
            <Pressable style={styles.viewerClose} onPress={() => setViewer(null)}>
              <Icon source="close" size={22} color={COLORS.cream} />
            </Pressable>
          </Animated.View>
        ) : null}
      </Portal>

      <Snackbar
        visible={!!message}
        onDismiss={() => setMessage('')}
        duration={messageAction ? 6000 : 3500}
        action={messageAction ?? undefined}
      >
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
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
  circle: { position: 'absolute', width: 200, height: 200, borderRadius: 100, right: -70, top: -60, backgroundColor: 'rgba(255,255,255,0.07)' },
  heroCourse: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(251,246,238,0.75)' },
  heroTitle: { fontFamily: FONTS.semibold, fontSize: 22, lineHeight: 30, color: COLORS.cream, marginTop: 4 },
  heroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  heroChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(251,246,238,0.15)' },
  heroChipText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.cream },
  section: { marginHorizontal: 18, marginTop: 14, padding: 16, borderRadius: 22, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.creamDark },
  sectionTitle: { fontFamily: FONTS.semibold, fontSize: 15, color: COLORS.maroon, marginBottom: 8 },
  body: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 21, color: COLORS.text },
  muted: { fontFamily: FONTS.regular, fontSize: 12.5, color: COLORS.muted, marginVertical: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  thumb: { borderRadius: 14, backgroundColor: COLORS.creamDark },
  thumbActions: { position: 'absolute', top: 6, right: 6, flexDirection: 'row', gap: 4 },
  thumbBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(42,20,18,0.65)', alignItems: 'center', justifyContent: 'center' },
  addTile: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(129,23,27,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.cream,
  },
  addTileText: { fontFamily: FONTS.medium, fontSize: 11.5, color: COLORS.burgundy },
  row: { flexDirection: 'row', gap: 10, marginTop: 14, alignItems: 'center' },
  cameraBtn: { marginTop: 8, borderRadius: 18, overflow: 'hidden' },
  cameraInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  cameraText: { fontFamily: FONTS.semibold, fontSize: 15, color: COLORS.cream },
  reminderLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  reminderText: { flex: 1, fontFamily: FONTS.regular, fontSize: 12.5, color: COLORS.text },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, backgroundColor: COLORS.cream },
  tileIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontFamily: FONTS.medium, fontSize: 11.5, color: COLORS.text, textAlign: 'center' },
  viewer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,8,6,0.92)', alignItems: 'center', justifyContent: 'center' },
  viewerImage: { width: '92%', height: '75%' },
  viewerClose: { position: 'absolute', top: 56, right: 22, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(251,246,238,0.15)', alignItems: 'center', justifyContent: 'center' },
});
