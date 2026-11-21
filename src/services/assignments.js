// All Firestore operations on the "assignments" collection (CRUD + submit).
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const assignmentsRef = collection(db, 'assignments');

// Firestore Timestamp → JS Date (and back).
const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : null);
const toTimestamp = (d) => Timestamp.fromDate(d instanceof Date ? d : new Date(d));

// READ: live list of the student's assignments, nearest due date first.
export function subscribeToAssignments(userId, onChange, onError) {
  const q = query(assignmentsRef, where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          dueDate: toDate(data.dueDate),
          submittedAt: toDate(data.submittedAt),
          createdAt: toDate(data.createdAt),
        };
      });
      list.sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0));
      onChange(list);
    },
    onError
  );
}

// CREATE
export function addAssignment(userId, { courseId, title, description, dueDate }) {
  return addDoc(assignmentsRef, {
    userId,
    courseId,
    title,
    description: description ?? '',
    dueDate: toTimestamp(dueDate),
    submitted: false,
    createdAt: serverTimestamp(),
  });
}

// UPDATE (details)
export function updateAssignment(id, { courseId, title, description, dueDate }) {
  return updateDoc(doc(db, 'assignments', id), {
    courseId,
    title,
    description: description ?? '',
    dueDate: toTimestamp(dueDate),
  });
}

// UPDATE (submit): saves the compressed photo and marks it submitted.
export function submitAssignment(id, imageBase64) {
  return updateDoc(doc(db, 'assignments', id), {
    imageBase64,
    submitted: true,
    submittedAt: serverTimestamp(),
  });
}

// UPDATE (undo submit)
export function removeSubmission(id) {
  return updateDoc(doc(db, 'assignments', id), {
    imageBase64: deleteField(),
    submitted: false,
    submittedAt: deleteField(),
  });
}

// DELETE
export function deleteAssignment(id) {
  return deleteDoc(doc(db, 'assignments', id));
}
