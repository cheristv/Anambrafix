
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
import { Link, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";

import colors from "../constants/colors";
import { supabase } from "../lib/supabase";

const lgas = [
  "Aguata",
  "Anambra East",
  "Anambra West",
  "Anaocha",
  "Awka North",
  "Awka South",
  "Ayamelum",
  "Dunukofia",
  "Ekwusigo",
  "Idemili North",
  "Idemili South",
  "Ihiala",
  "Njikoka",
  "Nnewi North",
  "Nnewi South",
  "Ogbaru",
  "Onitsha North",
  "Onitsha South",
  "Orumba North",
  "Orumba South",
  "Oyi",
];

const genders = ["Male", "Female", "Prefer not to say"];

export default function RegisterScreen() {
  const router = useRouter();

  const [surname, setSurname] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [lga, setLga] = useState("");
  const [community, setCommunity] = useState("");
  const [loading, setLoading] = useState(false);

  const validateDate = (value: string) => {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (!match) return false;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      date <= new Date()
    );
  };

  const handleRegister = async () => {
    const cleanSurname = surname.trim();
    const cleanOtherNames = otherNames.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanLga = lga.trim();
    const cleanCommunity = community.trim();

    if (
      !cleanSurname ||
      !cleanOtherNames ||
      !cleanPhone ||
      !cleanEmail ||
      !password ||
      !confirmPassword ||
      !gender ||
      !dateOfBirth.trim() ||
      !cleanLga ||
      !cleanCommunity
    ) {
      Alert.alert(
        "Missing information",
        "Please complete all required fields."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return;
    }

    if (!/^[0-9+()\-\s]{7,20}$/.test(cleanPhone)) {
      Alert.alert(
        "Invalid phone number",
        "Check the phone number you entered."
      );
      return;
    }

    if (!validateDate(dateOfBirth.trim())) {
      Alert.alert(
        "Invalid date of birth",
        "Enter a valid date in DD/MM/YYYY format. The date must not be in the future."
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Password too short",
        "Your password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Passwords do not match",
        "Enter the same password twice."
      );
      return;
    }

    const [day, month, year] = dateOfBirth.trim().split("/");
    const formattedDate = `${year}-${month}-${day}`;

    try {
      setLoading(true);

      const emailRedirectTo =
        Platform.OS === "web"
          ? `${window.location.origin}/auth/callback`
          : Linking.createURL("auth/callback");

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo,
          data: {
            surname: cleanSurname,
            other_names: cleanOtherNames,
            phone: cleanPhone,
            gender,
            date_of_birth: formattedDate,
            state: "Anambra State",
            lga: cleanLga,
            community: cleanCommunity,
          },
        },
      });

      if (error) {
        Alert.alert("Registration failed", error.message);
        return;
      }

      if (data.session) {
        Alert.alert(
          "Account created",
          "Your AnambraFix account has been created successfully.",
          [
            {
              text: "Continue",
              onPress: () => router.replace("/home"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Check your email",
          "Your registration has been submitted. Open the confirmation link sent to your email. You will be returned to AnambraFix to confirm your account before logging in.",
          [
            {
              text: "Go to Login",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      }
    } catch {
      Alert.alert(
        "Something went wrong",
        "Please check your internet connection and try again."
      );
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
              accessibilityLabel="Anambra State logo"
            />

            <Text style={styles.brandName}>ANAMBRAFIX</Text>

            <Text style={styles.brandSubtitle}>
              YOUR COMMUNITY. YOUR VOICE.
            </Text>
          </View>

          <Text style={styles.title}>Create your account</Text>

          <Text style={styles.subtitle}>
            Join AnambraFix and make your community better by reporting
            issues and following government projects.
          </Text>

          <Text style={styles.label}>Surname *</Text>
          <TextInput
            value={surname}
            onChangeText={setSurname}
            placeholder="Enter your surname"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            autoCapitalize="words"
            editable={!loading}
          />

          <Text style={styles.label}>Other names *</Text>
          <TextInput
            value={otherNames}
            onChangeText={setOtherNames}
            placeholder="Enter your other names"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            autoCapitalize="words"
            editable={!loading}
          />

          <Text style={styles.label}>Phone number *</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <Text style={styles.label}>Email address *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!loading}
          />

          <Text style={styles.label}>Gender *</Text>

          <View style={styles.optionsContainer}>
            {genders.map((item) => {
              const selected = gender === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setGender(item)}
                  disabled={loading}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Date of birth *</Text>
          <TextInput
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            editable={!loading}
          />

          <Text style={styles.label}>State</Text>

          <View style={[styles.input, styles.fixedField]}>
            <Text style={styles.fixedFieldText}>
              Anambra State
            </Text>
          </View>

          <Text style={styles.label}>
            Local Government Area (LGA) *
          </Text>

          <Text style={styles.helperText}>
            Select your Local Government Area in Anambra State.
          </Text>

          <View style={styles.townContainer}>
            {lgas.map((item) => {
              const selected = lga === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setLga(item)}
                  disabled={loading}
                  style={[
                    styles.townButton,
                    selected && styles.townButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Community *</Text>

          <TextInput
            value={community}
            onChangeText={setCommunity}
            placeholder="Enter your community"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            autoCapitalize="words"
            editable={!loading}
          />

          <Text style={styles.label}>Password *</Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            editable={!loading}
          />

          <Text style={styles.label}>Confirm password *</Text>

          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Enter your password again"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={[
              styles.primaryButton,
              loading && styles.disabledButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Creating account..." : "Create Account"}
            </Text>
          </Pressable>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
            </Text>

            <Link href="/login" asChild>
              <Pressable>
                <Text style={styles.loginLink}>Log in</Text>
              </Pressable>
            </Link>
          </View>

          <Text style={styles.footer}>
            ANAMBRAFIX — Your Community. Your Voice.
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
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 35,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 10,
  },
  brandName: {
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: colors.primary,
    textAlign: "center",
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 7,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginTop: 17,
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 14,
  },
  fixedField: {
    justifyContent: "center",
  },
  fixedFieldText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },
  townContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  townButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  townButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 24,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 28,
  },
});
