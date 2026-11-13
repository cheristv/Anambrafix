
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

import { supabase } from "../lib/supabase";
import colors from "../constants/colors";

type LGA = {
  id: string;
  name: string;
};

type ContactType = "police" | "security" | "medical" | "other";

type SecurityContact = {
  id: string;
  town_id: string;
  contact_type: ContactType | string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
};

const getContactLabel = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case "police":
      return "Police";
    case "security":
      return "Security";
    case "medical":
      return "Medical";
    case "other":
      return "Other emergency contact";
    default:
      return "Emergency contact";
  }
};

const getContactIcon = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case "police":
      return "🚔";
    case "security":
      return "🛡️";
    case "medical":
      return "🏥";
    default:
      return "☎️";
  }
};

export default function SecurityTownsScreen() {
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [contacts, setContacts] = useState<SecurityContact[]>([]);
  const [selectedLGA, setSelectedLGA] = useState<LGA | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadLGAs = useCallback(async () => {
    setError("");

    const { data, error: queryError } = await supabase
      .from("towns")
      .select("id, name")
      .eq("is_active", true)
      .eq("state", "Anambra State")
      .order("name", { ascending: true });

    if (queryError) {
      console.error("LGA loading error:", queryError.message);
      setError(queryError.message);
      return;
    }

    setLgas(data ?? []);
  }, []);

  const loadSecurityContacts = useCallback(async (lga: LGA) => {
    setError("");

    const { data, error: queryError } = await supabase
      .from("emergency_contacts")
      .select(
        "id, town_id, contact_type, name, phone, address, description"
      )
      .eq("town_id", lga.id)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Emergency contacts error:", queryError.message);
      setError(queryError.message);
      return;
    }

    setContacts(data ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchLGAs = async () => {
        setLoading(true);
        await loadLGAs();

        if (active) {
          setLoading(false);
        }
      };

      fetchLGAs();

      return () => {
        active = false;
      };
    }, [loadLGAs])
  );

  const chooseLGA = async (lga: LGA) => {
    setSelectedLGA(lga);
    setContacts([]);
    setSearch("");
    setLoading(true);

    await loadSecurityContacts(lga);

    setLoading(false);
  };

  const changeLGA = () => {
    setSelectedLGA(null);
    setContacts([]);
    setSearch("");
    setError("");
  };

  const onRefresh = async () => {
    setRefreshing(true);

    if (selectedLGA) {
      await loadSecurityContacts(selectedLGA);
    } else {
      await loadLGAs();
    }

    setRefreshing(false);
  };

  const filteredLGAs = lgas.filter((lga) =>
    lga.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const filteredContacts = contacts.filter((contact) =>
    [
      contact.name ?? "",
      contact.phone ?? "",
      getContactLabel(contact.contact_type),
      contact.address ?? "",
      contact.description ?? "",
    ].some((value) =>
      value.toLowerCase().includes(search.trim().toLowerCase())
    )
  );

  const callContact = (contact: SecurityContact) => {
    const phone = contact.phone?.trim();

    if (!phone) {
      Alert.alert(
        "Phone number unavailable",
        "A contact number has not been added for this contact."
      );
      return;
    }

    Alert.alert(
      contact.name || getContactLabel(contact.contact_type),
      `Call ${phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call Now",
          onPress: () => {
            Linking.openURL(`tel:${phone}`).catch(() => {
              Alert.alert(
                "Unable to open phone",
                "Please try again on a device that supports phone calls."
              );
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (selectedLGA) {
              changeLGA();
            } else {
              router.back();
            }
          }}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Local Emergency Contacts</Text>
          <Text style={styles.subtitle}>
            {selectedLGA
              ? `Contacts in ${selectedLGA.name} LGA`
              : "Select your LGA to continue"}
          </Text>
        </View>
      </View>

      <View style={styles.intro}>
        <Text style={styles.introIcon}>🛡️</Text>

        <Text style={styles.introTitle}>
          {selectedLGA
            ? `Emergency contacts in ${selectedLGA.name}`
            : "Find local emergency contacts"}
        </Text>

        <Text style={styles.introDescription}>
          {selectedLGA
            ? "View officially published police, security, medical and other emergency contacts for this LGA."
            : "Select your Local Government Area in Anambra State to find its published emergency contacts."}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder={
            selectedLGA
              ? "Search emergency contacts..."
              : "Search for an LGA..."
          }
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.statusText}>
            {selectedLGA
              ? "Loading emergency contacts..."
              : "Loading LGAs..."}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.statusContainer}>
          <Text style={styles.emptyTitle}>Unable to load information</Text>
          <Text style={styles.statusText}>{error}</Text>

          <Pressable style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : !selectedLGA ? (
        <FlatList
          data={filteredLGAs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              Select your LGA ({filteredLGAs.length})
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.townCard}
              onPress={() => chooseLGA(item)}
            >
              <View style={styles.townIcon}>
                <Text style={styles.townIconText}>⌖</Text>
              </View>

              <View style={styles.townDetails}>
                <Text style={styles.townName}>{item.name}</Text>
                <Text style={styles.townDescription}>
                  View published emergency contacts
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No LGAs found</Text>
              <Text style={styles.statusText}>
                Try another LGA name.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            <View style={styles.selectedHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>
                  Published emergency contacts
                </Text>
                <Text style={styles.selectedTownName}>
                  {selectedLGA.name} LGA · {filteredContacts.length} contacts
                </Text>
              </View>

              <Pressable
                style={styles.changeButton}
                onPress={changeLGA}
              >
                <Text style={styles.changeButtonText}>Change LGA</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <Text style={styles.contactIconText}>
                  {getContactIcon(item.contact_type)}
                </Text>
              </View>

              <View style={styles.contactDetails}>
                <Text style={styles.contactType}>
                  {getContactLabel(item.contact_type)}
                </Text>

                <Text style={styles.contactName}>
                  {item.name || getContactLabel(item.contact_type)}
                </Text>

                {item.phone ? (
                  <Text style={styles.contactPhone}>{item.phone}</Text>
                ) : null}

                {item.address ? (
                  <Text style={styles.contactInfo}>
                    Location: {item.address}
                  </Text>
                ) : null}

                {item.description ? (
                  <Text style={styles.contactInfo}>
                    {item.description}
                  </Text>
                ) : null}

                <Pressable
                  style={[
                    styles.callButton,
                    !item.phone && styles.disabledButton,
                  ]}
                  onPress={() => callContact(item)}
                >
                  <Text style={styles.callButtonText}>
                    {item.contact_type?.toLowerCase() === "medical"
                      ? "Call Medical Contact"
                      : "Call Contact"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                No contacts published
              </Text>

              <Text style={styles.statusText}>
                There are currently no published emergency contacts for{" "}
                {selectedLGA.name} LGA. Please check again later.
              </Text>
            </View>
          }
        />
      )}

      <Text style={styles.notice}>
        Only contacts verified and published by the administration are
        displayed. For immediate emergencies, call the national emergency
        number 112.
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
    lineHeight: 19,
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
    marginBottom: 12,
    color: colors.primary,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 18,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  searchIcon: {
    fontSize: 25,
    marginRight: 10,
    color: colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: "100%",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 5,
  },
  townCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 12,
  },
  townIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  townIconText: {
    fontSize: 26,
    color: colors.primary,
  },
  townDetails: {
    flex: 1,
  },
  townName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  townDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  arrow: {
    fontSize: 27,
    color: colors.primary,
  },
  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  selectedTownName: {
    fontSize: 13,
    marginTop: 4,
    color: colors.textSecondary,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  changeButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  contactCard: {
    flexDirection: "row",
    gap: 12,
    padding: 15,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  contactIconText: {
    fontSize: 22,
  },
  contactDetails: {
    flex: 1,
  },
  contactType: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "capitalize",
  },
  contactName: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 5,
    color: colors.text,
  },
  contactPhone: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    color: colors.text,
  },
  contactInfo: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    color: colors.textSecondary,
  },
  callButton: {
    alignSelf: "flex-start",
    marginTop: 13,
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  callButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
  empty: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 35,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
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
