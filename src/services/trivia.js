// PUBLIC WEB API: Open Trivia DB (https://opentdb.com) — free, no API key.
// GET https://opentdb.com/api.php?amount=10&category=18&type=multiple&encode=url3986
const BASE = 'https://opentdb.com/api.php';

const decode = (s) => decodeURIComponent(s);

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Returns [{ question, answers: [4 strings, shuffled], correct }]
export async function fetchQuestions(categoryId, amount = 10, retry = true) {
  const url = `${BASE}?amount=${amount}&category=${categoryId}&type=multiple&encode=url3986`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not reach Open Trivia DB. Check your internet connection.');
  const data = await res.json();

  // response_code: 0 = OK, 1 = not enough questions, 5 = too many requests (max 1 every 5 s)
  if (data.response_code === 5 && retry) {
    await wait(5500);
    return fetchQuestions(categoryId, amount, false);
  }
  if (data.response_code === 1 && amount > 5) return fetchQuestions(categoryId, 5, retry);
  if (data.response_code !== 0) throw new Error('Open Trivia DB is busy right now. Try again in a few seconds.');

  return data.results.map((q) => {
    const correct = decode(q.correct_answer);
    return {
      question: decode(q.question),
      difficulty: q.difficulty,
      correct,
      answers: shuffle([correct, ...q.incorrect_answers.map(decode)]),
    };
  });
}
