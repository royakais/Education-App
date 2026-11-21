// Course details — shows one course and its assignments.
import { Button } from 'react-native-paper';
import Placeholder from '../../components/Placeholder';

export default function CourseDetailsScreen({ route, navigation }) {
  const { courseTitle } = route.params ?? {};
  return (
    <Placeholder
      icon="book-education"
      title={courseTitle ?? 'Course'}
      description="This course's assignments will be listed here."
    >
      <Button
        mode="contained"
        onPress={() =>
          navigation.navigate('AssignmentDetails', { assignmentTitle: 'Sample assignment' })
        }
      >
        Open a sample assignment
      </Button>
    </Placeholder>
  );
}
