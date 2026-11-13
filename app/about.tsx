
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAppTheme } from "../context/ThemeContext";

export default function AboutScreen() {
  const router = useRouter();
  const { theme, resolvedMode } = useAppTheme();

  const isDark = resolvedMode === "dark";
  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>About AnambraFix</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* INTRODUCTION */}
          <View style={styles.heroCard}>
            <Text style={styles.heroIcon}>🏛️</Text>

            <Text style={styles.heroTitle}>AnambraFix</Text>

            <Text style={styles.heroSubtitle}>
              Connecting Citizens. Encouraging Accountability.
              Supporting Development.
            </Text>

            <Text style={styles.heroLocation}>
              YOUR STATE. YOUR VOICE. YOUR FUTURE.
            </Text>
          </View>

          {/* ABOUT THE INITIATIVE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              About AnambraFix
            </Text>

            <Text style={styles.bodyText}>
              AnambraFix is an independent digital initiative
              created by EYAH CHRISTIAN CHINECHEREM, a Computer
              Science student of Chukwuemeka Odumegwu Ojukwu
              University.
            </Text>

            <Text style={styles.bodyText}>
              The initiative is driven by a vision to use
              technology to connect citizens, improve access
              to public information, encourage constructive
              participation and support the continued
              development of Anambra State.
            </Text>

            <Text style={styles.bodyText}>
              AnambraFix aims to provide a convenient digital
              platform where residents can access important
              announcements, explore public projects, find
              useful community information and report issues
              affecting their surroundings.
            </Text>

            <Text style={styles.bodyText}>
              It is a contribution towards building a more
              informed, connected and development-conscious
              society through technology.
            </Text>
          </View>

          {/* FEATURES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              What AnambraFix Offers
            </Text>

            <FeatureItem
              icon="📢"
              title="Public Announcements"
              description="Access important public announcements, community updates and relevant information."
              styles={styles}
            />

            <FeatureItem
              icon="🏗️"
              title="Public Projects"
              description="Explore published development projects and follow their reported progress across Anambra State."
              styles={styles}
            />

            <FeatureItem
              icon="📝"
              title="Citizen Reports"
              description="Report community problems and follow updates on submitted reports."
              styles={styles}
            />

            <FeatureItem
              icon="🚨"
              title="Emergency and Security Information"
              description="Find useful emergency information and important security contacts."
              styles={styles}
            />

            <FeatureItem
              icon="🏛️"
              title="Government Information"
              description="Explore available government information, public leadership records and the history of Anambra State."
              styles={styles}
            />

            <FeatureItem
              icon="🌱"
              title="Community Development"
              description="Promote awareness, civic responsibility and constructive citizen participation."
              styles={styles}
            />
          </View>

          {/* VISION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Our Vision for Anambra State
            </Text>

            <Text style={styles.bodyText}>
              Our vision is to contribute to an Anambra State
              where technology makes public information more
              accessible, citizens are better informed, and
              communities have meaningful opportunities to
              communicate their needs.
            </Text>

            <Text style={styles.bodyText}>
              We believe sustainable development requires
              collaboration, transparency, responsible
              leadership and active participation from
              citizens.
            </Text>

            <Text style={styles.bodyText}>
              AnambraFix is being developed as part of a
              continuing effort to use digital innovation
              to support these goals and contribute positively
              to the future of our state.
            </Text>
          </View>

          {/* ACADEMIC ACKNOWLEDGEMENT */}
          <View style={styles.acknowledgementCard}>
            <Text style={styles.acknowledgementLabel}>
              ACADEMIC ACKNOWLEDGEMENT
            </Text>

            <Text style={styles.acknowledgementTitle}>
              Prof. Ike Mbgbeafuike
            </Text>

            <Text style={styles.acknowledgementRole}>
              Head of Department
            </Text>

            <Text style={styles.acknowledgementText}>
              I respectfully acknowledge Prof. Ike Mbgbeafuike,
              my Head of Department at Chukwuemeka Odumegwu
              Ojukwu University.
            </Text>

            <Text style={styles.acknowledgementText}>
              I deeply appreciate the academic guidance,
              leadership and contribution of lecturers and
              educators who help shape students into
              responsible professionals and innovators.
            </Text>

            <Text style={styles.acknowledgementText}>
              As a Computer Science student, I remain
              committed to applying the knowledge and skills
              I acquire to practical solutions that can make
              a positive difference in society.
            </Text>
          </View>

          {/* FOUNDER */}
          <View style={styles.founderCard}>
            <Text style={styles.founderLabel}>
              ABOUT THE FOUNDER
            </Text>

            <View style={styles.founderIcon}>
              <Text style={styles.founderEmoji}>👨‍💻</Text>
            </View>

            <Text style={styles.founderName}>
              EYAH CHRISTIAN CHINECHEREM
            </Text>

            <Text style={styles.founderRole}>
              Founder and Developer, AnambraFix
            </Text>

            <View style={styles.founderDivider} />

            <View style={styles.founderInfo}>
              <Text style={styles.infoLabel}>Institution</Text>
              <Text style={styles.infoValue}>
                Chukwuemeka Odumegwu Ojukwu University
              </Text>
            </View>

            <View style={styles.founderInfo}>
              <Text style={styles.infoLabel}>Field of Study</Text>
              <Text style={styles.infoValue}>Computer Science</Text>
            </View>

            <Text style={styles.founderDescription}>
              AnambraFix is an independent initiative born out
              of a passion for technology, innovation and
              community development. It reflects my desire
              to use what I am learning in Computer Science
              to create useful digital solutions and contribute
              to the progress of Anambra State.
            </Text>
          </View>

          {/* INDEPENDENCE NOTICE */}
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>
              An Independent Digital Initiative
            </Text>

            <Text style={styles.noticeText}>
              AnambraFix is independently developed. References
              to academic institutions and individuals in this
              section are acknowledgements and do not imply
              official sponsorship, endorsement or ownership
              of the platform.
            </Text>
          </View>

          {/* CLOSING */}
          <View style={styles.closingSection}>
            <Text style={styles.closingTitle}>OUR STATE.</Text>
            <Text style={styles.closingTitle}>OUR VOICE.</Text>
            <Text style={styles.closingTitle}>OUR FUTURE.</Text>

            <Text style={styles.closingSubtitle}>
              Together, let us contribute to a better Anambra
              State.
            </Text>
          </View>

          <Text style={styles.footer}>
            Developed with purpose for the people of Anambra State.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  styles,
}: {
  icon: string;
  title: string;
  description: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureEmoji}>{icon}</Text>
      </View>

      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

