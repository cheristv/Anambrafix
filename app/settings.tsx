
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../lib/supabase";
import { useAppTheme } from "../context/ThemeContext";

type SettingItemProps = {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  danger?: boolean;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [signingOut, setSigningOut] = useState(false);

  const openPage = (path: string) => {
    router.push(path as never);
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            try {
              setSigningOut(true);

              const { error } = await supabase.auth.signOut();

              if (error) {
                throw error;
              }

              router.replace("/login");
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Unable to sign out. Please try again.";

              Alert.alert("Sign out failed", message);
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({
    title,
    description,
    icon,
    onPress,
    danger = false,
  }: SettingItemProps) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: danger
              ? theme.danger + "15"
              : theme.primaryLight,
          },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.settingTextContainer}>
        <Text
          style={[
            styles.settingTitle,
            { color: danger ? theme.danger : theme.text },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.settingDescription,
            { color: theme.textSecondary },
          ]}
        >
          {description}
        </Text>
      </View>

      <Text style={{ color: theme.textSecondary, fontSize: 22 }}>
        ›
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.heading, { color: theme.text }]}>
              Settings
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: theme.textSecondary },
              ]}
            >
              Manage your account and preferences
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.accountCard,
            {
              backgroundColor: theme.primary,
            },
          ]}
        >
          <View style={styles.accountIcon}>
            <Text style={styles.accountIconText}>👤</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.accountTitle}>Your Account</Text>
            <Text style={styles.accountDescription}>
              Manage your personal information and security.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          ACCOUNT
        </Text>

        <SettingItem
          icon="👤"
          title="My Profile"
          description="View and edit your personal information"
          onPress={() => openPage("/profile")}
        />

        <SettingItem
          icon="🔒"
          title="Change Password"
          description="Update your account password"
          onPress={() => openPage("/change-password")}
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          PREFERENCES
        </Text>

        <SettingItem
          icon="🎨"
          title="Appearance"
          description="Light, dark or system default theme"
          onPress={() => openPage("/appearance")}
        />

        <SettingItem
          icon="🔔"
          title="Notifications"
          description="Manage your notification preferences"
          onPress={() => openPage("/notifications")}
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          INFORMATION
        </Text>

        <SettingItem
          icon="ℹ️"
          title="About the App"
          description="Learn about Igbo-Eze-North"
          onPress={() => openPage("/about")}
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          ACCOUNT ACTIONS
        </Text>

        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              borderColor: theme.danger,
              backgroundColor: theme.surface,
              opacity: pressed || signingOut ? 0.7 : 1,
            },
          ]}
        >
          {signingOut ? (
            <ActivityIndicator color={theme.danger} />
          ) : (
            <>
              <Text style={styles.signOutIcon}>↪</Text>
              <Text
                style={[
                  styles.signOutText,
                  { color: theme.danger },
                ]}
              >
                Sign Out
              </Text>
            </>
          )}
        </Pressable>

        <Text
          style={[
            styles.footer,
            { color: theme.textSecondary },
          ]}
        >
          IGBO-EZE-NORTH
        </Text>

        <Text
          style={[
            styles.version,
            { color: theme.textSecondary },
          ]}
        >
          Your Local Government in Your Pocket
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    marginBottom: 28,
    gap: 14,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF30",
    alignItems: "center",
    justifyContent: "center",
  },
  accountIconText: {
    fontSize: 23,
  },
  accountTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  accountDescription: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 12,
  },
  settingItem: {
    minHeight: 78,
    borderRadius: 15,
    borderWidth: 1,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 19,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  settingDescription: {
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },
  signOutButton: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  signOutIcon: {
    fontSize: 20,
    color: "#D93636",
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    textAlign: "center",
    marginTop: 35,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  version: {
    textAlign: "center",
    marginTop: 6,
    fontSize: 11,
  },
});
