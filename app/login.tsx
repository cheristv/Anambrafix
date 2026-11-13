
import React, { useState } from "react";
import {
  Alert,
  Image,
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
import {
  Link,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { StatusBar } from "expo-status-bar";

import colors from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    confirmed?: string | string[];
  }>();

  const emailConfirmed =
    params.confirmed === "1" ||
    (Array.isArray(params.confirmed) &&
      params.confirmed[0] === "1");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert("Missing information", "Enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        Alert.alert("Login failed", error.message);
        return;
      }

      router.replace("/home");
    } catch {
      Alert.alert(
        "Connection error",
        "Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      Alert.alert(
        "Enter your email",
        "Enter your registered email address first."
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(
        cleanEmail
      );

      if (error) {
        Alert.alert("Unable to reset password", error.message);
        return;
      }

      Alert.alert(
        "Check your email",
        "If password recovery is available for this account, Supabase will send a reset link."
      );
    } catch {
      Alert.alert("Error", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/anambralogo.png")}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="AnambraFix logo"
            />

            <Text style={styles.brandName}>ANAMBRAFIX</Text>

            <Text style={styles.brandSubtitle}>
              REPORT. TRACK. FIX.
            </Text>
          </View>

          <View style={styles.headingContainer}>
            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Sign in to report issues, track complaints and stay connected
              with solutions across Anambra State.
            </Text>
          </View>

          {emailConfirmed && (
            <View style={styles.successBanner}>
              <Text style={styles.successTitle}>
                Email confirmed successfully!
              </Text>

              <Text style={styles.successMessage}>
                Your email address has been verified. You can now sign in
                to your AnambraFix account.
              </Text>
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.label}>Email address</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              style={styles.input}
              editable={!loading}
              returnKeyType="next"
            />

            <Text style={styles.label}>Password</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              style={styles.input}
              editable={!loading}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />

            <Pressable
              onPress={handleForgotPassword}
              disabled={loading}
              style={styles.forgotContainer}
            >
              <Text style={styles.forgotText}>
                Forgot password?
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={[
                styles.primaryButton,
                loading && styles.disabledButton,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Please wait..." : "Sign In"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don't have an account?{" "}
            </Text>

            <Link href="/register" asChild>
              <Pressable disabled={loading}>
                <Text style={styles.registerLink}>
                  Create account
                </Text>
              </Pressable>
            </Link>
          </View>

          <Text style={styles.footer}>
            Making Anambra State better, one report at a time.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 30,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 36,
  },
  logo: {
    width: 125,
    height: 125,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: colors.primary,
    textAlign: "center",
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  headingContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 9,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  successBanner: {
    backgroundColor: "#E8F7EE",
    borderColor: "#A7DFC0",
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
  },
  successTitle: {
    color: "#087A43",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 5,
  },
  successMessage: {
    color: "#245C3D",
    fontSize: 13,
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 15,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    paddingVertical: 14,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  primaryButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 28,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 36,
  },
});
