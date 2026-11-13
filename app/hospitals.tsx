
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import colors from "../constants/colors";
import { supabase } from "../lib/supabase";

type Hospital = {
  id: string;
  name: string;
  town_id: string | null;
  address: string | null;
  phone: string | null;
  facility_type: string | null;
  description: string | null;
  operating_hours: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function HospitalsScreen() {
  const [search, setSearch] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  // FETCH ACTIVE HOSPITALS FROM SUPABASE
  const loadHospitals = useCallback(async () => {
    const { data, error } = await supabase
      .from("hospitals")
      .select(
        "id, name, town_id, address, phone, facility_type, description, operating_hours, latitude, longitude"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Hospital loading error:", error.message);
      setLoadError(error.message);
      return;
    }

    setHospitals(data ?? []);
    setLoadError("");
  }, []);

  // LOAD WHEN SCREEN OPENS OR CITIZEN RETURNS TO IT
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchData = async () => {
        setLoading(true);
        await loadHospitals();

        if (active) {
          setLoading(false);
        }
      };

      fetchData();

      return () => {
        active = false;
      };
    }, [loadHospitals])
  );

  // PULL DOWN TO REFRESH
  const onRefresh = async () => {
    setRefreshing(true);
    await loadHospitals();
    setRefreshing(false);
  };

  // SEARCH HOSPITALS
  const filteredHospitals = hospitals.filter((hospital) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      hospital.name,
      hospital.address ?? "",
      hospital.facility_type ?? "",
      hospital.description ?? "",
      hospital.operating_hours ?? "",
    ].some((value) => value.toLowerCase().includes(query));
  });

  // OPEN GOOGLE MAPS
  const openDirections = async (hospital: Hospital) => {
    let url: string;

    if (
      hospital.latitude !== null &&
      hospital.longitude !== null
    ) {
      url = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;
    } else if (hospital.address) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        hospital.address
      )}`;
    } else {
      Alert.alert(
        "Location unavailable",
        "An address or map location has not been added for this hospital."
      );
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open Maps",
        "Please try again."
      );
    }
  };

  // CALL HOSPITAL
  const callHospital = async (hospital: Hospital) => {
    if (!hospital.phone) {
      Alert.alert(
        "Phone number unavailable",
        "A verified contact number has not been added for this facility."
      );
      return;
    }

    try {
      await Linking.openURL(`tel:${hospital.phone}`);
    } catch {
      Alert.alert(
        "Unable to open phone",
        "Please try again."
      );
    }
  };

  const renderHospital = ({ item }: { item: Hospital }) => (
    <View style={styles.card}>
      <View style={styles.hospitalIcon}>
        <Text style={styles.plus}>✚</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.hospitalName}>
          {item.name}
        </Text>

        <Text style={styles.type}>
          {item.facility_type || "Healthcare facility"}
        </Text>

        {item.address ? (
          <Text style={styles.community}>
            Location: {item.address}
          </Text>
        ) : null}

        {item.description ? (
          <Text style={styles.description}>
            {item.description}
          </Text>
        ) : null}

        {item.operating_hours ? (
          <Text style={styles.hours}>
            Hours: {item.operating_hours}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => openDirections(item)}
          >
            <Text style={styles.primaryButtonText}>
              Directions ↗
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => callHospital(item)}
          >
            <Text style={styles.secondaryButtonText}>
              Call
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Find a Hospital
          </Text>

          <Text style={styles.subtitle}>
            Healthcare in Igbo-Eze North
          </Text>
        </View>
      </View>

      {/* INTRO */}
      <View style={styles.intro}>
        <Text style={styles.introIcon}>✚</Text>

        <Text style={styles.introTitle}>
          Healthcare near you
        </Text>

        <Text style={styles.introDescription}>
          Find health centres and hospitals by name or address.
        </Text>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search hospital or community..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {/* SECTION TITLE */}
      <Text style={styles.sectionTitle}>
        Healthcare facilities ({filteredHospitals.length})
      </Text>

      {/* HOSPITAL LIST */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Loading healthcare facilities...
          </Text>
        </View>
      ) : loadError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            Unable to load hospitals
          </Text>

          <Text style={styles.emptyText}>
            {loadError}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={onRefresh}
          >
            <Text style={styles.retryButtonText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredHospitals}
          keyExtractor={(item) => item.id}
          renderItem={renderHospital}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {search
                  ? "No facilities found"
                  : "No hospitals available yet"}
              </Text>

              <Text style={styles.emptyText}>
                {search
                  ? "Try searching with another name or address."
                  : "Published healthcare facilities will appear here when added by the administrator."}
              </Text>
            </View>
          }
        />
      )}

      {/* NOTICE */}
      <Text style={styles.notice}>
        Hospital information is provided by the local administration.
        Confirm details before travelling.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 13,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 32,
    lineHeight: 36,
    color: colors.text,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    fontSize: 13,
    marginTop: 4,
    color: colors.textSecondary,
  },

  intro: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  introIcon: {
    fontSize: 30,
    color: colors.primary,
    marginBottom: 12,
  },

  introTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
  },

  introDescription: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    height: 52,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },

  searchIcon: {
    fontSize: 25,
    color: colors.textSecondary,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 23,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexGrow: 1,
  },

  card: {
    flexDirection: "row",
    gap: 13,
    padding: 15,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  hospitalIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  plus: {
    fontSize: 24,
    color: colors.primary,
  },

  details: {
    flex: 1,
  },

  hospitalName: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: colors.text,
  },

  type: {
    marginTop: 5,
    fontSize: 12,
    color: colors.primary,
  },

  community: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  description: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  hours: {
    marginTop: 7,
    fontSize: 12,
    color: colors.textSecondary,
  },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 13,
  },

  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },

  secondaryButton: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  empty: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 35,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },

  retryButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },

  notice: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    color: colors.textSecondary,
  },
});
