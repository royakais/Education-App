// All Firestore operations on the "courses" collection (CRUD).
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
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

// CREATE: the new course also gets its default assignment(s).
export async function addCourse(userId, { title, instructor, color }) {
  const batch = writeBatch(db);
  const ref = doc(coursesRef);
  batch.set(ref, { userId, title, instructor: instructor ?? '', color, createdAt: serverTimestamp() });
  addDefaultAssignments(batch, userId, ref.id, title);
  await batch.commit();
}

// UPDATE
export function updateCourse(courseId, { title, instructor, color }) {
  return updateDoc(doc(db, 'courses', courseId), { title, instructor, color });
}

// DELETE: removes the course with its assignments and the student's submissions for it.
export async function deleteCourse(userId, courseId) {
  const byCourse = (name) =>
    getDocs(query(collection(db, name), where('userId', '==', userId), where('courseId', '==', courseId)));
  const [assignments, submissions] = await Promise.all([byCourse('assignments'), byCourse('submissions')]);
  const batch = writeBatch(db);
  assignments.forEach((a) => batch.delete(a.ref));
  submissions.forEach((s) => batch.delete(s.ref));
  batch.delete(doc(db, 'courses', courseId));
  await batch.commit();
}

// Called once at sign-up: gives the new student the default CS courses and their assignments.
export async function createDefaultCourses(userId) {
  const batch = writeBatch(db);
  DEFAULT_COURSES.forEach((course) => {
    const ref = doc(coursesRef);
    batch.set(ref, { userId, title: course.title, instructor: '', color: course.color, createdAt: serverTimestamp() });
    addDefaultAssignments(batch, userId, ref.id, course.title);
  });
  await batch.commit();
}
