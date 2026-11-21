// NATIVE FEATURE: Notifications (expo-notifications).
// Every assignment that isn't submitted gets 3 reminders: 24 h, 6 h and 2 h before the deadline.
// They're cancelled as soon as the assignment is submitted.
// Expo Go can't receive REMOTE push notifications on Android (since SDK 53), so these are LOCAL
// notifications scheduled on the phone — they still appear as normal notification banners.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const REMINDERS = [
  { key: '24h', hours: 24, label: '24 hours' },
  { key: '6h', hours: 6, label: '6 hours' },
  { key: '2h', hours: 2, label: '2 hours' },
];

// Show notifications even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let permissionAsked = false;

async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Assignment reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
      lightColor: '#81171B',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (permissionAsked) return false;
  permissionAsked = true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

const reminderId = (assignmentId, key) => `reminder-${assignmentId}-${key}`;

function reminderContent(assignment, courseCode, label) {
  return {
    title: `⏰ ${label} left · ${courseCode}`,
    body: `${assignment.title} is due soon. Don’t forget to submit it!`,
    sound: true,
    data: { assignmentId: assignment.id },
  };
}

// Makes the scheduled reminders match the assignments: schedules missing ones,
// cancels the ones of submitted (or removed) assignments. Safe to call often.
export async function syncReminders(assignments, codeOf) {
  if (!(await ensurePermission())) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const existing = new Set(scheduled.map((n) => n.identifier));
  const wanted = new Set();
  const now = Date.now();

  for (const a of assignments) {
    if (a.submitted || !a.dueDate) continue;
    for (const r of REMINDERS) {
      const when = new Date(a.dueDate.getTime() - r.hours * 3600 * 1000);
      if (when.getTime() <= now + 5000) continue; // already passed
      const id = reminderId(a.id, r.key);
      wanted.add(id);
      if (!existing.has(id)) {
        await Notifications.scheduleNotificationAsync({
          identifier: id,
          content: reminderContent(a, codeOf(a), r.label),
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: 'reminders' },
        });
      }
    }
  }

  for (const n of scheduled) {
    if (n.identifier.startsWith('reminder-') && !wanted.has(n.identifier)) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

// Which reminders are still coming for one assignment (for the assignment page).
export function upcomingReminders(assignment) {
  if (!assignment?.dueDate || assignment.submitted) return [];
  const now = Date.now();
  return REMINDERS.filter((r) => assignment.dueDate.getTime() - r.hours * 3600 * 1000 > now);
}

// DEMO for the presentation: the same 3 reminders, but 5, 10 and 15 seconds from now.
export async function scheduleDemoReminders(assignment, courseCode) {
  if (!(await ensurePermission())) throw new Error('Notification permission was denied.');
  for (const [i, r] of REMINDERS.entries()) {
    await Notifications.scheduleNotificationAsync({
      content: reminderContent(assignment, courseCode, r.label),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5 * (i + 1),
        channelId: 'reminders',
      },
    });
  }
}
