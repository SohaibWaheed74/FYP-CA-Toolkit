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
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { registerUser } from "../api/authApi";

const Signup = ({ navigation }) => {
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
    loading: false,
  });

  const {
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    loading,
  } = formState;

  const updateFormState = (newState) => {
    setFormState((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      updateFormState({ loading: true });

      const data = await registerUser(email.trim(), password.trim());

      console.log("SIGNUP RESPONSE:", data);

      Alert.alert("Success", "Account created successfully", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error) {
      Alert.alert("Signup Failed", error?.message || "Failed to register user");
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
              <Ionicons name="hardware-chip-outline" size={30} color="#FFFFFF" />
            </View>

            {/* App Title */}
            <Text style={styles.appTitle}>Computer Architecture Tool Kit</Text>
            <Text style={styles.subtitle}>
              Learn computer architecture concepts interactively
            </Text>

            {/* Signup Card */}
            <View style={styles.card}>
              <Text style={styles.heading}>Create Account</Text>
              <Text style={styles.description}>
                Join us and start learning today
              </Text>

              {/* Email */}
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color="#8AA0C2" />

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
                  size={18}
                  color="#8AA0C2"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  placeholderTextColor="#8AA0C2"
                  value={password}
                  onChangeText={(text) => updateFormState({ password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
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

              {/* Confirm Password */}
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#8AA0C2"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#8AA0C2"
                  value={confirmPassword}
                  onChangeText={(text) =>
                    updateFormState({ confirmPassword: text })
                  }
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    updateFormState({
                      showConfirmPassword: !showConfirmPassword,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color="#8AA0C2"
                  />
                </TouchableOpacity>
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                style={[styles.signupButton, loading && styles.disabledButton]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}>Login</Text>
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

export default Signup;

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
    paddingHorizontal: 12,
    paddingVertical: 30,
  },

  logoBox: {
    width: 52,
    height: 52,
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
    marginBottom: 24,
    letterSpacing: 0.2,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 21,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  heading: {
    fontSize: 21,
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
    height: 41,
    borderWidth: 1,
    borderColor: "#B9C7DC",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    marginBottom: 16,
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

  signupButton: {
    height: 39,
    borderRadius: 8,
    backgroundColor: "#263F99",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
    marginBottom: 24,
  },

  disabledButton: {
    opacity: 0.7,
  },

  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    fontSize: 12,
    color: "#061F4F",
  },

  loginLink: {
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