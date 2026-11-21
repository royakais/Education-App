// "submissions" collection — the student's CRUD entity.
// One submission per assignment, holding several compressed photos (base64).
// Doc id = `${userId}_${assignmentId}`, so a student can't submit the same assignment twice.
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const submissionsRef = collection(db, 'submissions');
const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : null);

export const MAX_PHOTOS = 6;
// Firestore documents are limited to 1 MB, so keep the photos well below that.
const MAX_TOTAL_CHARS = 900000;

function checkSize(images) {
  if (images.length === 0) throw new Error('Add at least one photo.');
  if (images.length > MAX_PHOTOS) throw new Error(`You can add up to ${MAX_PHOTOS} photos.`);
  const total = images.reduce((sum, img) => sum + img.length, 0);
  if (total > MAX_TOTAL_CHARS) throw new Error('These photos are too large together — remove one and try again.');
}

const submissionId = (userId, assignmentId) => `${userId}_${assignmentId}`;

// READ: live list of the student's submissions.
export function subscribeToSubmissions(userId, onChange, onError) {
  const q = query(submissionsRef, where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) =>
      onChange(
        snapshot.docs.map((d) => {
          const data = d.data();
          return { id: d.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
        })
      ),
    onError
  );
}

// CREATE
export async function createSubmission(userId, assignment, images) {
  checkSize(images);
  await setDoc(doc(db, 'submissions', submissionId(userId, assignment.id)), {
    userId,
    assignmentId: assignment.id,
    courseId: assignment.courseId,
    images,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// UPDATE: replace the list of photos (after adding, removing or replacing some).
export async function updateSubmission(id, images) {
  checkSize(images);
  await updateDoc(doc(db, 'submissions', id), { images, updatedAt: serverTimestamp() });
}

// DELETE
export function deleteSubmission(id) {
  return deleteDoc(doc(db, 'submissions', id));
}
