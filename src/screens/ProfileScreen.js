// Profile — the logged-in student's name, email and a quick summary.
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Icon, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../hooks/useCourses';
import { useAssignments } from '../hooks/useAssignments';
import ScreenHeader from '../components/ScreenHeader';
import { COLORS, FONTS } from '../theme';

function Stat({ icon, value, label }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Icon source={icon} size={18} color={COLORS.burgundy} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { courses } = useCourses();
  const { assignments } = useAssignments();
  const name = user?.displayName || 'Student';
  const submitted = assignments.filter((a) => a.submitted).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.cream }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader eyebrow="YOUR ACCOUNT" title="Profile" />

      {/* Glass card, same as the Home welcome card */}
      <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.shadow}>
        <LinearGradient
          colors={['rgba(129,23,27,0.55)', 'rgba(212,165,116,0.5)', 'rgba(129,23,27,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.edge}
        >
          <LinearGradient colors={['#FFFCF7', '#F8ECE4']} style={styles.inner}>
            <LinearGradient colors={[COLORS.burgundy, COLORS.maroon]} style={styles.avatar}>
              <Text style={styles.initial}>{name[0].toUpperCase()}</Text>
            </LinearGradient>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.stats}>
              <Stat icon="book-open-variant" value={courses.length} label="Courses" />
              <Stat icon="clipboard-text-outline" value={assignments.length} label="Assignments" />
              <Stat icon="check-decagram-outline" value={submitted} label="Submitted" />
            </View>
          </LinearGradient>
        </LinearGradient>
      </Animated.View>

      <Button mode="outlined" icon="logout" onPress={logout} style={styles.logout} textColor={COLORS.burgundy}>
        Log out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginHorizontal: 18,
    marginTop: 20,
    borderRadius: 28,
    backgroundColor: COLORS.cream,
    shadowColor: COLORS.maroon,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  edge: { borderRadius: 28, padding: 1.2 },
  inner: { borderRadius: 27, padding: 22, alignItems: 'center' },
  avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: FONTS.semibold, fontSize: 30, color: COLORS.cream },
  name: { fontFamily: FONTS.semibold, fontSize: 22, color: COLORS.maroon, marginTop: 14 },
  email: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.muted },
  stats: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(129,23,27,0.08)',
    alignSelf: 'stretch',
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.burgundyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontFamily: FONTS.semibold, fontSize: 18, color: COLORS.text },
  statLabel: { fontFamily: FONTS.regular, fontSize: 11.5, color: COLORS.muted },
  logout: { marginHorizontal: 18, marginTop: 20, borderColor: 'rgba(129,23,27,0.25)' },
});
