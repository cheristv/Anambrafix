
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { supabase } from "../lib/supabase";
import { useAppTheme } from "../context/ThemeContext";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert("Current Password Required", "Enter your current password.");
      return;
    }

    if (!newPassword) {
      Alert.alert("New Password Required", "Enter your new password.");
      return;
    }

    if (!confirmPassword) {
      Alert.alert("Confirmation Required", "Confirm your new password.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Password Too Short", "Use at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords Do Not Match",
        "Check your new password and confirmation."
      );
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert(
        "Choose a Different Password",
        "Your new password must be different."
      );
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user?.email) {
        throw new Error(
          "Your account email was not found. Please sign in again."
        );
      }

      const { error: verifyError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

      if (verifyError) {
        Alert.alert(
          "Incorrect Password",
          "Your current password is incorrect."
        );
        return;
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) throw updateError;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Alert.alert(
        "Success",
        "Your password has been changed successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Password Update Failed",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backButton, { color: theme.primary }]}>
              ‹ Back
            </Text>
          </Pressable>

          <View style={styles.headingContainer}>
            <Text style={styles.lockIcon}>🔐</Text>

            <Text style={[styles.heading, { color: theme.text }]}>
              Change Password
            </Text>

            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Keep your AnambraFix citizen account secure.
            </Text>
          </View>

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.text }]}>
              Current Password
            </Text>

            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <Pressable
                onPress={() => setShowCurrent((value) => !value)}
                hitSlop={10}
              >
                <Text style={[styles.showText, { color: theme.primary }]}>
                  {showCurrent ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>
              New Password
            </Text>

            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showNew}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <Pressable
                onPress={() => setShowNew((value) => !value)}
                hitSlop={10}
              >
                <Text style={[styles.showText, { color: theme.primary }]}>
                  {showNew ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>
              Confirm New Password
            </Text>

            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />

              <Pressable
                onPress={() => setShowConfirm((value) => !value)}
                hitSlop={10}
              >
                <Text style={[styles.showText, { color: theme.primary }]}>
                  {showConfirm ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.hintBox,
                { backgroundColor: theme.background },
              ]}
            >
              <Text style={[styles.hintTitle, { color: theme.text }]}>
                Password requirements
              </Text>

              <Text style={[styles.hintText, { color: theme.textSecondary }]}>
                • At least 8 characters
              </Text>

              <Text style={[styles.hintText, { color: theme.textSecondary }]}>
                • Different from your current password
              </Text>

              <Text style={[styles.hintText, { color: theme.textSecondary }]}>
                • Both new password fields must match
              </Text>
            </View>

            <Pressable
              onPress={handleChangePassword}
              disabled={saving}
              style={[
                styles.saveButton,
                {
                  backgroundColor: theme.primary,
                  opacity: saving ? 0.7 : 1,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save New Password
                </Text>
              )}
            </Pressable>
          </View>

          <Text style={[styles.footer, { color: theme.textSecondary }]}>
            ANAMBRAFIX
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardContainer: { flex: 1 },
  container: { padding: 20, paddingBottom: 45 },
  backButton: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 25,
  },
  headingContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  lockIcon: { fontSize: 45, marginBottom: 12 },
  heading: { fontSize: 25, fontWeight: "800" },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 9,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 17,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 9,
    marginTop: 5,
  },
  inputWrapper: {
    minHeight: 53,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 19,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 13,
  },
  showText: {
    fontSize: 12,
    fontWeight: "700",
    padding: 8,
  },
  hintBox: {
    borderRadius: 12,
    padding: 14,
    marginTop: 3,
    marginBottom: 22,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },
  hintText: {
    fontSize: 11,
    lineHeight: 20,
  },
  saveButton: {
    height: 53,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 30,
  },
});
