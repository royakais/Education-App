// Live list of the logged-in student's assignments from Firestore.
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToAssignments } from '../services/assignments';

export function useAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAssignments(
      user.uid,
      (data) => {
        setAssignments(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, [user.uid]);

  return { assignments, loading };
}
