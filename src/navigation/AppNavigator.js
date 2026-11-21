// All the app's navigation:
//   - Auth stack (Login, Register) when logged out
//   - Drawer (Home, Profile, Log out) when logged in
//       Home = bottom Tabs (Courses, Assignments, Quiz)
//           Courses tab = Stack (Courses -> CourseDetails -> AssignmentDetails)
import { View } from 'react-native';
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
import CoursesScreen from '../screens/courses/CoursesScreen';
import CourseDetailsScreen from '../screens/courses/CourseDetailsScreen';
import AssignmentsScreen from '../screens/assignments/AssignmentsScreen';
import AssignmentDetailsScreen from '../screens/assignments/AssignmentDetailsScreen';
import QuizScreen from '../screens/quiz/QuizScreen';
import ProfileScreen from '../screens/ProfileScreen';

const AuthStack = createNativeStackNavigator();
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

function CoursesNavigator() {
  return (
    <CoursesStack.Navigator>
      <CoursesStack.Screen
        name="CoursesList"
        component={CoursesScreen}
        options={{ title: 'My Courses', headerLeft: () => <MenuButton /> }}
      />
      <CoursesStack.Screen
        name="CourseDetails"
        component={CourseDetailsScreen}
        options={({ route }) => ({ title: route.params?.courseTitle ?? 'Course' })}
      />
      <CoursesStack.Screen
        name="AssignmentDetails"
        component={AssignmentDetailsScreen}
        options={{ title: 'Assignment' }}
      />
    </CoursesStack.Navigator>
  );
}

function AssignmentsNavigator() {
  return (
    <AssignmentsStack.Navigator>
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
    Courses: 'book-open-variant',
    Assignments: 'calendar-check',
    Quiz: 'head-question-outline',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={tabIcons[route.name]} color={color} size={size} />
        ),
      })}
    >
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
    <DrawerContentScrollView {...props}>
      <View style={{ padding: 16 }}>
        <Avatar.Icon size={56} icon="school" />
        <Text variant="titleMedium" style={{ marginTop: 12, fontWeight: 'bold' }}>
          {name}
        </Text>
        <Text variant="bodySmall" style={{ color: '#666' }}>
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
      screenOptions={{ headerShown: false, drawerActiveTintColor: theme.colors.primary }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeTabs}
        options={{
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
