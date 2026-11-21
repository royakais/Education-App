import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { COLORS } from '../../theme';
import { authErrorMessage, useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all the fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e) {
      setError(authErrorMessage(e));
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" style={styles.title}>
          Create an account
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Your courses will be ready as soon as you sign up
        </Text>

        <TextInput
          label="Full name"
          mode="outlined"
          value={name}
          onChangeText={setName}
          left={<TextInput.Icon icon="account-outline" />}
          style={styles.input}
        />
        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email-outline" />}
          style={styles.input}
        />
        <TextInput
          label="Password"
          mode="outlined"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          left={<TextInput.Icon icon="lock-outline" />}
          style={styles.input}
        />
        <TextInput
          label="Confirm password"
          mode="outlined"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          left={<TextInput.Icon icon="lock-check-outline" />}
          style={styles.input}
        />
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>

        <Button mode="contained" onPress={handleRegister} loading={loading} disabled={loading}>
          Sign up
        </Button>
        <Button style={styles.link} onPress={() => navigation.goBack()}>
          Already have an account? Log in
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.cream },
  title: { fontWeight: 'bold', textAlign: 'center', color: COLORS.burgundy },
  subtitle: { textAlign: 'center', color: COLORS.muted, marginTop: 8, marginBottom: 24 },
  input: { marginBottom: 12 },
  link: { marginTop: 12 },
});
