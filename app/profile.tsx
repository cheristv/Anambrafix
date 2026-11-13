
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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

type Profile = {
  id: string;
  surname: string;
  other_names: string;
  phone: string;
  email: string;
  gender: string;
  date_of_birth: string;
  state: string;
  lga: string;
  community: string;
};

type Lga = {
  id: string;
  name: string;
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  editable: boolean;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile | null>(null);
  const [lgas, setLgas] = useState<Lga[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [lgaModalVisible, setLgaModalVisible] = useState(false);
  const [lgaSearch, setLgaSearch] = useState("");

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const loadLgas = useCallback(async () => {
    try {
      setLoadingLgas(true);

      const { data, error } = await supabase
        .from("towns")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) throw error;

      setLgas(data ?? []);
    } catch (error) {
      console.error("LGA loading error:", error);
    } finally {
      setLoadingLgas(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, surname, other_names, phone, gender, date_of_birth, state, lga, community, email"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "Your account does not have a profile record yet. Please contact support so your citizen profile can be created."
        );
      }

      const loadedProfile: Profile = {
        id: data.id,
        surname: data.surname ?? "",
        other_names: data.other_names ?? "",
        phone: data.phone ?? "",
        email: user.email ?? data.email ?? "",
        gender: data.gender ?? "",
        date_of_birth: data.date_of_birth ?? "",
        state: data.state ?? "Anambra State",
        lga: data.lga ?? "",
        community: data.community ?? "",
      };

      setProfile(loadedProfile);
      setForm(loadedProfile);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load your profile.";

      console.error("Profile loading error:", error);
      Alert.alert("Profile Error", message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
    loadLgas();
  }, [loadProfile, loadLgas]);

  const updateField = (field: keyof Profile, value: string) => {
    setForm((current) =>
      current ? { ...current, [field]: value } : current
    );
  };

  const cancelEditing = () => {
    setForm(profile);
    setEditing(false);
    setLgaModalVisible(false);
    setLgaSearch("");
  };

  const saveProfile = async () => {
    if (!form || !profile) return;

    if (
      !form.surname.trim() ||
      !form.other_names.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.lga.trim() ||
      !form.community.trim()
    ) {
      Alert.alert(
        "Missing Information",
        "Please complete your surname, other names, phone number, email, LGA and community."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    const selectedLga = lgas.find(
      (item) => item.name.toLowerCase() === form.lga.trim().toLowerCase()
    );

    if (!selectedLga) {
      Alert.alert(
        "Invalid LGA",
        "Please select an LGA from the available list."
      );
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please sign in again.");

      const newEmail = form.email.trim().toLowerCase();
      const oldEmail = (user.email ?? profile.email).toLowerCase();

      let emailNeedsConfirmation = false;

      if (newEmail !== oldEmail) {
        const { data, error } = await supabase.auth.updateUser({
          email: newEmail,
        });

        if (error) throw error;

        emailNeedsConfirmation =
          data.user?.email?.toLowerCase() !== newEmail;
      }

      const updatedProfile = {
        surname: form.surname.trim(),
        other_names: form.other_names.trim(),
        phone: form.phone.trim(),
        gender: form.gender.trim(),
        date_of_birth: form.date_of_birth.trim() || null,
        state: "Anambra State",
        lga: selectedLga.name,
        community: form.community.trim(),
        ...(emailNeedsConfirmation ? {} : { email: newEmail }),
      };

      const { data: savedData, error: updateError } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", user.id)
        .select(
          "id, surname, other_names, phone, gender, date_of_birth, state, lga, community, email"
        )
        .single();

      if (updateError) throw updateError;

      if (!savedData) {
        throw new Error("The profile update could not be confirmed.");
      }

      const savedProfile: Profile = {
        id: savedData.id,
        surname: savedData.surname ?? "",
        other_names: savedData.other_names ?? "",
        phone: savedData.phone ?? "",
        email: emailNeedsConfirmation
          ? profile.email
          : newEmail,
        gender: savedData.gender ?? "",
        date_of_birth: savedData.date_of_birth ?? "",
        state: savedData.state ?? "Anambra State",
        lga: savedData.lga ?? "",
        community: savedData.community ?? "",
      };

      setProfile(savedProfile);
      setForm(savedProfile);
      setEditing(false);

      if (emailNeedsConfirmation) {
        Alert.alert(
          "Profile Updated",
          "Your profile details have been saved. Please check your email for the confirmation instructions to complete your email change."
        );
      } else {
        Alert.alert(
          "Success",
          "Your profile has been saved successfully."
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save your profile.";

      Alert.alert("Update Failed", message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Missing Information", "Enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        "Weak Password",
        "Your new password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "The passwords do not match.");
      return;
    }

    try {
      setSavingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordModalVisible(false);
      setNewPassword("");
      setConfirmPassword("");

      Alert.alert(
        "Password Updated",
        "Your new password has been securely saved by Supabase Authentication."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update your password.";

      Alert.alert("Password Update Failed", message);
    } finally {
      setSavingPassword(false);
    }
  };

  const filteredLgas = lgas.filter((item) =>
    item.name.toLowerCase().includes(lgaSearch.trim().toLowerCase())
  );

  const ProfileField = ({
    label,
    value,
    onChangeText,
    editable,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "words",
  }: FieldProps) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        placeholderTextColor={theme.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: editable ? theme.background : theme.surface,
            borderColor: theme.border,
          },
          !editable && styles.disabledInput,
        ]}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading your profile...
        </Text>
      </SafeAreaView>
    );
  }

  if (!profile || !form) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <Text
          style={{
            color: theme.text,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Your profile could not be loaded.
        </Text>

        <Pressable onPress={loadProfile} style={styles.retryButton}>
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
            Try Again
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 18 }}
        >
          <Text style={{ color: theme.primary, fontWeight: "700" }}>
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Text style={[styles.backButton, { color: theme.primary }]}>
                ‹ Back
              </Text>
            </Pressable>

            <Text style={[styles.heading, { color: theme.text }]}>
              My Profile
            </Text>

            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Manage your AnambraFix citizen account.
            </Text>
          </View>

          <View
            style={[styles.profileCard, { backgroundColor: theme.primary }]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>

            <Text style={styles.profileName}>
              {profile.surname} {profile.other_names}
            </Text>

            <Text style={styles.profileEmail}>{profile.email}</Text>

            <Text style={styles.residentLabel}>
              ANAMBRA STATE CITIZEN
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Personal Details
            </Text>

            {!editing && (
              <Pressable onPress={() => setEditing(true)}>
                <Text style={[styles.editText, { color: theme.primary }]}>
                  ✎ Edit Profile
                </Text>
              </Pressable>
            )}
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
            <ProfileField
              label="Surname"
              value={form.surname}
              editable={editing}
              onChangeText={(value) => updateField("surname", value)}
            />

            <ProfileField
              label="Other Names"
              value={form.other_names}
              editable={editing}
              onChangeText={(value) => updateField("other_names", value)}
            />

            <ProfileField
              label="Phone Number"
              value={form.phone}
              editable={editing}
              keyboardType="phone-pad"
              onChangeText={(value) => updateField("phone", value)}
            />

            <ProfileField
              label="Email Address"
              value={form.email}
              editable={editing}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(value) => updateField("email", value)}
            />

            <ProfileField
              label="Gender"
              value={form.gender}
              editable={editing}
              onChangeText={(value) => updateField("gender", value)}
            />

            <ProfileField
              label="Date of Birth"
              value={form.date_of_birth}
              editable={editing}
              placeholder="YYYY-MM-DD"
              onChangeText={(value) =>
                updateField("date_of_birth", value)
              }
            />

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Local Government Area
              </Text>

              <Pressable
                disabled={!editing}
                onPress={() => {
                  setLgaSearch("");
                  setLgaModalVisible(true);
                }}
                style={[
                  styles.selector,
                  {
                    backgroundColor: editing
                      ? theme.background
                      : theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: form.lga ? theme.text : theme.textSecondary,
                    fontSize: 14,
                  }}
                >
                  {form.lga || "Select your LGA"}
                </Text>

                {editing && (
                  <Text style={{ color: theme.primary }}>▼</Text>
                )}
              </Pressable>
            </View>

            <ProfileField
              label="Community"
              value={form.community}
              editable={editing}
              onChangeText={(value) => updateField("community", value)}
            />

            <ProfileField
              label="State"
              value="Anambra State"
              editable={false}
              onChangeText={() => {}}
            />
          </View>

          {editing && (
            <View style={styles.actions}>
              <Pressable
                onPress={cancelEditing}
                disabled={saving}
                style={[
                  styles.cancelButton,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  },
                ]}
              >
                <Text style={{ color: theme.text, fontWeight: "700" }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={saveProfile}
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
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          )}

          <View
            style={[
              styles.securityCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Account Security
            </Text>

            <Text
              style={[
                styles.securityDescription,
                { color: theme.textSecondary },
              ]}
            >
              Keep your account secure by using a strong password.
            </Text>

            <Pressable
              onPress={() => setPasswordModalVisible(true)}
              style={[
                styles.passwordButton,
                { borderColor: theme.primary },
              ]}
            >
              <Text style={{ color: theme.primary, fontWeight: "800" }}>
                Change Password
              </Text>
            </Pressable>
          </View>

          {!editing && (
            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
              Keep your information accurate to help AnambraFix provide
              relevant citizen services and updates.
            </Text>
          )}

          <Text style={[styles.footer, { color: theme.textSecondary }]}>
            ANAMBRAFIX
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={lgaModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLgaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Select Your LGA
                </Text>
                <Text
                  style={[styles.modalSubtitle, { color: theme.textSecondary }]}
                >
                  Choose your Local Government Area.
                </Text>
              </View>

              <Pressable
                onPress={() => setLgaModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={{ color: theme.text, fontSize: 22 }}>×</Text>
              </Pressable>
            </View>

            <TextInput
              value={lgaSearch}
              onChangeText={setLgaSearch}
              placeholder="Search LGA..."
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.searchInput,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            />

            {loadingLgas ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.textSecondary, marginTop: 10 }}>
                  Loading LGAs...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.townList}
                keyboardShouldPersistTaps="handled"
              >
                {filteredLgas.map((item) => {
                  const selected = form.lga === item.name;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        updateField("lga", item.name);
                        setLgaModalVisible(false);
                        setLgaSearch("");
                      }}
                      style={[
                        styles.townOption,
                        {
                          backgroundColor: selected
                            ? theme.primaryLight
                            : theme.surface,
                          borderBottomColor: theme.border,
                        },
                      ]}
                    >
                      <Text style={{ color: theme.text, fontSize: 14 }}>
                        {item.name}
                      </Text>

                      {selected && (
                        <Text style={{ color: theme.primary }}>✓</Text>
                      )}
                    </Pressable>
                  );
                })}

                {filteredLgas.length === 0 && (
                  <Text
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    No LGAs found.
                  </Text>
                )}
              </ScrollView>
            )}

            <Text style={[styles.townCount, { color: theme.textSecondary }]}>
              {lgas.length} LGAs available
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.passwordModal,
              { backgroundColor: theme.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Change Password
              </Text>

              <Pressable
                onPress={() => setPasswordModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={{ color: theme.text, fontSize: 22 }}>×</Text>
              </Pressable>
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>
              New Password
            </Text>

            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              style={[
                styles.input,
                styles.passwordInput,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Confirm New Password
            </Text>

            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              style={[
                styles.input,
                styles.passwordInput,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            />

            <Text
              style={[
                styles.securityDescription,
                { color: theme.textSecondary },
              ]}
            >
              Use at least 8 characters. Your password is managed securely
              through Supabase Authentication, not stored as plain text in
              your profile.
            </Text>

            <Pressable
              onPress={changePassword}
              disabled={savingPassword}
              style={[
                styles.saveButton,
                {
                  backgroundColor: theme.primary,
                  opacity: savingPassword ? 0.7 : 1,
                  marginTop: 18,
                  flex: 0,
                },
              ]}
            >
              {savingPassword ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Update Password</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  retryButton: {
    backgroundColor: "#167A45",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  container: {
    padding: 20,
    paddingBottom: 45,
  },
  header: {
    marginBottom: 22,
  },
  backButton: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 18,
  },
  heading: {
    fontSize: 27,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
  },
  profileCard: {
    alignItems: "center",
    padding: 22,
    borderRadius: 18,
    marginBottom: 28,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#FFFFFF30",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },
  profileEmail: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 6,
  },
  residentLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  editText: {
    fontSize: 13,
    fontWeight: "800",
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
  },
  fieldContainer: {
    marginBottom: 17,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    height: 49,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 13,
    fontSize: 14,
  },
  disabledInput: {
    opacity: 0.8,
  },
  selector: {
    height: 49,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    flex: 1.5,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  securityCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 22,
  },
  securityDescription: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  passwordButton: {
    height: 47,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  passwordInput: {
    marginBottom: 17,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 18,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "78%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  passwordModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 35,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 5,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  modalLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  townList: {
    flex: 1,
  },
  townOption: {
    minHeight: 53,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 13,
  },
  townCount: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 12,
  },
});
