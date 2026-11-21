// The app's signature gradient (burgundy → maroon), reused on buttons, pills and highlights.
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../theme';

export const GRADIENT = [COLORS.burgundy, COLORS.maroon];

// Plain gradient fill, e.g. for a selected chip or dot.
export function GradientFill({ style, children }) {
  return (
    <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>
      {children}
    </LinearGradient>
  );
}

// Main action button. size: 'large' (default) or 'small' (pills like "Practice").
export function GradientButton({ title, icon, onPress, loading, disabled, size = 'large', style, floating }) {
  const small = size === 'small';
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        floating && styles.floating,
        { borderRadius: small ? 14 : 18, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.inner, small ? styles.small : styles.large]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.cream} />
        ) : icon ? (
          <Icon source={icon} size={small ? 14 : 18} color={COLORS.cream} />
        ) : null}
        <Text style={[styles.text, small && styles.textSmall]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

// Inactive look for filter chips (matches the gradient chips' size).
export function Chip({ label, active, onPress }) {
  const content = <Text style={[styles.chipText, active && { color: COLORS.cream }]}>{label}</Text>;
  return (
    <Pressable onPress={onPress}>
      {active ? (
        <GradientFill style={styles.chip}>{content}</GradientFill>
      ) : (
        <View style={[styles.chip, styles.chipOff]}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden' },
  large: { minHeight: 48, paddingHorizontal: 20, borderRadius: 18 },
  small: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, gap: 4 },
  text: { fontFamily: FONTS.semibold, fontSize: 15, color: COLORS.cream },
  textSmall: { fontSize: 12 },
  floating: {
    shadowColor: COLORS.maroon,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: 'transparent' },
  chipOff: { backgroundColor: COLORS.card, borderColor: COLORS.creamDark },
  chipText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.maroon },
});
