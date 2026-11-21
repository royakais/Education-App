# Education App — CSC457 Project 2

A student study app built with React Native (Expo) and Firebase. Students keep track of their courses and assignments, get deadline reminders, and practice with quizzes.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `a` to open it in the Android emulator.

## Tech

- **UI:** React Native Paper, maroon (#540804) + burgundy (#81171B) on cream
- **Navigation:** React Navigation (stack, bottom tabs, drawer)
- **Backend:** Firebase Authentication (email/password) + Cloud Firestore
- **Public API:** Open Trivia DB (practice quiz)

## Firestore structure

```
users/{uid}         name, email, createdAt
courses/{id}        userId, title, instructor, color
assignments/{id}    userId, courseId, title, description, dueDate, done, imageBase64 (optional)
```

## Project structure

```
App.js                      providers + NavigationContainer
firebaseConfig.js           Firebase app, auth and Firestore
src/
  context/AuthContext.js    register / login / logout
  services/courses.js       Firestore CRUD for courses
  hooks/useCourses.js       live course list
  data/dummyCourseInfo.js   DUMMY lectures, assignments, tests (dates relative to today)
  utils/dates.js            date helpers
  data/defaultCourses.js    default courses + color palette
  navigation/AppNavigator.js
  screens/
    auth/                   Login, Register
    home/                   Home (welcome, carousel, calendar)
    courses/                Courses list, Course details, Course form (add/edit)
    assignments/            Assignments list, Assignment details
    quiz/                   Practice quiz
    ProfileScreen.js
  components/               CourseCard, EventCalendar, MenuButton, Placeholder
  theme.js
```

## Navigation

- Logged out: **Stack** — Login → Register
- Logged in: **Drawer** — Home, Profile, Log out
  - **Tabs** — Home, Courses, Assignments, Quiz
    - Home: **Stack** — Dashboard → Course page
    - Courses: **Stack** — Courses list → Course page → Edit course

## Status

- [x] Firebase auth (register, login, logout, stays logged in)
- [x] Stack, tab and drawer navigation with placeholder screens
- [x] Courses CRUD (5 default CS courses created at sign-up)
- [x] Home: welcome, swipeable course cards (nearest deadline first) with animated dropdown, calendar of deadlines and tests
- [x] Course page with full info (dummy lectures/assignments/tests for now)
- [ ] Assignments CRUD + camera photo
- [ ] Native features: notifications, calendar, share, haptics
- [ ] Open Trivia DB quiz
