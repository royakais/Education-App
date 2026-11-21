// NATIVE FEATURE: Notifications (expo-notifications).
// Expo Go can't receive remote push notifications on Android (since SDK 53), so the reminders
// are LOCAL notifications scheduled on the phone itself — they still pop up like a push notification.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Show notifications even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Assignment reminders',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#81171B',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return;
  const asked = await Notifications.requestPermissionsAsync();
  if (!asked.granted) throw new Error('Notification permission was denied.');
}

// Reminder at 9:00 the day before the due date. If that moment has passed, remind in 10 seconds
// (handy for the demo).
export async function scheduleAssignmentReminder({ title, dueDate, courseCode }) {
  await ensurePermission();

  let when = new Date(dueDate);
  when.setDate(when.getDate() - 1);
  when.setHours(9, 0, 0, 0);
  const soon = when.getTime() <= Date.now();
  if (soon) when = new Date(Date.now() + 10 * 1000);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `📚 ${courseCode}: ${title}`,
      body: soon ? 'This assignment is due soon — don’t forget to submit it!' : 'Due tomorrow. Don’t forget to submit it!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      channelId: 'reminders',
    },
  });
  return { when, soon };
}
