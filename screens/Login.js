import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { loginUser } from "../api/authApi";

const Login = ({ navigation, onLogin }) => {
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    showPassword: false,
    loading: false,
  });

  const { email, password, showPassword, loading } = formState;

  const updateFormState = (newState) => {
    setFormState((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      updateFormState({ loading: true });

      const data = await loginUser(email.trim(), password.trim());

      console.log("LOGIN RESPONSE:", data);

      if (onLogin) {
        onLogin(data.user);
      }
    } catch (error) {
      Alert.alert("Login Failed", error?.message || "Invalid email or password");
    } finally {
      updateFormState({ loading: false });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar backgroundColor="#F3F6FA" barStyle="dark-content" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Top Icon */}
            <View style={styles.logoBox}>
              <Ionicons
                name="hardware-chip-outline"
                size={31}
                color="#FFFFFF"
              />
            </View>

            {/* App Title */}
            <Text style={styles.appTitle}>Computer Architecture Tool Kit</Text>

            <Text style={styles.subtitle}>
              Learn computer architecture concepts interactively
            </Text>

            {/* Login Card */}
            <View style={styles.card}>
              <Text style={styles.heading}>Welcome Back</Text>

              <Text style={styles.description}>
                Sign in to continue your learning journey
              </Text>

              {/* Email */}
              <Text style={styles.label}>Email Address</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={19} color="#8AA0C2" />

                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#8AA0C2"
                  value={email}
                  onChangeText={(text) => updateFormState({ email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <Text style={styles.label}>Password</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color="#8AA0C2"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#8AA0C2"
                  value={password}
                  onChangeText={(text) => updateFormState({ password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    updateFormState({ showPassword: !showPassword })
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#8AA0C2"
                  />
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              {/* Signup Link */}
              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Don't have an account? </Text>

                <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              Educational Tool for Computer Architecture Students
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FA",
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 30,
  },

  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#263F99",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,

    shadowColor: "#263F99",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  appTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#062B78",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 11,
    color: "#294475",
    textAlign: "center",
    marginBottom: 28,
    letterSpacing: 0.2,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },

  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#061F4F",
    marginBottom: 6,
  },

  description: {
    fontSize: 11,
    color: "#42618F",
    marginBottom: 22,
  },

  label: {
    fontSize: 12,
    color: "#061F4F",
    marginBottom: 8,
    fontWeight: "500",
  },

  inputContainer: {
    height: 44,
    borderWidth: 1,
    borderColor: "#B9C7DC",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },

  input: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    fontSize: 13,
    color: "#061F4F",
    paddingVertical: 0,
  },

  eyeButton: {
    width: 34,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  loginButton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#263F99",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
    marginBottom: 22,
  },

  disabledButton: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  signupText: {
    fontSize: 12,
    color: "#061F4F",
  },

  signupLink: {
    fontSize: 12,
    color: "#062B78",
    fontWeight: "800",
  },

  footerText: {
    fontSize: 9,
    color: "#294475",
    marginTop: 22,
    textAlign: "center",
  },
});