
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  is_published: boolean;
  display_order: number;
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
    month: "short",
    year: "numeric",
  });
}

export default function GovernmentGovernorsScreen() {
  const router = useRouter();

  const [governors, setGovernors] = useState<Governor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const loadGovernors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("governors_history")
        .select(
          "id,full_name,official_title,administration_type,political_party,start_date,end_date,biography,notable_developments,image_url,is_current,is_published,display_order"
        )
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("start_date", { ascending: true });

      if (error) throw error;

      setGovernors((data ?? []) as Governor[]);
    } catch (error: any) {
      console.error("Governors loading error:", error);

      Alert.alert(
        "Unable to load history",
        error.message ?? "Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGovernors();
  }, [loadGovernors]);

  const filteredGovernors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return governors;

    return governors.filter((governor) =>
      `${governor.full_name} ${governor.official_title} ${
        governor.political_party ?? ""
      } ${administrationLabel(governor.administration_type)}`
        .toLowerCase()
        .includes(query)
    );
  }, [governors, search]);

  const openGovernor = (id: string) => {
    router.push({
      pathname: "/government-governors-details",
      params: { id },
    });
  };

  const renderGovernor = (governor: Governor) => (
    <Pressable
      key={governor.id}
      style={({ pressed }) => [
        styles.governorCard,
        pressed && styles.governorCardPressed,
      ]}
      onPress={() => openGovernor(governor.id)}
    >
      <View style={styles.governorTop}>
        {governor.image_url ? (
          <Image
            source={{ uri: governor.image_url }}
            style={styles.portrait}
          />
        ) : (
          <View style={styles.portraitPlaceholder}>
            <Ionicons name="person" size={32} color="#00875A" />
          </View>
        )}

        <View style={styles.governorInfo}>
          <Text style={styles.governorName}>
            {governor.full_name}
          </Text>

          <Text style={styles.officialTitle}>
            {governor.official_title}
          </Text>

          <Text style={styles.adminType}>
            {administrationLabel(governor.administration_type)}
          </Text>

          {governor.political_party ? (
            <Text style={styles.party}>
              {governor.political_party}
            </Text>
          ) : null}
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#8A9A91"
        />
      </View>

      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={16} color="#00875A" />
        <Text style={styles.dateText}>
          {formatDate(governor.start_date)} —{" "}
          {governor.is_current
            ? "Present"
            : formatDate(governor.end_date)}
        </Text>
      </View>

      {governor.is_current && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>
            Current administration
          </Text>
        </View>
      )}

      {governor.biography ? (
        <Text style={styles.biography} numberOfLines={3}>
          {governor.biography}
        </Text>
      ) : null}

      {governor.notable_developments ? (
        <View style={styles.developmentsBox}>
          <Text style={styles.developmentsTitle}>
            Notable developments
          </Text>
          <Text style={styles.biography} numberOfLines={3}>
            {governor.notable_developments}
          </Text>
        </View>
      ) : null}

      <Text style={styles.viewProfile}>
        View full profile
        <Ionicons name="arrow-forward" size={13} color="#00875A" />
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadGovernors();
            }}
            tintColor="#00875A"
          />
        }
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#123D2C" />
          <Text style={styles.backText}>
            Government & Leadership
          </Text>
        </Pressable>

        <Text style={styles.heading}>
          Anambra Governors History
        </Text>

        <Text style={styles.subtitle}>
          Explore the military administrators and elected governors
          who have led Anambra State since its creation in 1991.
        </Text>

        <View style={styles.infoBanner}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#087B55"
          />
          <Text style={styles.infoText}>
            Explore verified historical records of Anambra State's
            leadership. Records are displayed after publication.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#718078"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search governors..."
            placeholderTextColor="#89958E"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={19}
                color="#89958E"
              />
            </Pressable>
          )}
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#00875A"
            style={styles.loader}
          />
        ) : filteredGovernors.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="time-outline"
              size={42}
              color="#8A9A91"
            />

            <Text style={styles.emptyTitle}>
              {search ? "No matching records" : "History coming soon"}
            </Text>

            <Text style={styles.emptyText}>
              {search
                ? "Try another governor name or search term."
                : "Verified Anambra governors' historical records will appear here once published."}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.recordCount}>
              {filteredGovernors.length} historical record
              {filteredGovernors.length === 1 ? "" : "s"}
            </Text>

            {filteredGovernors.map(renderGovernor)}
          </>
        )}

        <Text style={styles.footer}>
          AnambraFix · Preserving Anambra State's leadership history.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F6",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: "#123D2C",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#66756D",
    marginTop: 8,
    marginBottom: 18,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 13,
    backgroundColor: "#E8F5EE",
    marginBottom: 18,
  },
  infoText: {
    flex: 1,
    color: "#37624D",
    fontSize: 12,
    lineHeight: 19,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EDE8",
    borderRadius: 13,
    paddingHorizontal: 13,
    marginBottom: 17,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 9,
    color: "#183D2E",
    fontSize: 14,
  },
  loader: {
    marginTop: 45,
  },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 27,
    alignItems: "center",
    marginTop: 8,
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
  recordCount: {
    color: "#718078",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
  },
  governorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5EDE8",
  },
  governorCardPressed: {
    opacity: 0.75,
  },
  governorTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  portrait: {
    width: 83,
    height: 95,
    borderRadius: 12,
    backgroundColor: "#E8F5EE",
  },
  portraitPlaceholder: {
    width: 83,
    height: 95,
    borderRadius: 12,
    backgroundColor: "#E8F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  governorInfo: {
    flex: 1,
  },
  governorName: {
    color: "#183D2E",
    fontSize: 16,
    fontWeight: "800",
  },
  officialTitle: {
    color: "#52665B",
    fontSize: 12,
    marginTop: 5,
  },
  adminType: {
    color: "#00875A",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 7,
  },
  party: {
    color: "#718078",
    fontSize: 11,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 15,
  },
  dateText: {
    color: "#52665B",
    fontSize: 12,
    fontWeight: "600",
  },
  currentBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5EE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  currentBadgeText: {
    color: "#087B55",
    fontSize: 11,
    fontWeight: "800",
  },
  biography: {
    color: "#66756D",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 13,
  },
  developmentsBox: {
    backgroundColor: "#F5F8F6",
    padding: 12,
    borderRadius: 11,
    marginTop: 13,
  },
  developmentsTitle: {
    color: "#183D2E",
    fontSize: 12,
    fontWeight: "800",
  },
  viewProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    color: "#00875A",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 14,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#849189",
    marginTop: 22,
    lineHeight: 18,
  },
});
