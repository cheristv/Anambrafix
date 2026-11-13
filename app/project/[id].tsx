
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { supabase } from "../../lib/supabase";
import colors from "../../constants/colors";

type ProjectStatus = "ongoing" | "completed" | "planned" | "suspended";

type Project = {
  id: string;
  title: string;
  description: string | null;
  state: string;
  lga: string | null;
  community: string | null;
  location_details: string | null;
  status: ProjectStatus;
  progress: number;
  image_urls: string[];
  start_date: string | null;
  expected_completion_date: string | null;
  created_at: string;
};

const SCREEN_WIDTH = Dimensions.get("window").width;

const STATUS: Record<
  ProjectStatus,
  { label: string; background: string; text: string }
> = {
  ongoing: {
    label: "Ongoing",
    background: "#E5F5E9",
    text: "#218344",
  },
  completed: {
    label: "Completed",
    background: "#E4F0FF",
    text: "#245DAB",
  },
  planned: {
    label: "Planned",
    background: "#FFF3D8",
    text: "#956300",
  },
  suspended: {
    label: "Suspended",
    background: "#FCE8E8",
    text: "#B42318",
  },
};

function formatDate(value: string | null) {
  if (!value) return "Not provided";

  const datePart = value.slice(0, 10);
  const date = new Date(`${datePart}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const loadProject = useCallback(async () => {
    if (!id || Array.isArray(id)) {
      setError("The project could not be identified.");
      setProject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: projectError } = await supabase
        .from("projects")
        .select(
          "id, title, description, state, lga, community, location_details, status, progress, image_urls, start_date, expected_completion_date, created_at"
        )
        .eq("id", id)
        .eq("is_published", true)
        .single();

      if (projectError) throw projectError;

      setProject(data as Project);
      setActiveImage(0);
    } catch (err) {
      console.error("Failed to load project details:", err);

      setProject(null);
      setError(
        "We couldn't load this project. It may be unavailable or unpublished. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const status = STATUS[project?.status || "planned"] || STATUS.planned;

  const progress = Math.max(
    0,
    Math.min(100, project?.progress ?? 0)
  );

  const images = (project?.image_urls ?? []).filter(
    (url) => typeof url === "string" && url.trim().length > 0
  );

  const projectLocation = project
    ? [
        project.community,
        project.lga,
        project.state,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Project details
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.stateText}>
            Loading project details...
          </Text>
        </View>
      ) : error || !project ? (
        <View style={styles.stateContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={45}
            color={colors.textSecondary}
          />

          <Text style={styles.stateTitle}>
            Project unavailable
          </Text>

          <Text style={styles.stateText}>
            {error || "This project could not be found."}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={loadProject}
          >
            <Text style={styles.retryButtonText}>
              Try again
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* PROJECT IMAGE GALLERY */}

          {images.length > 0 ? (
            <View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x /
                      SCREEN_WIDTH
                  );

                  setActiveImage(
                    Math.max(
                      0,
                      Math.min(index, images.length - 1)
                    )
                  );
                }}
              >
                {images.map((imageUrl, index) => (
                  <View
                    key={`${imageUrl}-${index}`}
                    style={styles.galleryImageContainer}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.galleryImage}
                      contentFit="contain"
                      transition={200}
                    />
                  </View>
                ))}
              </ScrollView>

              {images.length > 1 ? (
                <View style={styles.galleryFooter}>
                  <Text style={styles.imageCounter}>
                    {activeImage + 1} of {images.length} photos
                  </Text>

                  <View style={styles.dotsRow}>
                    {images.map((imageUrl, index) => (
                      <View
                        key={`${imageUrl}-dot-${index}`}
                        style={[
                          styles.dot,
                          activeImage === index &&
                            styles.activeDot,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.noImage}>
              <Ionicons
                name="business-outline"
                size={55}
                color={colors.primary}
              />

              <Text style={styles.noImageText}>
                No project photos available
              </Text>
            </View>
          )}

          {/* PROJECT TITLE AND LOCATION */}

          <View style={styles.titleSection}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: status.background },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: status.text },
                ]}
              >
                {status.label}
              </Text>
            </View>

            <Text style={styles.projectTitle}>
              {project.title}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.primary}
              />

              <Text style={styles.locationText}>
                {projectLocation || "Location not specified"}
              </Text>
            </View>

            {project.location_details ? (
              <Text style={styles.locationDetails}>
                {project.location_details}
              </Text>
            ) : null}
          </View>

          {/* PROJECT PROGRESS */}

          <View style={styles.card}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>
                Project progress
              </Text>

              <Text style={styles.progressValue}>
                {progress}%
              </Text>
            </View>

            <View
              style={styles.progressTrack}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: progress,
              }}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>

            <Text style={styles.progressDescription}>
              Reported progress of this project.
            </Text>
          </View>

          {/* FULL DESCRIPTION */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              About this project
            </Text>

            <Text style={styles.description}>
              {project.description?.trim() ||
                "No detailed description has been provided for this project yet."}
            </Text>
          </View>

          {/* PROJECT DATES */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Project timeline
            </Text>

            <View style={styles.timelineRow}>
              <View style={styles.timelineIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={colors.primary}
                />
              </View>

              <View style={styles.timelineTextContainer}>
                <Text style={styles.timelineLabel}>
                  Start date
                </Text>

                <Text style={styles.timelineValue}>
                  {formatDate(project.start_date)}
                </Text>
              </View>
            </View>

            <View style={styles.timelineDivider} />

            <View style={styles.timelineRow}>
              <View style={styles.timelineIcon}>
                <Ionicons
                  name="flag-outline"
                  size={19}
                  color={colors.primary}
                />
              </View>

              <View style={styles.timelineTextContainer}>
                <Text style={styles.timelineLabel}>
                  Expected completion
                </Text>

                <Text style={styles.timelineValue}>
                  {formatDate(project.expected_completion_date)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={19}
              color={colors.primary}
            />

            <Text style={styles.noticeText}>
              This information reflects the project record currently
              published on AnambraFix.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    marginLeft: 13,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  headerSpacer: {
    width: 42,
  },
  content: {
    paddingBottom: 35,
  },
  galleryImageContainer: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  galleryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: colors.white,
  },
  imageCounter: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: "#C9D5CD",
  },
  activeDot: {
    width: 17,
    backgroundColor: colors.primary,
  },
  noImage: {
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5EC",
    gap: 9,
  },
  noImageText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  titleSection: {
    padding: 20,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  projectTitle: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.text,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 9,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  locationDetails: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
    marginTop: 8,
    marginLeft: 24,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    backgroundColor: colors.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },
  progressTrack: {
    height: 9,
    backgroundColor: colors.background,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 15,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  progressDescription: {
    marginTop: 9,
    fontSize: 11,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary,
    marginTop: 12,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 17,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EAF5EC",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  timelineValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
  },
  timelineDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 52,
    marginTop: 13,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginHorizontal: 20,
    marginTop: 5,
    padding: 14,
    borderRadius: 13,
    backgroundColor: "#EAF5EC",
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
    gap: 12,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  stateText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: colors.textSecondary,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 11,
    marginTop: 5,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
});
