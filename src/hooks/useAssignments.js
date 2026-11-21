// Live assignments + the student's submissions, merged:
// each assignment gets `submission` (or null), `submitted` and `submittedAt`.
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToAssignments } from '../services/assignments';
import { subscribeToSubmissions } from '../services/submissions';

export function useAssignments() {
  const { user } = useAuth();
  const [rawAssignments, setRawAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stopA = subscribeToAssignments(
      user.uid,
      (data) => {
        setRawAssignments(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    const stopS = subscribeToSubmissions(user.uid, setSubmissions, () => {});
    return () => {
      stopA();
      stopS();
    };
  }, [user.uid]);

  const assignments = useMemo(() => {
    const byAssignment = Object.fromEntries(submissions.map((s) => [s.assignmentId, s]));
    return rawAssignments.map((a) => {
      const submission = byAssignment[a.id] ?? null;
      return {
        ...a,
        submission,
        submitted: !!submission,
        submittedAt: submission ? submission.updatedAt ?? submission.createdAt ?? new Date() : null,
      };
    });
  }, [rawAssignments, submissions]);

  return { assignments, submissions, loading };
}
