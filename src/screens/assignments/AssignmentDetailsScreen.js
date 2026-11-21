// Assignment details — title, due date, photo, done, share, calendar, reminder.
import Placeholder from '../../components/Placeholder';

export default function AssignmentDetailsScreen({ route }) {
  const { assignmentTitle } = route.params ?? {};
  return (
    <Placeholder
      icon="clipboard-text-outline"
      title={assignmentTitle ?? 'Assignment'}
      description="Due date, homework photo, mark as done, share and add-to-calendar will go here."
    />
  );
}
