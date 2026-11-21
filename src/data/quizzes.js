// The quizzes/tests found in the app (from each course), linked to an Open Trivia DB category
// so the student can practice for them.
import { getCourseInfo } from './dummyCourseInfo';

// Open Trivia DB categories: 18 = Science: Computers, 19 = Science: Mathematics.
function triviaCategoryFor(code) {
  return code.startsWith('MAT') ? { id: 19, name: 'Mathematics' } : { id: 18, name: 'Computers' };
}

export function getQuizzes(courses) {
  return courses
    .flatMap((course) => {
      const info = getCourseInfo(course);
      return info.tests.map((t) => ({
        id: `${course.id}:${t.id}`,
        course,
        code: info.code,
        title: t.title,
        kind: t.kind,
        date: t.date,
        category: triviaCategoryFor(info.code),
      }));
    })
    .sort((a, b) => a.date - b.date);
}

export function findQuiz(courses, quizId) {
  return getQuizzes(courses).find((q) => q.id === quizId) ?? null;
}
