
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [count, setCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Log whenever email changes
  useEffect(() => {
    console.log('Email changed:', email);
  }, [email]);

  // Login function
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Forgot Password
  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Forgot Password', 'Please enter your email first.');
      return;
    }

    Alert.alert(
      'Forgot Password',
      `Password reset instructions will be sent to ${email}.`
    );
  };

  // Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
    setShowPassword(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      <View style={styles.card}>
        {isLoggedIn ? (
          // Welcome Screen
          <View style={styles.welcomeSection}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>L</Text>
            </View>

            <Text style={styles.heading}>Welcome!</Text>

            <Text style={styles.emailText}>{email}</Text>

            <Text style={styles.subtitle}>
              You have successfully logged in.
            </Text>

            <Pressable
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.loginText}>Logout</Text>
            </Pressable>
          </View>
        ) : (
          // Login Screen
          <>
            {/* Logo */}
            <View style={styles.logo}>
              <Text style={styles.logoText}>L</Text>
            </View>

            <Text style={styles.heading}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to your account</Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </Pressable>
            </View>

            {/* Forgot Password */}
            <Pressable
              onPress={handleForgotPassword}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              style={[
                styles.loginButton,
                (!email.trim() || !password.trim()) &&
                  styles.disabledButton,
              ]}
              disabled={!email.trim() || !password.trim()}
              onPress={handleLogin}
            >
              <Text style={styles.loginText}>Login</Text>
            </Pressable>
          </>
        )}

        {/* Counter - Part C */}
        <View style={styles.counterSection}>
          <Text style={styles.counterTitle}>Counter: {count}</Text>

          <View style={styles.counterButtons}>
            <Pressable
              style={styles.counterButton}
              onPress={() => setCount(count + 1)}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </Pressable>

            <Pressable
              style={styles.counterButton}
              onPress={() => setCount(count - 1)}
            >
              <Text style={styles.counterButtonText}>-</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 18,
    elevation: 5,
  },
  logo: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#4b79ba',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#172554',
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 8,
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 7,
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 9,
    padding: 13,
    marginBottom: 18,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 9,
    paddingHorizontal: 13,
    marginBottom: 18,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
  },
  eyeButton: {
    padding: 5,
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#4b79ba',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#4b79ba',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a5b4c9',
  },
  loginText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  welcomeSection: {
    alignItems: 'center',
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b79ba',
    marginTop: 15,
  },
  logoutButton: {
    backgroundColor: '#4b79ba',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  counterSection: {
    marginTop: 25,
    alignItems: 'center',
  },
  counterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  counterButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  counterButton: {
    backgroundColor: '#172554',
    width: 45,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    color: '#fff',
    fontSize: 23,
    fontWeight: 'bold',
  },
});
