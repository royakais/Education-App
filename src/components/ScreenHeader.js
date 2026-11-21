// Same top of screen as Home: menu box + avatar, then a small caps line and a big Poppins title.
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';

export function IconBox({ icon, onPress, color = COLORS.maroon }) {
  return (
    <Pressable style={styles.iconBox} onPress={onPress} hitSlop={6}>
      <Icon source={icon} size={20} color={color} />
    </Pressable>
  );
}

export default function ScreenHeader({ eyebrow, title, right }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const initial = (user?.displayName || 'S')[0].toUpperCase();

  return (
    <View style={{ paddingTop: insets.top + 8 }}>
      <View style={styles.topBar}>
        <IconBox icon="menu" onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
        <Pressable onPress={() => navigation.navigate('Profile')}>
          <LinearGradient colors={[COLORS.burgundy, COLORS.maroon]} style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
        </Pressable>
      </View>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        {right}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FONTS.semibold, fontSize: 16, color: COLORS.cream },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 22, marginTop: 20 },
  eyebrow: { fontFamily: FONTS.medium, fontSize: 11, letterSpacing: 2, color: COLORS.muted },
  title: { fontFamily: FONTS.semibold, fontSize: 28, lineHeight: 38, color: COLORS.maroon, marginTop: 2 },
});
