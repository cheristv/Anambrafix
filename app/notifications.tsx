
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { useAppTheme } from "../context/ThemeContext";

const STORAGE_KEY = "igbo_eze_north_notification_preferences";

type NotificationPreferences = {
  enabled: boolean;
  announcements: boolean;
  emergencyAlerts: boolean;
  projectUpdates: boolean;
  reportUpdates: boolean;
  generalUpdates: boolean;
};

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  announcements: true,
  emergencyAlerts: true,
  projectUpdates: true,
  reportUpdates: true,
  generalUpdates: false,
};

type NotificationOption = {
  key: keyof Omit<NotificationPreferences, "enabled">;
  title: string;
  description: string;
  icon: string;
  important?: boolean;
};

const notificationOptions: NotificationOption[] = [
  {
    key: "announcements",
    title: "Government Announcements",
    description: "News, public notices and official announcements.",
    icon: "📢",
  },
  {
    key: "emergencyAlerts",
    title: "Emergency Alerts",
    description: "Important safety and emergency information.",
    icon: "🚨",
    important: true,
  },
  {
    key: "projectUpdates",
    title: "Community Projects",
    description: "Updates about ongoing and completed projects.",
    icon: "🏗️",
  },
  {
    key: "reportUpdates",
    title: "Report Updates",
    description: "Updates when the status of your reports changes.",
    icon: "📋",
  },
  {
    key: "generalUpdates",
    title: "General Updates",
    description: "Other useful information about the app.",
    icon: "🔔",
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        setPreferences({
          ...defaultPreferences,
          ...parsed,
        });
      }
    } catch {
      Alert.alert(
        "Loading Error",
        "Your notification preferences could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (
    updatedPreferences: NotificationPreferences
  ) => {
    setPreferences(updatedPreferences);
    setSaving(true);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedPreferences)
      );
    } catch {
      Alert.alert(
        "Save Error",
        "Your notification preferences could not be saved."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleMaster = (value: boolean) => {
    savePreferences({
      ...preferences,
      enabled: value,
    });
  };

  const toggleOption = (
    key: keyof Omit<NotificationPreferences, "enabled">,
    value: boolean
  ) => {
    savePreferences({
      ...preferences,
      [key]: value,
    });
  };

  const allNotificationsOff = !preferences.enabled;

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textSecondary, marginTop: 12 }}>
          Loading notification settings...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.primary }]}>
            ‹ Back
          </Text>
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.headingIcon}>🔔</Text>

          <Text style={[styles.title, { color: theme.text }]}>
            Notifications
          </Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Choose the updates you would like to receive from
            Igbo-Eze-North.
          </Text>
        </View>

        <View
          style={[
            styles.masterCard,
            {
              backgroundColor: theme.primary,
            },
          ]}
        >
          <View style={styles.masterTextContainer}>
            <Text style={styles.masterTitle}>
              All Notifications
            </Text>

            <Text style={styles.masterDescription}>
              {preferences.enabled
                ? "Notifications are enabled."
                : "All app notifications are disabled."}
            </Text>
          </View>

          <Switch
            value={preferences.enabled}
            onValueChange={toggleMaster}
            trackColor={{
              false: "#A0A0A0",
              true: "#B8E0C5",
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notification Categories
          </Text>

          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Manage the types of updates you receive.
          </Text>
        </View>

        <View
          style={[
            styles.optionsCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {notificationOptions.map((option, index) => (
            <View key={option.key}>
              <View style={styles.optionRow}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <Text style={styles.optionIcon}>
                    {option.icon}
                  </Text>
                </View>

                <View style={styles.optionTextContainer}>
                  <View style={styles.optionTitleRow}>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>
                      {option.title}
                    </Text>

                    {option.important && (
                      <View style={styles.importantBadge}>
                        <Text style={styles.importantText}>
                          Important
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.optionDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>

                <Switch
                  value={
                    preferences.enabled
                      ? preferences[option.key]
                      : false
                  }
                  disabled={allNotificationsOff}
                  onValueChange={(value) =>
                    toggleOption(option.key, value)
                  }
                  trackColor={{
                    false: "#A0A0A0",
                    true: theme.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {index !== notificationOptions.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: theme.border },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.surface },
          ]}
        >
          <Text style={styles.infoIcon}>ℹ️</Text>

          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              About Notifications
            </Text>

            <Text style={[styles.infoDescription, { color: theme.textSecondary }]}>
              These settings save your preferences on this device.
              Actual push notifications will be connected when the
              notification service is implemented.
            </Text>
          </View>
        </View>

        <View style={styles.saveStatus}>
          {saving ? (
            <>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                Saving preferences...
              </Text>
            </>
          ) : (
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              Your preferences are saved on this device.
            </Text>
          )}
        </View>

        <Text style={[styles.footer, { color: theme.textSecondary }]}>
          IGBO-EZE-NORTH
        </Text>
      </ScrollView>
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
  },
  container: {
    padding: 20,
    paddingBottom: 45,
  },
  backButton: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 24,
  },
  heading: {
    alignItems: "center",
    marginBottom: 28,
  },
  headingIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 9,
  },
  masterCard: {
    minHeight: 92,
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  masterTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  masterTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  masterDescription: {
    color: "#E9F5ED",
    fontSize: 12,
    marginTop: 6,
  },
  sectionHeading: {
    marginTop: 28,
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 5,
  },
  optionsCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  optionRow: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionIcon: {
    fontSize: 19,
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: 7,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  optionDescription: {
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  importantBadge: {
    backgroundColor: "#FCE8E6",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  importantText: {
    color: "#B3261E",
    fontSize: 9,
    fontWeight: "800",
  },
  separator: {
    height: 1,
    marginLeft: 54,
  },
  infoCard: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 15,
    marginTop: 22,
    gap: 11,
  },
  infoIcon: {
    fontSize: 19,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  infoDescription: {
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },
  saveStatus: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
  },
  statusText: {
    fontSize: 11,
    textAlign: "center",
  },
  footer: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 20,
  },
});
