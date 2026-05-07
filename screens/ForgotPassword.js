import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { forgotPassword } from "../api/authApi";

const ForgotPassword = ({ navigation }) => {
  const [formState, setFormState] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
    showNewPassword: false,
    showConfirmPassword: false,
    loading: false,
  });

  const {
    email,
    newPassword,
    confirmPassword,
    showNewPassword,
    showConfirmPassword,
    loading,
  } = formState;

  const updateFormState = (newState) => {
    setFormState((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  const handleResetPassword = async () => {
    if (!email.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      updateFormState({ loading: true });

      const data = await forgotPassword(email.trim(), newPassword.trim());

      Alert.alert("Success", data?.message || "Password updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error?.message || "Failed to update password"
      );
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoBox}>
              <Ionicons name="key-outline" size={32} color="#FFFFFF" />
            </View>

            <Text style={styles.appTitle}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and set a new password
            </Text>

            <View style={styles.card}>
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
                />
              </View>

              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#8AA0C2" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#8AA0C2"
                  value={newPassword}
                  onChangeText={(text) =>
                    updateFormState({ newPassword: text })
                  }
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    updateFormState({
                      showNewPassword: !showNewPassword,
                    })
                  }
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#8AA0C2"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#8AA0C2" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="#8AA0C2"
                  value={confirmPassword}
                  onChangeText={(text) =>
                    updateFormState({ confirmPassword: text })
                  }
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    updateFormState({
                      showConfirmPassword: !showConfirmPassword,
                    })
                  }
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

              <TouchableOpacity
                style={[styles.resetButton, loading && styles.disabledButton]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.backLogin}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;

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
  },

  appTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#062B78",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 12,
    color: "#294475",
    marginBottom: 25,
    textAlign: "center",
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 22,
    elevation: 6,
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

  resetButton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#263F99",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 18,
  },

  disabledButton: {
    opacity: 0.7,
  },

  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  backLogin: {
    textAlign: "center",
    color: "#062B78",
    fontWeight: "800",
    fontSize: 12,
  },
});