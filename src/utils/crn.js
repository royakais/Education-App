// Generates a stable 5-digit CRN for a course from its id (same course = same CRN).
export function generateCrn(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return String(20000 + (hash % 2000));
}
