// Temporary content for screens that are not built yet.
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

export default function Placeholder({ icon, title, description, children }) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Icon source={icon} size={64} color={theme.colors.primary} />
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodyMedium" style={styles.description}>
          {description}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontWeight: 'bold', textAlign: 'center' },
  description: { color: '#666', textAlign: 'center' },
});
