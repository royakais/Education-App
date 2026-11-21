// Live list of the logged-in student's courses from Firestore.
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToCourses } from '../services/courses';

export function useCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToCourses(
      user.uid,
      (data) => {
        setCourses(data);
        setLoading(false);
      },
      (e) => {
        setError(e);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user.uid]);

  return { courses, loading, error };
}
