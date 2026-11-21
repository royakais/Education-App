// NATIVE FEATURE: Share to WhatsApp (React Native Linking + Share).
import { Linking, Share } from 'react-native';
import { formatDayMonth } from '../utils/dates';

export async function shareAssignmentOnWhatsApp({ title, dueDate, courseCode, submitted }) {
  const message =
    `📚 ${courseCode} — ${title}\n` +
    `📅 Due ${formatDayMonth(new Date(dueDate))}\n` +
    (submitted ? '✅ I already submitted mine!' : '⏳ Not submitted yet — let’s do it!');

  try {
    // Opens WhatsApp directly with the message ready to send.
    await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  } catch {
    // WhatsApp not installed → fall back to the system share sheet.
    await Share.share({ message });
  }
}
