// All Firestore operations on the "courses" collection (CRUD).
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { DEFAULT_COURSES } from '../data/defaultCourses';
import { getStarterAssignments } from '../data/dummyCourseInfo';

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

// CREATE
export function addCourse(userId, { title, instructor, color }) {
  return addDoc(coursesRef, {
    userId,
    title,
    instructor: instructor ?? '',
    color,
    createdAt: serverTimestamp(),
  });
}

// UPDATE
export function updateCourse(courseId, { title, instructor, color }) {
  return updateDoc(doc(db, 'courses', courseId), { title, instructor, color });
}

// DELETE: removes the course and all of its assignments.
export async function deleteCourse(userId, courseId) {
  const assignments = await getDocs(
    query(
      collection(db, 'assignments'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    )
  );
  const batch = writeBatch(db);
  assignments.forEach((a) => batch.delete(a.ref));
  batch.delete(doc(db, 'courses', courseId));
  await batch.commit();
}

// Adds the sample assignments of a course (used at sign-up and from the Assignments tab).
export function addStarterAssignments(batch, userId, courseId, courseTitle) {
  getStarterAssignments(courseTitle).forEach((a) => {
    batch.set(doc(collection(db, 'assignments')), {
      userId,
      courseId,
      title: a.title,
      description: a.description,
      dueDate: Timestamp.fromDate(a.dueDate),
      submitted: a.submitted,
      ...(a.submitted ? { submittedAt: Timestamp.fromDate(a.submittedAt) } : {}),
      createdAt: serverTimestamp(),
    });
  });
}

// Called once at sign-up: gives the new student the default CS courses and their sample assignments.
export async function createDefaultCourses(userId) {
  const batch = writeBatch(db);
  DEFAULT_COURSES.forEach((course) => {
    const ref = doc(coursesRef);
    batch.set(ref, {
      userId,
      title: course.title,
      instructor: '',
      color: course.color,
      createdAt: serverTimestamp(),
    });
    addStarterAssignments(batch, userId, ref.id, course.title);
  });
  await batch.commit();
}

// For accounts made before assignments existed: adds sample assignments to the student's courses.
export async function createStarterAssignmentsFor(userId, courses) {
  const batch = writeBatch(db);
  courses.forEach((c) => addStarterAssignments(batch, userId, c.id, c.title));
  await batch.commit();
}
