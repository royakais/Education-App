// App colors: deep maroon + burgundy on a warm cream background.
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { MD3LightTheme, configureFonts } from 'react-native-paper';

export const COLORS = {
  maroon: '#540804', // darkest — hero backgrounds, gradients
  burgundy: '#81171B', // main color — buttons, headers, highlights
  burgundyDark: '#540804',
  burgundyLight: '#F4E2DC', // soft tint for selected items
  gold: '#D4A574', // warm sand accent
  goldLight: '#F3E4CF',
  caramel: '#B8743F', // tests on the calendar
  cream: '#FBF6EE', // app background
  creamDark: '#F2E8DA', // cards on cream, dividers
  card: '#FFFCF7',
  text: '#2A1412',
  muted: '#86706B',
  white: '#FFFFFF',
};

// Poppins font files (loaded in App.js).
export const FONTS = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

// Use the right Poppins file for every Paper text style (titles semibold, labels medium...).
const configuredFonts = configureFonts({
  config: Object.fromEntries(
    Object.entries(MD3LightTheme.fonts)
      .filter(([, v]) => v && v.fontSize)
      .map(([name, v]) => {
        const w = String(v.fontWeight);
        const fontFamily = w === '400' ? FONTS.regular : w === '500' ? FONTS.medium : FONTS.semibold;
        return [name, { ...v, fontFamily, fontWeight: 'normal' }];
      })
  ),
});
// Plain <Text> without a variant uses "default".
const paperFonts = {
  ...configuredFonts,
  default: { ...MD3LightTheme.fonts.default, fontFamily: FONTS.regular, fontWeight: 'normal' },
};

// Theme for React Native Paper components (buttons, inputs, cards, FAB...).
export const theme = {
  ...MD3LightTheme,
  fonts: paperFonts,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.burgundy,
    onPrimary: COLORS.white,
    primaryContainer: COLORS.burgundyLight,
    onPrimaryContainer: COLORS.maroon,
    secondary: COLORS.gold,
    onSecondary: COLORS.white,
    secondaryContainer: COLORS.goldLight,
    onSecondaryContainer: COLORS.maroon,
    background: COLORS.cream,
    surface: COLORS.card,
    surfaceVariant: COLORS.creamDark,
    onSurface: COLORS.text,
    onSurfaceVariant: COLORS.muted,
    outline: '#D9C8BC',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: COLORS.card,
      level2: '#FDF8F1',
      level3: '#FAF2E8',
    },
  },
};

// Theme for React Navigation (screen backgrounds, tab bar).
export const navigationTheme = {
  ...NavigationDefaultTheme,
  fonts: {
    regular: { fontFamily: FONTS.regular, fontWeight: 'normal' },
    medium: { fontFamily: FONTS.medium, fontWeight: 'normal' },
    bold: { fontFamily: FONTS.semibold, fontWeight: 'normal' },
    heavy: { fontFamily: FONTS.bold, fontWeight: 'normal' },
  },
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: COLORS.burgundy,
    background: COLORS.cream,
    card: COLORS.card,
    text: COLORS.text,
    border: '#EADDD0',
  },
};

// Header used by detail screens: cream like Home, maroon back arrow and title.
export const headerOptions = {
  headerStyle: { backgroundColor: COLORS.cream },
  headerTintColor: COLORS.maroon,
  headerTitleStyle: { fontFamily: FONTS.semibold, fontSize: 17, color: COLORS.maroon },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
};
