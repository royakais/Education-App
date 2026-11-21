// Profile — shows the logged-in student's name and email.
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const name = user?.displayName || 'Student';
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      <Avatar.Text size={88} label={initials} />
      <Text variant="headlineSmall" style={styles.name}>
        {name}
      </Text>
      <Text variant="bodyLarge" style={styles.email}>
        {user?.email}
      </Text>
      <Button mode="outlined" icon="logout" onPress={logout} style={styles.button}>
        Log out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 48, padding: 24 },
  name: { marginTop: 16, fontWeight: 'bold' },
  email: { color: '#7D6B70', marginTop: 4 },
  button: { marginTop: 32 },
});