function createStyles(
  theme: ReturnType<typeof useAppTheme>["theme"],
  isDark: boolean
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      height: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      fontSize: 32,
      color: theme.text,
      lineHeight: 36,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: theme.text,
    },
    headerSpacer: {
      width: 40,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 35,
    },
    heroCard: {
      backgroundColor: theme.primary,
      borderRadius: 22,
      padding: 26,
      alignItems: "center",
      marginBottom: 27,
    },
    heroIcon: {
      fontSize: 42,
      marginBottom: 12,
    },
    heroTitle: {
      color: "#FFFFFF",
      fontSize: 27,
      fontWeight: "900",
      textAlign: "center",
    },
    heroSubtitle: {
      color: "#E5F4E9",
      fontSize: 13,
      lineHeight: 21,
      textAlign: "center",
      marginTop: 10,
    },
    heroLocation: {
      color: "#FFFFFF",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1.5,
      marginTop: 18,
      textAlign: "center",
    },
    section: {
      marginBottom: 27,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 13,
    },
    bodyText: {
      color: theme.textSecondary,
      fontSize: 13,
      lineHeight: 23,
      marginBottom: 12,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 14,
      marginBottom: 11,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor: isDark ? "#263C30" : "#EAF4ED",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    featureEmoji: {
      fontSize: 21,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 5,
    },
    featureDescription: {
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 19,
    },
    acknowledgementCard: {
      backgroundColor: isDark ? "#20372A" : "#EDF6EF",
      borderRadius: 19,
      borderWidth: 1,
      borderColor: isDark ? "#345B42" : "#D5E8D9",
      padding: 20,
      marginBottom: 23,
    },
    acknowledgementLabel: {
      color: theme.primary,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.3,
      marginBottom: 13,
    },
    acknowledgementTitle: {
      color: theme.text,
      fontSize: 19,
      fontWeight: "900",
      lineHeight: 27,
    },
    acknowledgementRole: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: "800",
      marginTop: 6,
      marginBottom: 15,
    },
    acknowledgementText: {
      color: theme.textSecondary,
      fontSize: 12,
      lineHeight: 21,
      marginBottom: 10,
    },
    founderCard: {
      backgroundColor: theme.surface,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 21,
      alignItems: "center",
      marginBottom: 22,
    },
    founderLabel: {
      color: theme.primary,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.3,
      marginBottom: 16,
    },
    founderIcon: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: isDark ? "#263C30" : "#EAF4ED",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    founderEmoji: {
      fontSize: 31,
    },
    founderName: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "900",
      textAlign: "center",
    },
    founderRole: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: "800",
      textAlign: "center",
      marginTop: 7,
    },
    founderDivider: {
      height: 1,
      backgroundColor: theme.border,
      width: "100%",
      marginVertical: 17,
    },
    founderInfo: {
      width: "100%",
      marginBottom: 12,
    },
    infoLabel: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: "700",
      marginBottom: 4,
    },
    infoValue: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 19,
    },
    founderDescription: {
      color: theme.textSecondary,
      fontSize: 12,
      lineHeight: 21,
      textAlign: "center",
      marginTop: 7,
    },
    noticeCard: {
      padding: 16,
      borderRadius: 15,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 22,
    },
    noticeTitle: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 7,
    },
    noticeText: {
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 19,
    },
    closingSection: {
      alignItems: "center",
      paddingVertical: 17,
    },
    closingTitle: {
      color: theme.primary,
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: 1.6,
      marginBottom: 5,
    },
    closingSubtitle: {
      color: theme.textSecondary,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 12,
      textAlign: "center",
    },
    footer: {
      color: theme.textSecondary,
      fontSize: 10,
      lineHeight: 17,
      textAlign: "center",
      marginTop: 19,
    },
  });
}
