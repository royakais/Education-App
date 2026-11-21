// Course details — shows one course; its assignments will be listed here.
import { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import Placeholder from '../../components/Placeholder';
import { COLORS } from '../../theme';

export default function CourseDetailsScreen({ route, navigation }) {
  const { course } = route.params;

  // Edit button in the header + course title as the screen title.
  useLayoutEffect(() => {
    navigation.setOptions({
      title: course.title,
      headerRight: () => (
        <IconButton
          icon="pencil-outline"
          iconColor="#FFFFFF"
          onPress={() => navigation.navigate('CourseForm', { course })}
        />
      ),
    });
  }, [navigation, course]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.banner, { backgroundColor: course.color }]}>
        <Text variant="headlineSmall" style={styles.bannerTitle}>
          {course.title}
        </Text>
        <Text variant="bodyMedium" style={styles.bannerSub}>
          {course.instructor ? `Instructor: ${course.instructor}` : 'No instructor added'}
        </Text>
      </View>

      <Placeholder
        icon="clipboard-text-outline"
        title="Assignments"
        description="This course's assignments will be listed here."
      >
        <Button
          mode="outlined"
          onPress={() =>
            navigation.navigate('AssignmentDetails', { assignmentTitle: 'Sample assignment' })
          }
        >
          Open a sample assignment
        </Button>
      </Placeholder>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  banner: { padding: 24, paddingTop: 28, borderBottomWidth: 4, borderBottomColor: COLORS.gold },
  bannerTitle: { color: '#FFFFFF', fontWeight: 'bold' },
  bannerSub: { color: 'rgba(255,255,255,0.85)', marginTop: 6 },
});
