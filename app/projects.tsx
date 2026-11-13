
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { supabase } from "../lib/supabase";
import colors from "../constants/colors";

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

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "Planned", value: "planned" },
  { label: "Suspended", value: "suspended" },
] as const;

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  planned: "Planned",
  suspended: "Suspended",
};

const STATUS_COLORS: Record<
  ProjectStatus,
  { background: string; text: string }
> = {
  ongoing: { background: "#E5F5E9", text: "#218344" },
  completed: { background: "#E4F0FF", text: "#245DAB" },
  planned: { background: "#FFF3D8", text: "#956300" },
  suspended: { background: "#FCE8E8", text: "#B42318" },
};

export default function ProjectsScreen() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProjects = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("projects")
        .select(
          "id, title, description, state, lga, community, location_details, status, progress, image_urls, start_date, expected_completion_date, created_at"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setProjects((data ?? []) as Project[]);
    } catch (err) {
      console.error("Failed to load projects:", err);

      setError(
        "We couldn't load community projects. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const getStatus = (status: string | null): ProjectStatus => {
    if (
      status === "ongoing" ||
      status === "completed" ||
      status === "planned" ||
      status === "suspended"
    ) {
      return status;
    }

    return "planned";
  };

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter(
          (project) => getStatus(project.status) === activeFilter
        );

  const openProject = (projectId: string) => {
    router.push({
      pathname: "/project/[id]",
      params: { id: projectId },
    });
  };

  const renderProject = (project: Project) => {
    const status = getStatus(project.status);
    const statusStyle = STATUS_COLORS[status];

    const progress = Math.max(
      0,
      Math.min(100, project.progress ?? 0)
    );

    const projectLocation = [
      project.community,
      project.lga,
      project.state,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <Pressable
        key={project.id}
        style={({ pressed }) => [
          styles.projectCard,
          pressed && styles.projectCardPressed,
        ]}
        onPress={() => openProject(project.id)}
        accessibilityRole="button"
        accessibilityLabel={`View ${project.title} project details`}
      >
        <View style={styles.projectImageContainer}>
          {project.image_urls?.[0] ? (
            <Image
              source={{ uri: project.image_urls[0] }}
              style={styles.projectImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="business-outline"
                size={34}
                color={colors.primary}
              />
              <Text style={styles.imagePlaceholderText}>Project</Text>
            </View>
          )}
        </View>

        <View style={styles.projectContent}>
          <Text style={styles.projectTitle} numberOfLines={2}>
            {project.title}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.textSecondary}
            />

            <Text style={styles.locationText} numberOfLines={2}>
              {projectLocation || "Location not specified"}
            </Text>
          </View>

          <View style={styles.cardBottomRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.background },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusStyle.text },
                ]}
              >
                {STATUS_LABELS[status]}
              </Text>
            </View>

            <Text style={styles.progressText}>
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

          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>
              View details
            </Text>

            <Ionicons
              name="chevron-forward"
              size={15}
              color={colors.primary}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Public Projects
          </Text>

          <Text style={styles.headerSubtitle}>
            Development across our communities
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="business-outline"
            size={23}
            color={colors.primary}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProjects(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="construct-outline"
              size={28}
              color={colors.primary}
            />
          </View>

          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>
              Building our communities
            </Text>

            <Text style={styles.introDescription}>
              Follow public projects and check their reported progress
              across Anambra State.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Community projects
          </Text>

          <Text style={styles.projectCount}>
            {projects.length}{" "}
            {projects.length === 1 ? "project" : "projects"}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTERS.map((filter) => {
            const selected = activeFilter === filter.value;

            return (
              <Pressable
                key={filter.value}
                onPress={() => setActiveFilter(filter.value)}
                style={[
                  styles.filterButton,
                  selected && styles.activeFilterButton,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.activeFilterText,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text style={styles.stateTitle}>
              Loading projects...
            </Text>

            <Text style={styles.stateDescription}>
              Fetching the latest available project records.
            </Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <Ionicons
              name="cloud-offline-outline"
              size={44}
              color={colors.textSecondary}
            />

            <Text style={styles.stateTitle}>
              Unable to load projects
            </Text>

            <Text style={styles.stateDescription}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => loadProjects()}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={colors.white}
              />

              <Text style={styles.retryButtonText}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={styles.stateContainer}>
            <Ionicons
              name="folder-open-outline"
              size={48}
              color={colors.textSecondary}
            />

            <Text style={styles.stateTitle}>
              No projects found
            </Text>

            <Text style={styles.stateDescription}>
              {activeFilter === "all"
                ? "There are no published projects available yet."
                : `There are no ${activeFilter} projects at the moment.`}
            </Text>
          </View>
        ) : (
          <View style={styles.projectsList}>
            {filteredProjects.map(renderProject)}
          </View>
        )}

        <View style={styles.footer}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.textSecondary}
          />

          <Text style={styles.footerText}>
            Project information is displayed as provided by the
            database. Please verify official details with the
            relevant local government office.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E5F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 35,
  },
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#EAF5EC",
    marginBottom: 26,
  },
  introIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  introTextContainer: {
    flex: 1,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 5,
  },
  introDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
  },
  projectCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  filtersContainer: {
    gap: 9,
    paddingBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.white,
  },
  projectsList: {
    gap: 13,
  },
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 17,
    padding: 11,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 132,
  },
  projectCardPressed: {
    opacity: 0.75,
  },
  projectImageContainer: {
    width: 108,
    height: 108,
    borderRadius: 13,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  projectImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  imagePlaceholderText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  projectContent: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 12,
    justifyContent: "center",
  },
  projectTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
    color: colors.text,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 5,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  progressText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "700",
  },
  progressTrack: {
    height: 5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.background,
    marginTop: 7,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 7,
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
  },
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 45,
    gap: 12,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  stateDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 26,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },
});
