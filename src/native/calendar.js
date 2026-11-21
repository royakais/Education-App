// NATIVE FEATURE: Calendar (expo-calendar) — adds an assignment's due date to the phone's calendar.
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

async function findWritableCalendar() {
  if (Platform.OS === 'ios') return Calendar.getDefaultCalendarSync();
  // Android has no single default calendar: use the primary writable one.
  const calendars = await Calendar.getCalendars();
  return (
    calendars.find((c) => c.allowsModifications && c.isPrimary) ??
    calendars.find((c) => c.allowsModifications) ??
    null
  );
}

export async function addAssignmentToCalendar({ title, description, dueDate, courseCode }) {
  const { granted } = await Calendar.requestCalendarPermissions();
  if (!granted) throw new Error('Calendar permission was denied.');

  const calendar = await findWritableCalendar();
  if (!calendar) throw new Error('No calendar on this phone can be edited.');

  const start = new Date(dueDate);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  end.setHours(10, 0, 0, 0);

  await calendar.createEvent({
    title: `${courseCode} · ${title} (due)`,
    notes: description,
    startDate: start,
    endDate: end,
    alarms: [{ relativeOffset: -24 * 60 }], // phone alarm one day before
  });
  return start;
}
