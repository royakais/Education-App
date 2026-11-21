# Education App — CSC457 Project 2

A student study app built with React Native (Expo) and Firebase. Students keep track of their courses and assignments, get deadline reminders, and practice with quizzes.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `a` to open it in the Android emulator.

## Tech

- **UI:** React Native Paper, Poppins font, maroon (#540804) + burgundy (#81171B) on cream
- **Navigation:** React Navigation (stack, bottom tabs, drawer)
- **Backend:** Firebase Authentication (email/password) + Cloud Firestore
- **Public API:** Open Trivia DB (practice quiz)

## Firestore structure

```
users/{uid}         name, email, createdAt
courses/{id}        userId, title, instructor, color
assignments/{id}    userId, courseId, title, description, dueDate        (default, read-only)
submissions/{uid_assignmentId}  userId, assignmentId, courseId, images[] (base64), createdAt, updatedAt
```

## Project structure

```
App.js                      providers + NavigationContainer
firebaseConfig.js           Firebase app, auth and Firestore
src/
  context/AuthContext.js    register / login / logout
  services/courses.js       Firestore CRUD for courses
  services/assignments.js   default assignments (read + seeding)
  services/submissions.js   Firestore CRUD for submissions
  native/                   camera, calendar, notifications, share (native features)
  hooks/useCourses.js       live course list
  data/dummyCourseInfo.js   DUMMY lectures, assignments, tests (dates relative to today)
  utils/dates.js            date helpers
  utils/crn.js              generated CRN per course
  data/defaultCourses.js    default courses + color palette
  navigation/AppNavigator.js
  screens/
    auth/                   Login, Register
    home/                   Home (welcome, carousel, calendar)
    courses/                Courses list, Course details, Course form (add/edit)
    assignments/            Assignments list, Assignment details
    quiz/                   Practice quiz
    ProfileScreen.js
  components/               CourseCarousel, WeekCalendar, MenuButton, Placeholder
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
- [x] Home: typing welcome + rotating smart line, centered course carousel (code + CRN) with fading course info, week calendar that expands to the month
- [x] Course page with full info (dummy lectures/assignments/tests for now)
- [x] Default assignments for every student (read-only)
- [x] Submissions CRUD (Firestore): create with several photos, view, edit (add / remove / replace photos), delete
- [x] Native features (Expo SDK):
  - Camera — `expo-image-picker` (camera + multi-select gallery) + `expo-image-manipulator` (compressed to base64)
  - Sensor — `expo-sensors` Accelerometer tilts the "SUBMITTED" stamp
  - Vibration — React Native `Vibration` long pattern on submit (+ `expo-haptics`)
  - Calendar — `expo-calendar` adds the due date to the phone's calendar
  - Notifications — `expo-notifications`: reminders 24 h, 6 h and 2 h before each deadline, cancelled on submit; "Test reminders" demo fires them in 5/10/15 s (local notifications, since remote push isn't available in Expo Go)
  - Share to WhatsApp — React Native `Linking` (`whatsapp://send`) with `Share` as fallback
- [ ] Open Trivia DB quiz
