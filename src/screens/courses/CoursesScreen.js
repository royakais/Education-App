// Courses tab — list of the student's courses (CRUD comes next).
import { Button } from 'react-native-paper';
import Placeholder from '../../components/Placeholder';

export default function CoursesScreen({ navigation }) {
  return (
    <Placeholder
      icon="book-open-variant"
      title="My Courses"
      description="The list of courses (add, edit, delete) will go here."
    >
      {/* Temporary button to test the stack navigation */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate('CourseDetails', { courseTitle: 'Sample course' })}
      >
        Open a sample course
      </Button>
    </Placeholder>
  );
}
