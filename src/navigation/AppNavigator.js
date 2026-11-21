// All the app's navigation:
//   - Auth stack (Login, Register) when logged out
//   - Drawer (Home, Profile, Log out) when logged in
//       Home = bottom Tabs (Courses, Assignments, Quiz)
//           Courses tab = Stack (Courses -> CourseDetails -> AssignmentDetails)
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import CoursesScreen from '../screens/courses/CoursesScreen';
import CourseDetailsScreen from '../screens/courses/CourseDetailsScreen';
import CourseFormScreen from '../screens/courses/CourseFormScreen';
import AssignmentsScreen from '../screens/assignments/AssignmentsScreen';
import AssignmentDetailsScreen from '../screens/assignments/AssignmentDetailsScreen';
import ReminderSync from '../components/ReminderSync';
import QuizScreen from '../screens/quiz/QuizScreen';
import QuizPlayScreen from '../screens/quiz/QuizPlayScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, headerOptions } from '../theme';

const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const CoursesStack = createNativeStackNavigator();
const AssignmentsStack = createNativeStackNavigator();
const QuizStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// ---------- Stack navigation ----------
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Screens both the Home and Courses stacks can open.
function courseScreens(Stack) {
  return (
    <>
      <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} options={{ title: 'Course' }} />
      <Stack.Screen
        name="CourseForm"
        component={CourseFormScreen}
        options={({ route }) => ({
          title: route.params?.course ? 'Edit course' : 'New course',
          presentation: 'modal',
        })}
      />
      <Stack.Screen
        name="AssignmentDetails"
        component={AssignmentDetailsScreen}
        options={{ title: 'Assignment' }}
      />
      <Stack.Screen name="QuizPlay" component={QuizPlayScreen} options={{ title: 'Practice' }} />
    </>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={headerOptions}>
      <HomeStack.Screen name="Dashboard" component={HomeScreen} options={{ headerShown: false }} />
      {courseScreens(HomeStack)}
    </HomeStack.Navigator>
  );
}

function CoursesNavigator() {
  return (
    <CoursesStack.Navigator screenOptions={headerOptions}>
      <CoursesStack.Screen
        name="CoursesList"
        component={CoursesScreen}
        options={{ headerShown: false }}
      />
      {courseScreens(CoursesStack)}
    </CoursesStack.Navigator>
  );
}

function AssignmentsNavigator() {
  return (
    <AssignmentsStack.Navigator screenOptions={headerOptions}>
      <AssignmentsStack.Screen
        name="AssignmentsList"
        component={AssignmentsScreen}
        options={{ headerShown: false }}
      />
      {courseScreens(AssignmentsStack)}
    </AssignmentsStack.Navigator>
  );
}

function QuizNavigator() {
  return (
    <QuizStack.Navigator screenOptions={headerOptions}>
      <QuizStack.Screen name="QuizList" component={QuizScreen} options={{ headerShown: false }} />
      {courseScreens(QuizStack)}
    </QuizStack.Navigator>
  );
}

// ---------- Tab navigation ----------
function HomeTabs() {
  const theme = useTheme();
  const tabIcons = {
    Home: 'home-variant-outline',
    Courses: 'book-open-variant',
    Assignments: 'calendar-check',
    Quiz: 'head-question-outline',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontFamily: FONTS.medium, fontSize: 11 },
        tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.creamDark },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={tabIcons[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Courses" component={CoursesNavigator} options={{ headerShown: false }} />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// ---------- Drawer navigation ----------
function DrawerContent(props) {
  const { user, logout } = useAuth();
  const name = user?.displayName || 'Student';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.drawerTop}>
        <LinearGradient
          colors={['rgba(129,23,27,0.55)', 'rgba(212,165,116,0.5)', 'rgba(129,23,27,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.drawerEdge}
        >
          <LinearGradient colors={['#FFFCF7', '#F8ECE4']} style={styles.drawerCard}>
            <LinearGradient colors={[COLORS.burgundy, COLORS.maroon]} style={styles.drawerAvatar}>
              <Text style={styles.drawerInitial}>{name[0].toUpperCase()}</Text>
            </LinearGradient>
            <Text style={styles.drawerName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.drawerEmail} numberOfLines={1}>
              {user?.email}
            </Text>
          </LinearGradient>
        </LinearGradient>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Log out"
        labelStyle={styles.drawerLabel}
        icon={({ size }) => <MaterialCommunityIcons name="logout" color={COLORS.muted} size={size} />}
        onPress={logout}
      />
    </DrawerContentScrollView>
  );
}

function MainDrawer() {
  const theme = useTheme();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        ...headerOptions,
        headerShown: false,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: COLORS.text,
        drawerActiveBackgroundColor: COLORS.burgundyLight,
        drawerLabelStyle: styles.drawerLabel,
        drawerStyle: { backgroundColor: COLORS.cream },
      }}
    >
      <Drawer.Screen
        name="Main"
        component={HomeTabs}
        options={{
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// ---------- Root: show login or the app depending on the user ----------
export default function AppNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? (
    <>
      <ReminderSync />
      <MainDrawer />
    </>
  ) : (
    <AuthNavigator />
  );
}

const styles = StyleSheet.create({
  drawerTop: { paddingTop: 56, paddingHorizontal: 14, paddingBottom: 14 },
  drawerEdge: { borderRadius: 24, padding: 1.2 },
  drawerCard: { borderRadius: 23, padding: 18 },
  drawerAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  drawerInitial: { fontFamily: FONTS.semibold, fontSize: 20, color: COLORS.cream },
  drawerName: { fontFamily: FONTS.semibold, fontSize: 17, color: COLORS.maroon, marginTop: 12 },
  drawerEmail: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted },
  drawerLabel: { fontFamily: FONTS.medium, fontSize: 14 },
});
