// DUMMY course content (lectures, assignments, tests...) until it comes from Firestore.
// Dates are written as "days from today" so the demo always looks current.
import { addDays, daysUntil } from '../utils/dates';

const CATALOG = {
  'Mobile App Development': {
    code: 'CSC457',
    schedule: 'Mon & Wed · 11:00 – 12:15',
    room: 'Building B · Lab 204',
    description:
      'Build cross-platform mobile apps with React Native and Expo: screens and navigation, native device features, cloud backends with Firebase, and working with public APIs.',
    lectures: [
      [-16, 'Week 8', 'React Native components and styling'],
      [-12, 'Week 9', 'React Navigation: stack, tabs and drawer'],
      [-7, 'Week 10', 'Firebase Authentication'],
      [-5, 'Week 10', 'Cloud Firestore CRUD'],
      [2, 'Week 11', 'Native features with the Expo SDK'],
    ],
    assignments: [
      [-9, 'Project 1: REST API + React SPA', 'Node/Express API with a React single-page client.', -10],
      [2, 'Project 2: React Native app', 'Expo app with Firebase auth, Firestore CRUD, 3 navigators, 4 native features and a public API.', null],
    ],
    tests: [[18, 'Project 2 presentation', 'Presentation']],
  },
  'Information Security Systems': {
    code: 'CSC460',
    schedule: 'Tue & Thu · 9:30 – 10:45',
    room: 'Building A · Room 112',
    description:
      'Core concepts of information security: threats and attacks, cryptography, authentication, access control, network security and secure system design.',
    lectures: [
      [-13, 'Week 9', 'Symmetric and public-key cryptography'],
      [-8, 'Week 10', 'Authentication and password storage'],
      [-6, 'Week 10', 'Access control models'],
      [-1, 'Week 11', 'Firewalls and intrusion detection'],
    ],
    assignments: [
      [-6, 'Lab 4: Hashing and salting', 'Store and verify passwords with bcrypt and compare with plain SHA-256.', -7],
      [4, 'Lab 5: Firewall rules', 'Write iptables rules for the given network scenario and document each rule.', null],
    ],
    tests: [[10, 'Quiz 3: Network security', 'Quiz']],
  },
  'Data Analysis and Visualization': {
    code: 'CSC459',
    schedule: 'Mon & Wed · 2:00 – 3:15',
    room: 'Building C · Lab 301',
    description:
      'From raw data to insight: cleaning and exploring data with pandas, statistical summaries, and clear, honest visualizations with Matplotlib and Seaborn.',
    lectures: [
      [-14, 'Week 9', 'Exploratory data analysis with pandas'],
      [-9, 'Week 10', 'Choosing the right chart'],
      [-4, 'Week 10', 'Color, scales and annotations'],
      [-2, 'Week 11', 'Interactive dashboards'],
    ],
    assignments: [
      [-3, 'Homework 4: Cleaning a dataset', 'Handle missing values and outliers in the housing dataset.', -4],
      [5, 'Homework 5: Visual story', 'Build 4 charts that tell one story about the dataset of your choice.', null],
    ],
    tests: [[12, 'Quiz 2: Visualization', 'Quiz']],
  },
  'Linear Algebra': {
    code: 'MAT215',
    schedule: 'Tue & Thu · 12:30 – 1:45',
    room: 'Building D · Room 020',
    description:
      'Vectors, matrices, linear systems, determinants, vector spaces, eigenvalues and eigenvectors, with applications in computer science.',
    lectures: [
      [-12, 'Week 9', 'Determinants and their properties'],
      [-8, 'Week 10', 'Vector spaces and subspaces'],
      [-5, 'Week 10', 'Basis and dimension'],
      [-1, 'Week 11', 'Eigenvalues and eigenvectors'],
    ],
    assignments: [
      [-5, 'Problem set 5', 'Exercises 4.1 – 4.4 on vector spaces.', -5],
      [7, 'Problem set 6', 'Exercises 5.1 – 5.3 on eigenvalues and diagonalization.', null],
    ],
    tests: [[6, 'Quiz 3: Eigenvalues', 'Quiz']],
  },
  'Parallel and Distributed Systems': {
    code: 'CSC461',
    schedule: 'Fri · 9:00 – 11:45',
    room: 'Building B · Lab 210',
    description:
      'Designing programs that run on many cores and many machines: threads, OpenMP, MPI, synchronization, consistency and fault tolerance.',
    lectures: [
      [-14, 'Week 9', 'Shared-memory programming with OpenMP'],
      [-7, 'Week 10', 'Message passing with MPI'],
      [0, 'Week 11', 'Distributed consensus'],
    ],
    assignments: [
      [-7, 'Lab 3: OpenMP loops', 'Parallelize the matrix loops and measure the speed-up.', -8],
      [9, 'Lab 4: MPI matrix multiplication', 'Split the matrices across processes and gather the result.', null],
    ],
    tests: [[14, 'Midterm exam', 'Exam']],
  },
};

// Used for courses the student adds themselves.
const GENERIC = {
  code: 'NEW101',
  schedule: 'Schedule not set',
  room: 'Room not set',
  description: 'Add the course description, schedule and room once they are available.',
  lectures: [
    [-6, 'Week 1', 'Introduction and course overview'],
    [-1, 'Week 2', 'First topic'],
  ],
  assignments: [[8, 'Assignment 1', 'Details will be posted by the instructor.', null]],
  tests: [[15, 'Quiz 1', 'Quiz']],
};

const GRADING = [
  { label: 'Assignments', weight: 30 },
  { label: 'Quizzes', weight: 20 },
  { label: 'Midterm', weight: 20 },
  { label: 'Final', weight: 30 },
];

// Returns everything the screens need about a course, with real Date objects.
export function getCourseInfo(course) {
  const raw = CATALOG[course.title] ?? GENERIC;

  const lectures = raw.lectures.map(([offset, week, title], i) => ({
    id: `l${i}`,
    week,
    title,
    date: addDays(offset),
    done: offset < 0,
  }));

  const assignments = raw.assignments
    .map(([offset, title, description, submittedOffset], i) => ({
      id: `a${i}`,
      type: 'assignment',
      title,
      description,
      dueDate: addDays(offset),
      submitted: submittedOffset !== null,
      submittedAt: submittedOffset !== null ? addDays(submittedOffset) : null,
    }))
    .sort((a, b) => a.dueDate - b.dueDate);

  const tests = raw.tests.map(([offset, title, kind], i) => ({
    id: `t${i}`,
    type: 'test',
    title,
    kind,
    date: addDays(offset),
  }));

  // The closest assignment that is not submitted and not past due.
  const nextAssignment =
    assignments.find((a) => !a.submitted && daysUntil(a.dueDate) >= 0) ?? null;

  // Most recent lectures first (only ones that already happened).
  const recentLectures = lectures
    .filter((l) => l.done || daysUntil(l.date) === 0)
    .sort((a, b) => b.date - a.date);

  return {
    ...raw,
    instructor: course.instructor || 'Instructor not set',
    credits: 3,
    lectures,
    assignments,
    tests,
    nextAssignment,
    recentLectures,
    grading: GRADING,
  };
}
