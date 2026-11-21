// "courses" collection — the default courses of each student (read-only in the app).
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { DEFAULT_COURSES } from '../data/defaultCourses';
import { addDefaultAssignments } from './assignments';

const coursesRef = collection(db, 'courses');

// READ: listen to the student's courses. The callback runs again on every change.
export function subscribeToCourses(userId, onChange, onError) {
  const q = query(coursesRef, where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const courses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Oldest first (new courses go to the bottom), then alphabetically.
      const time = (c) => c.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
      courses.sort((a, b) => time(a) - time(b) || a.title.localeCompare(b.title));
      onChange(courses);
    },
    onError
  );
}

// Called once at sign-up: gives the new student the default CS courses and their assignments.
export async function createDefaultCourses(userId) {
  const batch = writeBatch(db);
  DEFAULT_COURSES.forEach((course) => {
    const ref = doc(coursesRef);
    batch.set(ref, { userId, title: course.title, color: course.color, createdAt: serverTimestamp() });
    addDefaultAssignments(batch, userId, ref.id, course.title);
  });
  await batch.commit();
}
