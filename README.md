# Education App — CSC457 Project 2

A student study app built with React Native (Expo) and Firebase. Students keep track of their courses and assignments, get deadline reminders, and practice with quizzes.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `a` to open it in the Android emulator.

## Tech

- **UI:** React Native Paper, burgundy (#7A1F3D) + gold (#C9A24D) theme
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
  data/defaultCourses.js    default courses + color palette
  navigation/AppNavigator.js
  screens/
    auth/                   Login, Register
    courses/                Courses list, Course details, Course form (add/edit)
    assignments/            Assignments list, Assignment details
    quiz/                   Practice quiz
    ProfileScreen.js
  components/               MenuButton, Placeholder
  theme.js
```

## Navigation

- Logged out: **Stack** — Login → Register
- Logged in: **Drawer** — Home, Profile, Log out
  - Home: **Tabs** — Courses, Assignments, Quiz
    - Courses: **Stack** — Courses → Course details → Assignment details

## Status

- [x] Firebase auth (register, login, logout, stays logged in)
- [x] Stack, tab and drawer navigation with placeholder screens
- [x] Courses CRUD (5 default CS courses created at sign-up)
- [x] Burgundy + gold theme
- [ ] Assignments CRUD + camera photo
- [ ] Native features: notifications, calendar, share, haptics
- [ ] Open Trivia DB quiz
