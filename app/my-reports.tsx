
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import colors from "../constants/colors";

type ReportUpdate = {
  id: string;
  old_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string;
};

type Report = {
  id: string;
  tracking_code: string;
  category: string;
  title: string;
  description: string;
  state: string;
  lga: string;
  community: string;
  location_details: string | null;
  photo_urls: string[];
  status: string;
  admin_note: string | null;
  created_at: string;
  updates: ReportUpdate[];
  photoUrl: string | null;
};

const PHOTO_BUCKET = "report-photos";

export default function MyReportsScreen() {
  const router = useRouter();

  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleViewReportStatus() {
    setShowReports(true);
    await loadReports();
  }

  async function loadReports() {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          "Login Required",
          "Please log in to view your reports.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ]
        );
        return;
      }

      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select(
          "id, tracking_code, category, title, description, state, lga, community, location_details, photo_urls, status, admin_note, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (reportError) throw reportError;

      const reportRows = reportData ?? [];
      const reportIds = reportRows.map((report) => report.id);

      let updatesData: ReportUpdate[] = [];

      if (reportIds.length > 0) {
        const { data: updateRows, error: updatesError } = await supabase
          .from("report_updates")
          .select("id, report_id, old_status, new_status, note, created_at")
          .in("report_id", reportIds)
          .order("created_at", { ascending: false });

        if (updatesError) throw updatesError;

        updatesData = (updateRows ?? []) as (ReportUpdate & {
          report_id: string;
        })[];
      }

      const reportsWithDetails = await Promise.all(
        reportRows.map(async (report) => {
          const reportUpdates = updatesData
            .filter((update) => {
              return (
                (update as ReportUpdate & { report_id?: string })
                  .report_id === report.id
              );
            })
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );

          let photoUrl: string | null = null;

          if (report.photo_urls?.length > 0) {
            const { data: signedPhoto } = await supabase.storage
              .from(PHOTO_BUCKET)
              .createSignedUrl(report.photo_urls[0], 3600);

            photoUrl = signedPhoto?.signedUrl ?? null;
          }

          return {
            ...report,
            updates: reportUpdates,
            photoUrl,
          } as Report;
        })
      );

      setReports(reportsWithDetails);
    } catch (error) {
      console.error("Error loading reports:", error);

      Alert.alert(
        "Unable to Load Reports",
        error instanceof Error
          ? error.message
          : "Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "pending":
        return "Pending";
      case "under_review":
        return "Under Review";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "resolved":
        return "#23834D";
      case "in_progress":
        return "#2563EB";
      case "under_review":
        return "#B7791F";
      case "rejected":
        return "#D93636";
      default:
        return "#68766D";
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => {
            if (showReports) {
              setShowReports(false);
            } else {
              router.back();
            }
          }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← {showReports ? "Back to Options" : "Back"}
          </Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerEmoji}>📋</Text>
          </View>

          <Text style={styles.heading}>
            {showReports ? "Report Status" : "My Reports"}
          </Text>

          <Text style={styles.subtitle}>
            {showReports
              ? "Track the progress of issues you have reported."
              : "Report community problems and follow their progress."}
          </Text>
        </View>

        {!showReports ? (
          <View style={styles.optionsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.optionCard,
                pressed && styles.pressed,
              ]}
              onPress={handleViewReportStatus}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionEmoji}>📑</Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  View Report Status
                </Text>
                <Text style={styles.optionDescription}>
                  View your submitted reports, tracking numbers, and
                  progress updates.
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.optionCard,
                styles.newReportCard,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push("/report")}
            >
              <View style={styles.newReportIcon}>
                <Text style={styles.optionEmoji}>＋</Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.newReportTitle}>
                  Report New Issue
                </Text>
                <Text style={styles.newReportDescription}>
                  Report a problem affecting your community.
                </Text>
              </View>

              <Text style={styles.newReportArrow}>›</Text>
            </Pressable>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Loading your reports...
            </Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptyDescription}>
              You have not submitted any reports yet. Report a community
              issue to get started.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/report")}
            >
              <Text style={styles.primaryButtonText}>
                Report New Issue
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.reportsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsHeading}>
                Your Submitted Reports ({reports.length})
              </Text>

              <Pressable onPress={loadReports} disabled={loading}>
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>

            {reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportTopRow}>
                  <Text style={styles.category}>
                    {report.category}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(report.status),
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusLabel(report.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.trackingLabel}>
                  TRACKING NUMBER
                </Text>
                <Text style={styles.trackingCode}>
                  {report.tracking_code}
                </Text>

                <Text style={styles.reportTitle}>
                  {report.title}
                </Text>

                <Text style={styles.description}>
                  {report.description}
                </Text>

                {report.photoUrl ? (
                  <Image
                    source={{ uri: report.photoUrl }}
                    style={styles.reportPhoto}
                    resizeMode="cover"
                  />
                ) : null}

                <View style={styles.divider} />

                <Text style={styles.detail}>
                  📍 {report.community}, {report.lga}
                </Text>

                <Text style={styles.detail}>
                  {report.state}
                </Text>

                {report.location_details ? (
                  <Text style={styles.detail}>
                    Location details: {report.location_details}
                  </Text>
                ) : null}

                <Text style={styles.date}>
                  Submitted: {formatDate(report.created_at)}
                </Text>

                {report.admin_note ? (
                  <View style={styles.adminNote}>
                    <Text style={styles.sectionHeading}>
                      Administrator's Note
                    </Text>
                    <Text style={styles.noteText}>
                      {report.admin_note}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.historySection}>
                  <Text style={styles.sectionHeading}>
                    Report History
                  </Text>

                  {report.updates.length === 0 ? (
                    <Text style={styles.noHistory}>
                      No additional updates yet.
                    </Text>
                  ) : (
                    report.updates.map((update) => (
                      <View
                        key={update.id}
                        style={styles.historyItem}
                      >
                        <View
                          style={[
                            styles.historyDot,
                            {
                              backgroundColor: getStatusColor(
                                update.new_status
                              ),
                            },
                          ]}
                        />

                        <View style={styles.historyContent}>
                          <Text style={styles.historyStatus}>
                            {getStatusLabel(update.new_status)}
                          </Text>

                          {update.note ? (
                            <Text style={styles.noteText}>
                              {update.note}
                            </Text>
                          ) : null}

                          <Text style={styles.historyDate}>
                            {formatDate(update.created_at)}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            ))}

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/report")}
            >
              <Text style={styles.primaryButtonText}>
                + Report New Issue
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 16,
  },
  backText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  headerEmoji: {
    fontSize: 30,
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 320,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  newReportCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  newReportIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionEmoji: {
    fontSize: 25,
  },
  optionContent: {
    flex: 1,
    gap: 6,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  newReportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  newReportDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.white,
  },
  arrow: {
    fontSize: 30,
    color: colors.primary,
  },
  newReportArrow: {
    fontSize: 30,
    color: colors.white,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 14,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyEmoji: {
    fontSize: 42,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  reportsContainer: {
    gap: 14,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultsHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  refreshText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  category: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  trackingLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  trackingCode: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
  },
  reportTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  reportPhoto: {
    width: "100%",
    height: 190,
    borderRadius: 12,
    marginTop: 14,
    backgroundColor: "#F1F4F1",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  detail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 7,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 9,
  },
  adminNote: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 13,
    marginTop: 15,
  },
  noteText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  historySection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 16,
    paddingTop: 15,
  },
  noHistory: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  historyItem: {
    flexDirection: "row",
    gap: 11,
    marginBottom: 16,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  historyDate: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },
});
