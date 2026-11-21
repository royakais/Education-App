// NATIVE FEATURE: Calendar (expo-calendar).
// Uses the classic expo-calendar API ("expo-calendar/legacy") because the new SDK 58 calendar API
// is NOT available inside Expo Go (it's replaced by a stub that throws).
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar/legacy';

function phoneTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Beirut';
  } catch {
    return 'Asia/Beirut';
  }
}

async function findWritableCalendarId() {
  if (Platform.OS === 'ios') {
    const def = await Calendar.getDefaultCalendarAsync();
    return def?.id ?? null;
  }
  // Android has no single default calendar: use the primary writable one (usually the Google account).
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.filter((c) => c.allowsModifications);
  return (writable.find((c) => c.isPrimary) ?? writable[0])?.id ?? null;
}

// Adds the deadline to the phone's calendar (with an alarm 1 day before).
// Returns { mode: 'added' } when saved directly, or { mode: 'form' } when the phone's own
// calendar screen was opened instead (no writable calendar / permission denied).
export async function addAssignmentToCalendar({ title, description, dueDate, courseCode }) {
  const end = new Date(dueDate); // deadline = 23:59
  const start = new Date(end.getTime() - 60 * 60 * 1000); // 1-hour event before the deadline
  const event = {
    title: `${courseCode} · ${title} (due)`,
    notes: description,
    startDate: start,
    endDate: end,
    timeZone: phoneTimeZone(), // required on Android
    alarms: [{ relativeOffset: -24 * 60 }],
  };

  const { granted } = await Calendar.requestCalendarPermissionsAsync();
  const calendarId = granted ? await findWritableCalendarId() : null;

  if (calendarId) {
    await Calendar.createEventAsync(calendarId, event);
    return { mode: 'added', when: end };
  }

  // Fallback: open the phone's calendar app with the event filled in; the student taps Save.
  await Calendar.createEventInCalendarAsync(event);
  return { mode: 'form', when: end };
}
