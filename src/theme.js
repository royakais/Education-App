// App colors: burgundy + gold on a warm cream background.
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { MD3LightTheme } from 'react-native-paper';

export const COLORS = {
  burgundy: '#7A1F3D',
  burgundyDark: '#5C1630',
  burgundyLight: '#F4DFE5',
  gold: '#C9A24D',
  goldLight: '#F6EBCF',
  cream: '#FBF7F2',
  text: '#2B1B20',
  muted: '#7D6B70',
};

// Theme for React Native Paper components (buttons, inputs, cards, FAB...).
export const theme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.burgundy,
    onPrimary: '#FFFFFF',
    primaryContainer: COLORS.burgundyLight,
    onPrimaryContainer: COLORS.burgundyDark,
    secondary: COLORS.gold,
    onSecondary: '#FFFFFF',
    secondaryContainer: COLORS.goldLight,
    onSecondaryContainer: '#5A4515',
    background: COLORS.cream,
    surface: '#FFFFFF',
    surfaceVariant: '#F3ECE8',
    onSurface: COLORS.text,
    onSurfaceVariant: COLORS.muted,
    outline: '#D8CACD',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#FFFFFF',
      level2: '#FCF8F5',
      level3: '#F8F1EE',
    },
  },
};

// Theme for React Navigation (screen backgrounds, headers, tab bar).
export const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: COLORS.burgundy,
    background: COLORS.cream,
    card: '#FFFFFF',
    text: COLORS.text,
    border: '#EADFE2',
  },
};

// Burgundy header with white title, used by every stack/tab/drawer header.
export const headerOptions = {
  headerStyle: { backgroundColor: COLORS.burgundy },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold' },
};
