
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

type Governor = {
  id: string;
  full_name: string;
  official_title: string;
  administration_type:
    | "military_administrator"
    | "elected_governor"
    | "acting_administrator";
  political_party: string | null;
  start_date: string | null;
  end_date: string | null;
  biography: string | null;
  notable_developments: string | null;
  image_url: string | null;
  is_current: boolean;
};

function administrationLabel(type: Governor["administration_type"]) {
  switch (type) {
    case "military_administrator":
      return "Military Administrator";
    case "elected_governor":
      return "Elected Governor";
    case "acting_administrator":
      return "Acting Administrator";
    default:
      return "Administration";
  }
}

function formatDate(date: string | null) {
  if (!date) return "Not specified";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function GovernmentGovernorsDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [governor, setGovernor] = useState<Governor | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGovernor = useCallback(async () => {
    if (!id) {
      setGovernor(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("governors_history")
        .select(
          "id,full_name,official_title,administration_type,political_party,start_date,end_date,biography,notable_developments,image_url,is_current"
        )
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;

      setGovernor(data as Governor | null);
    } catch (error: any) {
      console.error("Governor profile loading error:", error);
      Alert.alert(
        "Unable to load profile",
        error.message ?? "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGovernor();
  }, [loadGovernor]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#123D2C" />
          <Text style={styles.backText}>
            Governors History
          </Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#00875A"
            style={styles.loader}
          />
        ) : !governor ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="person-outline"
              size={45}
              color="#8A9A91"
            />
            <Text style={styles.emptyTitle}>
              Governor record unavailable
            </Text>
            <Text style={styles.emptyText}>
              This record may not exist or may no longer be published.
              Return to Governors History to view available records.
            </Text>
            <Pressable
              style={styles.returnButton}
              onPress={() => router.replace("/government-governors")}
            >
              <Text style={styles.returnButtonText}>
                Return to Governors History
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              {governor.image_url ? (
                <Image
                  source={{ uri: governor.image_url }}
                  style={styles.portrait}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.portraitPlaceholder}>
                  <Ionicons
                    name="person"
                    size={65}
                    color="#00875A"
                  />
                </View>
              )}

              <Text style={styles.name}>
                {governor.full_name}
              </Text>

              <Text style={styles.officialTitle}>
                {governor.official_title}
              </Text>

              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {administrationLabel(governor.administration_type)}
                </Text>
              </View>

              {governor.is_current && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>
                    Current administration
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>
                Administration Details
              </Text>

              <DetailRow
                icon="calendar-outline"
                label="Start date"
                value={formatDate(governor.start_date)}
              />

              <DetailRow
                icon="calendar-clear-outline"
                label="End date"
                value={
                  governor.is_current
                    ? "Present"
                    : formatDate(governor.end_date)
                }
              />

              <DetailRow
                icon="flag-outline"
                label="Political party"
                value={governor.political_party || "Not specified"}
              />

              <DetailRow
                icon="ribbon-outline"
                label="Administration"
                value={administrationLabel(governor.administration_type)}
              />
            </View>

            {governor.biography ? (
              <View style={styles.contentCard}>
                <View style={styles.sectionHeadingRow}>
                  <Ionicons
                    name="person-circle-outline"
                    size={21}
                    color="#00875A"
                  />
                  <Text style={styles.sectionTitle}>
                    Biography
                  </Text>
                </View>

                <Text style={styles.bodyText}>
                  {governor.biography}
                </Text>
              </View>
            ) : null}

            {governor.notable_developments ? (
              <View style={styles.contentCard}>
                <View style={styles.sectionHeadingRow}>
                  <Ionicons
                    name="business-outline"
                    size={21}
                    color="#00875A"
                  />
                  <Text style={styles.sectionTitle}>
                    Notable Developments
                  </Text>
                </View>

                <Text style={styles.bodyText}>
                  {governor.notable_developments}
                </Text>
              </View>
            ) : null}

            <View style={styles.footerCard}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#00875A"
              />
              <Text style={styles.footerText}>
                AnambraFix displays governor records published through
                its official administration system.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color="#00875A" />
      </View>

      <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F6",
  },
  content: {
    padding: 20,
    paddingBottom: 45,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 8,
    marginBottom: 20,
  },
  backText: {
    color: "#123D2C",
    fontSize: 14,
    fontWeight: "700",
  },
  loader: {
    marginTop: 70,
  },
  hero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5EDE8",
  },
  portrait: {
    width: 175,
    height: 195,
    borderRadius: 16,
    backgroundColor: "#E8F5EE",
  },
  portraitPlaceholder: {
    width: 175,
    height: 195,
    borderRadius: 16,
    backgroundColor: "#E8F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: "#123D2C",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 19,
  },
  officialTitle: {
    color: "#66756D",
    fontSize: 14,
    textAlign: "center",
    marginTop: 7,
  },
  typeBadge: {
    backgroundColor: "#E8F5EE",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14,
  },
  typeBadgeText: {
    color: "#087B55",
    fontSize: 12,
    fontWeight: "800",
  },
  currentBadge: {
    backgroundColor: "#DDF4E6",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  currentBadgeText: {
    color: "#087B55",
    fontSize: 12,
    fontWeight: "800",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 17,
    marginTop: 17,
    borderWidth: 1,
    borderColor: "#E5EDE8",
  },
  sectionTitle: {
    color: "#183D2E",
    fontSize: 16,
    fontWeight: "800",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EFF3F0",
  },
  detailIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: "#E8F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    color: "#849189",
    fontSize: 11,
    fontWeight: "600",
  },
  detailValue: {
    color: "#183D2E",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 18,
    marginTop: 17,
    borderWidth: 1,
    borderColor: "#E5EDE8",
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },
  bodyText: {
    color: "#52665B",
    fontSize: 14,
    lineHeight: 24,
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#E8F5EE",
    borderRadius: 14,
    padding: 15,
    marginTop: 18,
  },
  footerText: {
    flex: 1,
    color: "#37624D",
    fontSize: 12,
    lineHeight: 19,
  },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 25,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5EDE8",
  },
  emptyTitle: {
    color: "#183D2E",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
  },
  emptyText: {
    color: "#718078",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },
  returnButton: {
    backgroundColor: "#00875A",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 18,
  },
  returnButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
