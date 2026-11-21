// NATIVE FEATURE: Calendar (expo-calendar).
// Uses the classic expo-calendar API ("expo-calendar/legacy") because the new SDK 58 calendar API
// is NOT available inside Expo Go (it's replaced by a stub that throws).
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar/legacy';
import { getItem, removeItem, setItem } from './storage';

const eventKey = (assignmentId) => `calendar-event:${assignmentId}`;

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
export async function addAssignmentToCalendar({ assignmentId, title, description, dueDate, courseCode }) {
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
    const eventId = await Calendar.createEventAsync(calendarId, event);
    await setItem(eventKey(assignmentId), eventId); // remember it, to remove it after submitting
    return { mode: 'added', when: end };
  }

  // Fallback: open the phone's calendar app with the event filled in; the student taps Save.
  await Calendar.createEventInCalendarAsync(event);
  return { mode: 'form', when: end };
}

// Is this assignment's deadline already in the phone calendar (added by the app)?
export async function isInCalendar(assignmentId) {
  return !!(await getItem(eventKey(assignmentId)));
}

// Called after submitting: removes the deadline from the phone calendar.
export async function removeAssignmentFromCalendar(assignmentId) {
  const eventId = await getItem(eventKey(assignmentId));
  if (!eventId) return false;
  try {
    await Calendar.deleteEventAsync(eventId);
  } catch {
    // Event was already deleted by the student in their calendar app.
  }
  await removeItem(eventKey(assignmentId));
  return true;
}
