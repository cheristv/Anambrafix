
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { supabase } from "../lib/supabase";
import { useAppTheme } from "../context/ThemeContext";

type Announcement = {
  id: string;
  title: string;
  body: string;
  published_at: string | null;
  category: string | null;
  priority: string | null;
  lga: string | null;
  image_url: string | null;
};

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { theme, resolvedMode } = useAppTheme();

  const isDark = resolvedMode === "dark";
  const styles = createStyles(theme, isDark);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoadError(false);

      // Get the currently signed-in user.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setAnnouncements([]);
        router.replace("/login");
        return;
      }

      // Retrieve the user's actual LGA from their profile.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("lga")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const userLga =
        typeof profile?.lga === "string"
          ? profile.lga.trim().toLowerCase()
          : "";

      // Retrieve published announcements and their targeting information.
      const { data, error } = await supabase
        .from("announcements")
        .select(
          "id, title, body, published_at, category, priority, lga, image_url"
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Always show statewide announcements.
      // Show LGA-specific announcements only to matching users.
      const visibleAnnouncements = ((data ?? []) as Announcement[]).filter(
        (item) => {
          const targetLga = item.lga?.trim().toLowerCase();

          if (!targetLga) return true;

          return userLga !== "" && targetLga === userLga;
        }
      );

      setAnnouncements(visibleAnnouncements);
    } catch (error) {
      console.log("Announcements loading error:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    void loadAnnouncements();

    const channel = supabase
      .channel("anambrafix-announcements-screen")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements",
        },
        () => {
          void loadAnnouncements();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadAnnouncements]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadAnnouncements();
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCategory = (category: string | null) => {
    if (!category) return "GENERAL UPDATE";

    return category.replace(/_/g, " ").toUpperCase();
  };

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

          <Text style={styles.headerTitle}>Announcements</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        >
          <View style={styles.introCard}>
            <Text style={styles.introIcon}>📢</Text>

            <View style={styles.introTextContainer}>
              <Text style={styles.introTitle}>Stay informed</Text>

              <Text style={styles.introDescription}>
                Important announcements and updates concerning Anambra State
                and your local government area.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Latest Announcements
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.primary}
              />

              <Text style={styles.statusText}>
                Loading announcements...
              </Text>
            </View>
          ) : loadError ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>⚠️</Text>

              <Text style={styles.emptyTitle}>
                Unable to load announcements
              </Text>

              <Text style={styles.emptyDescription}>
                Please check your connection and try again.
              </Text>

              <Pressable
                onPress={() => {
                  setLoading(true);
                  void loadAnnouncements();
                }}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : announcements.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📭</Text>

              <Text style={styles.emptyTitle}>
                No announcements yet
              </Text>

              <Text style={styles.emptyDescription}>
                Important updates for Anambra State and your community will
                appear here when they are published.
              </Text>
            </View>
          ) : (
            announcements.map((item) => (
              <View key={item.id} style={styles.announcementCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {formatCategory(item.category)}
                    </Text>
                  </View>

                  <Text style={styles.date}>
                    {formatDate(item.published_at)}
                  </Text>
                </View>

                {item.priority === "urgent" && (
                  <Text style={styles.priorityText}>
                    URGENT
                  </Text>
                )}

                {item.priority === "important" && (
                  <Text style={styles.importantText}>
                    IMPORTANT
                  </Text>
                )}

                {item.lga && (
                  <View style={styles.locationBadge}>
                    <Text style={styles.locationBadgeText}>
                      LOCAL UPDATE · {item.lga}
                    </Text>
                  </View>
                )}

                {!item.lga && (
                  <View style={styles.statewideBadge}>
                    <Text style={styles.statewideBadgeText}>
                      ANAMBRA STATEWIDE
                    </Text>
                  </View>
                )}

                <Text style={styles.announcementTitle}>
                  {item.title}
                </Text>

                {item.image_url?.trim() ? (
                  <Image
                    source={{ uri: item.image_url.trim() }}
                    style={styles.announcementImage}
                    resizeMode="cover"
                    accessibilityLabel={`Image for ${item.title}`}
                  />
                ) : null}

                <Text style={styles.announcementContent}>
                  {item.body}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
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
      color: theme.text,
      fontSize: 32,
      lineHeight: 36,
    },
    headerTitle: {
      color: theme.text,
      fontSize: 17,
      fontWeight: "800",
    },
    headerSpacer: {
      width: 40,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 35,
    },
    introCard: {
      backgroundColor: theme.primary,
      borderRadius: 17,
      padding: 17,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 25,
    },
    introIcon: {
      fontSize: 31,
      marginRight: 13,
    },
    introTextContainer: {
      flex: 1,
    },
    introTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 5,
    },
    introDescription: {
      color: "#E5F4E9",
      fontSize: 11,
      lineHeight: 17,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 17,
      fontWeight: "800",
      marginBottom: 14,
    },
    loadingContainer: {
      alignItems: "center",
      paddingVertical: 45,
    },
    statusText: {
      color: theme.textSecondary,
      fontSize: 12,
      marginTop: 12,
    },
    emptyCard: {
      backgroundColor: theme.surface,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      padding: 28,
      marginTop: 5,
    },
    emptyIcon: {
      fontSize: 35,
      marginBottom: 12,
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "800",
      marginBottom: 7,
      textAlign: "center",
    },
    emptyDescription: {
      color: theme.textSecondary,
      fontSize: 12,
      textAlign: "center",
      lineHeight: 19,
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 11,
      borderRadius: 10,
      marginTop: 17,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 12,
    },
    announcementCard: {
      backgroundColor: theme.surface,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      marginBottom: 13,
    },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 13,
    },
    badge: {
      backgroundColor: isDark ? "#244633" : "#E8F4EC",
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },
    badgeText: {
      color: theme.primary,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    date: {
      color: theme.textSecondary,
      fontSize: 10,
    },
    priorityText: {
      color: "#D93025",
      fontSize: 10,
      fontWeight: "900",
      marginBottom: 8,
    },
    importantText: {
      color: "#C17A12",
      fontSize: 10,
      fontWeight: "900",
      marginBottom: 8,
    },
    locationBadge: {
      alignSelf: "flex-start",
      backgroundColor: isDark ? "#263B55" : "#EAF1FA",
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 7,
      marginBottom: 10,
    },
    locationBadgeText: {
      color: isDark ? "#A9CBF4" : "#315D91",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    statewideBadge: {
      alignSelf: "flex-start",
      backgroundColor: isDark ? "#244633" : "#E8F4EC",
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 7,
      marginBottom: 10,
    },
    statewideBadgeText: {
      color: theme.primary,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    announcementTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "900",
      lineHeight: 22,
      marginBottom: 9,
    },
    announcementImage: {
      width: "100%",
      height: 190,
      borderRadius: 12,
      backgroundColor: theme.border,
      marginBottom: 12,
    },
    announcementContent: {
      color: theme.textSecondary,
      fontSize: 12,
      lineHeight: 21,
    },
  });
}
