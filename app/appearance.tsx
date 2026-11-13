
import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ThemeMode,
  useAppTheme,
} from "../context/ThemeContext";

const appearanceOptions: {
  id: ThemeMode;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "light",
    title: "Light Mode",
    description: "Use the light appearance throughout the app.",
    icon: "☀️",
  },
  {
    id: "dark",
    title: "Dark Mode",
    description: "Use a darker appearance throughout the app.",
    icon: "🌙",
  },
  {
    id: "system",
    title: "System Default",
    description: "Follow your phone's appearance settings.",
    icon: "⚙️",
  },
];

export default function AppearanceScreen() {
  const { mode, setMode, theme } = useAppTheme();

  const styles = createStyles(theme);

  const selectAppearance = (selectedMode: ThemeMode) => {
    setMode(selectedMode);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.headingContainer}>
            <Text style={styles.heading}>Appearance</Text>
            <Text style={styles.subtitle}>
              Personalise how the app looks.
            </Text>
          </View>
        </View>

        {/* SECTION TITLE */}
        <Text style={styles.sectionTitle}>
          Choose your appearance
        </Text>

        <Text style={styles.sectionDescription}>
          Your selection will be saved automatically.
        </Text>

        {/* OPTIONS */}
        <View style={styles.optionsContainer}>
          {appearanceOptions.map((option) => {
            const selected = mode === option.id;

            return (
              <Pressable
                key={option.id}
                onPress={() => selectAppearance(option.id)}
                style={[
                  styles.optionCard,
                  selected && styles.selectedOption,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.optionIcon}>
                    {option.icon}
                  </Text>
                </View>

                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>
                    {option.title}
                  </Text>

                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    selected && styles.radioSelected,
                  ]}
                >
                  {selected && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* INFORMATION */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>
              Your preference
            </Text>

            <Text style={styles.infoDescription}>
              You can change this setting whenever you want.
              Your choice will be remembered on this device.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Igbo-Eze North
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },

    content: {
      padding: 20,
      paddingTop: 15,
      paddingBottom: 40,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 35,
    },

    backButton: {
      width: 43,
      height: 43,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
    },

    backArrow: {
      color: theme.text,
      fontSize: 32,
      lineHeight: 36,
      marginTop: -3,
    },

    headingContainer: {
      flex: 1,
    },

    heading: {
      color: theme.text,
      fontSize: 24,
      fontWeight: "800",
    },

    subtitle: {
      color: theme.textSecondary,
      fontSize: 12,
      marginTop: 5,
    },

    sectionTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "800",
    },

    sectionDescription: {
      color: theme.textSecondary,
      fontSize: 12,
      marginTop: 6,
      marginBottom: 19,
    },

    optionsContainer: {
      gap: 13,
    },

    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 17,
      padding: 15,
    },

    selectedOption: {
      borderColor: theme.primary,
      borderWidth: 2,
      backgroundColor: theme.primaryLight,
    },

    iconContainer: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
    },

    optionIcon: {
      fontSize: 22,
    },

    optionText: {
      flex: 1,
    },

    optionTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "800",
    },

    optionDescription: {
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 5,
    },

    radioOuter: {
      width: 21,
      height: 21,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },

    radioSelected: {
      borderColor: theme.primary,
    },

    radioInner: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: theme.primary,
    },

    infoCard: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 15,
      marginTop: 27,
    },

    infoIcon: {
      fontSize: 21,
      marginRight: 12,
    },

    infoTextContainer: {
      flex: 1,
    },

    infoTitle: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "800",
    },

    infoDescription: {
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
    },

    footer: {
      color: theme.textSecondary,
      fontSize: 11,
      textAlign: "center",
      marginTop: 35,
    },
  });
