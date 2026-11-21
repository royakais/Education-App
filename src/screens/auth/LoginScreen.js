import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Avatar, Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { COLORS, FONTS } from '../../theme';
import { GradientButton } from '../../components/Gradient';
import { authErrorMessage, useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      // No navigate() needed: AppNavigator switches to the app when the user changes.
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Avatar.Icon
          size={84}
          icon="school"
          color={COLORS.gold}
          style={{ backgroundColor: theme.colors.primary, marginBottom: 16 }}
        />
        <Text variant="displaySmall" style={{ color: theme.colors.primary, fontFamily: FONTS.semibold }}>
          Education App
        </Text>
        <View style={styles.accent} />
        <Text variant="bodyLarge" style={styles.subtitle}>
          Keep track of your courses and deadlines
        </Text>
      </View>

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
        secureTextEntry={!showPassword}
        left={<TextInput.Icon icon="lock-outline" />}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
        style={styles.input}
      />
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <GradientButton title="Log in" icon="login" onPress={handleLogin} loading={loading} floating />
      <Button style={styles.link} onPress={() => navigation.navigate('Register')}>
        Don't have an account? Sign up
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.cream },
  header: { alignItems: 'center', marginBottom: 32 },
  accent: { width: 48, height: 4, borderRadius: 2, backgroundColor: COLORS.gold, marginTop: 12 },
  subtitle: { marginTop: 12, color: COLORS.muted, fontFamily: FONTS.regular },
  input: { marginBottom: 12 },
  link: { marginTop: 12 },
});
