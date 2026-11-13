
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

type Chairman = {
  id: string;
  lga_name: string;
  full_name: string;
  political_party: string | null;
  start_date: string | null;
  end_date: string | null;
  biography: string | null;
  image_url: string | null;
  is_current: boolean;
  is_published: boolean;
  display_order: number;
};

const LGAS = [
  "All LGAs",
  "Aguata",
  "Anambra East",
  "Anambra West",
  "Anaocha",
  "Awka North",
  "Awka South",
  "Ayamelum",
  "Dunukofia",
  "Ekwusigo",
  "Idemili North",
  "Idemili South",
  "Ihiala",
  "Njikoka",
  "Nnewi North",
  "Nnewi South",
  "Ogbaru",
  "Onitsha North",
  "Onitsha South",
  "Orumba North",
  "Orumba South",
  "Oyi",
];

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

export default function GovernmentChairmenScreen() {
  const router = useRouter();

  const [chairmen, setChairmen] = useState<Chairman[]>([]);
  const [selectedLga, setSelectedLga] = useState("All LGAs");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChairmen = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("local_government_chairmen")
        .select(
          "id,lga_name,full_name,political_party,start_date,end_date,biography,image_url,is_current,is_published,display_order"
        )
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("start_date", { ascending: true });

      if (error) throw error;

      setChairmen((data ?? []) as Chairman[]);
    } catch (error: any) {
      console.error("Chairmen loading error:", error);

      Alert.alert(
        "Unable to load chairmen",
        error.message ?? "Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadChairmen();
  }, [loadChairmen]);

  const filteredChairmen = useMemo(() => {
    return chairmen.filter((chairman) => {
      const matchesLga =
        selectedLga === "All LGAs" ||
        chairman.lga_name.toLowerCase() === selectedLga.toLowerCase();

      const matchesSearch =
        `${chairman.full_name} ${chairman.lga_name} ${
          chairman.political_party ?? ""
        }`
          .toLowerCase()
          .includes(search.trim().toLowerCase());

      return matchesLga && matchesSearch;
    });
  }, [chairmen, selectedLga, search]);

  const renderChairman = (chairman: Chairman) => (
    <Pressable
      key={chairman.id}
      style={({ pressed }) => [
        styles.chairmanCard,
        pressed && styles.chairmanCardPressed,
      ]}
      onPress={() =>
        router.push({
          pathname: "/government-chairmen-details",
          params: { id: chairman.id },
        })
      }
    >
      <View style={styles.chairmanTop}>
        {chairman.image_url ? (
          <Image
            source={{ uri: chairman.image_url }}
            style={styles.portrait}
          />
        ) : (
          <View style={styles.portraitPlaceholder}>
            <Ionicons name="person" size={32} color="#00875A" />
          </View>
        )}

        <View style={styles.chairmanInfo}>
          <Text style={styles.chairmanName}>
            {chairman.full_name}
          </Text>

          <Text style={styles.lgaName}>
            {chairman.lga_name} Local Government Area
          </Text>

          {chairman.political_party ? (
            <Text style={styles.party}>
              {chairman.political_party}
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
          {formatDate(chairman.start_date)} —{" "}
          {chairman.is_current
            ? "Present"
            : formatDate(chairman.end_date)}
        </Text>
      </View>

      {chairman.is_current && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>
            Current chairman
          </Text>
        </View>
      )}

      {chairman.biography ? (
        <Text style={styles.biography} numberOfLines={3}>
          {chairman.biography}
        </Text>
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
              loadChairmen();
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
          Local Government Chairmen
        </Text>

        <Text style={styles.subtitle}>
          Discover the chairmen who have served across Anambra
          State's 21 Local Government Areas.
        </Text>

        <View style={styles.infoBanner}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#087B55"
          />
          <Text style={styles.infoText}>
            Browse published chairman records by Local Government
            Area. Historical information appears as it is verified
            and published.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>
          SELECT LOCAL GOVERNMENT
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.lgaList}
        >
          {LGAS.map((lga) => {
            const active = selectedLga === lga;

            return (
              <Pressable
                key={lga}
                onPress={() => setSelectedLga(lga)}
                style={[
                  styles.lgaChip,
                  active && styles.lgaChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.lgaChipText,
                    active && styles.lgaChipTextActive,
                  ]}
                >
                  {lga}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#718078"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search chairman or LGA..."
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
        ) : filteredChairmen.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="people-outline"
              size={42}
              color="#8A9A91"
            />

            <Text style={styles.emptyTitle}>
              {search
                ? "No matching records"
                : "Records coming soon"}
            </Text>

            <Text style={styles.emptyText}>
              {search
                ? "Try another name or Local Government Area."
                : "Published chairman records for this selection will appear here when available."}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.recordCount}>
              {filteredChairmen.length} chairman record
              {filteredChairmen.length === 1 ? "" : "s"}
            </Text>

            {filteredChairmen.map(renderChairman)}
          </>
        )}

        <Text style={styles.footer}>
          AnambraFix · Local Government Leadership.
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
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    color: "#37624D",
    fontSize: 12,
    lineHeight: 19,
  },
  sectionLabel: {
    color: "#52665B",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 11,
  },
  lgaList: {
    gap: 8,
    paddingBottom: 16,
  },
  lgaChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE8E1",
  },
  lgaChipActive: {
    backgroundColor: "#00875A",
    borderColor: "#00875A",
  },
  lgaChipText: {
    color: "#52665B",
    fontSize: 12,
    fontWeight: "700",
  },
  lgaChipTextActive: {
    color: "#FFFFFF",
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
  chairmanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5EDE8",
  },
  chairmanCardPressed: {
    opacity: 0.75,
  },
  chairmanTop: {
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
  chairmanInfo: {
    flex: 1,
  },
  chairmanName: {
    color: "#183D2E",
    fontSize: 16,
    fontWeight: "800",
  },
  lgaName: {
    color: "#52665B",
    fontSize: 12,
    marginTop: 5,
  },
  party: {
    color: "#718078",
    fontSize: 11,
    marginTop: 7,
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
