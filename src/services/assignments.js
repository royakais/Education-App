// "assignments" collection — DEFAULT assignments, created for every student, read-only in the app.
// (The student's CRUD entity is the submission: see services/submissions.js.)
import { Timestamp, collection, doc, onSnapshot, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getStarterAssignments } from '../data/dummyCourseInfo';

const assignmentsRef = collection(db, 'assignments');
const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : null);

// READ: live list of the student's assignments, nearest due date first.
export function subscribeToAssignments(userId, onChange, onError) {
  const q = query(assignmentsRef, where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => {
        const data = d.data();
        return { id: d.id, userId: data.userId, courseId: data.courseId, title: data.title, description: data.description, dueDate: toDate(data.dueDate) };
      });
      list.sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0));
      onChange(list);
    },
    onError
  );
}

// Adds a course's default assignments to a write batch.
export function addDefaultAssignments(batch, userId, courseId, courseTitle) {
  getStarterAssignments(courseTitle).forEach((a) => {
    batch.set(doc(assignmentsRef), {
      userId,
      courseId,
      title: a.title,
      description: a.description,
      dueDate: Timestamp.fromDate(a.dueDate),
      createdAt: serverTimestamp(),
    });
  });
}

// For accounts that don't have assignments yet: creates the defaults for their courses.
export async function createDefaultAssignmentsFor(userId, courses) {
  const batch = writeBatch(db);
  courses.forEach((c) => addDefaultAssignments(batch, userId, c.id, c.title));
  await batch.commit();
}
