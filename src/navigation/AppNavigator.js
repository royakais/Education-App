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
import { ActivityIndicator, Avatar, Divider, Text, useTheme } from 'react-native-paper';

import { useAuth } from '../context/AuthContext';
import MenuButton from '../components/MenuButton';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import CoursesScreen from '../screens/courses/CoursesScreen';
import CourseDetailsScreen from '../screens/courses/CourseDetailsScreen';
import CourseFormScreen from '../screens/courses/CourseFormScreen';
import AssignmentsScreen from '../screens/assignments/AssignmentsScreen';
import AssignmentDetailsScreen from '../screens/assignments/AssignmentDetailsScreen';
import QuizScreen from '../screens/quiz/QuizScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS, headerOptions } from '../theme';

const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const CoursesStack = createNativeStackNavigator();
const AssignmentsStack = createNativeStackNavigator();
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
        options={{ title: 'My Courses', headerLeft: () => <MenuButton /> }}
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
        options={{ title: 'Assignments', headerLeft: () => <MenuButton /> }}
      />
      <AssignmentsStack.Screen
        name="AssignmentDetails"
        component={AssignmentDetailsScreen}
        options={{ title: 'Assignment' }}
      />
    </AssignmentsStack.Navigator>
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
        tabBarLabelStyle: { fontWeight: '600' },
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
        component={QuizScreen}
        options={{ title: 'Practice Quiz', headerLeft: () => <MenuButton /> }}
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
      <View style={styles.drawerHeader}>
        <Avatar.Icon size={60} icon="school" color={COLORS.burgundy} style={styles.drawerAvatar} />
        <Text variant="titleMedium" style={styles.drawerName}>
          {name}
        </Text>
        <Text variant="bodySmall" style={styles.drawerEmail}>
          {user?.email}
        </Text>
      </View>
      <Divider style={{ marginBottom: 8 }} />
      <DrawerItemList {...props} />
      <DrawerItem
        label="Log out"
        icon={({ color, size }) => <MaterialCommunityIcons name="logout" color={color} size={size} />}
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
        drawerActiveBackgroundColor: COLORS.burgundyLight,
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
          headerShown: true,
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

  return user ? <MainDrawer /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: COLORS.burgundy,
    padding: 20,
    paddingTop: 56,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.gold,
  },
  drawerAvatar: { backgroundColor: COLORS.gold },
  drawerName: { marginTop: 12, fontWeight: 'bold', color: '#FFFFFF' },
  drawerEmail: { color: 'rgba(255,255,255,0.8)' },
});
