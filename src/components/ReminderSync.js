// Invisible helper mounted once after login: keeps the 24 h / 6 h / 2 h reminders in sync
// with the assignments (new ones scheduled, submitted ones cancelled).
import { useEffect } from 'react';
import { useAssignments } from '../hooks/useAssignments';
import { useCourses } from '../hooks/useCourses';
import { getCourseInfo } from '../data/dummyCourseInfo';
import { syncReminders } from '../native/notifications';

export default function ReminderSync() {
  const { assignments, loading } = useAssignments();
  const { courses } = useCourses();

  // Re-sync only when something that affects reminders changes.
  const signature = assignments.map((a) => `${a.id}:${a.submitted}:${a.dueDate?.getTime()}`).join('|');

  useEffect(() => {
    if (loading || courses.length === 0) return;
    const byId = Object.fromEntries(courses.map((c) => [c.id, c]));
    const codeOf = (a) => (byId[a.courseId] ? getCourseInfo(byId[a.courseId]).code : 'Course');
    syncReminders(assignments.filter((a) => byId[a.courseId]), codeOf).catch(() => {});
  }, [signature, loading, courses.length]);

  return null;
}
