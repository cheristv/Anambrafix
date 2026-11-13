
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import colors from "../constants/colors";

const NATIONAL_EMERGENCY_NUMBER = "112";

export default function EmergencyScreen() {
  const router = useRouter();
  const [sharingLocation, setSharingLocation] = useState(false);
  const [callingEmergency, setCallingEmergency] = useState(false);

  const callNumber = async (number: string) => {
    if (!number.trim()) {
      Alert.alert(
        "Number unavailable",
        "This emergency contact has not been configured."
      );
      return;
    }

    try {
      await Linking.openURL(`tel:${number}`);
    } catch {
      Alert.alert(
        "Unable to open phone",
        "Your device could not open the phone dialer. Please use your phone's dialler directly."
      );
    }
  };

  const callEmergencyServices = async () => {
    setCallingEmergency(true);

    try {
      await callNumber(NATIONAL_EMERGENCY_NUMBER);
    } finally {
      setCallingEmergency(false);
    }
  };

  const shareMyLocation = async () => {
    if (sharingLocation) return;

    setSharingLocation(true);

    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Allow location access in your phone settings before sharing your current location."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      await Share.share({
        title: "My current location",
        message: `I am sharing my current location with you:\n${mapUrl}`,
      });
    } catch (error) {
      console.error("Location sharing failed:", error);

      Alert.alert(
        "Location unavailable",
        "We could not retrieve your location. Check your location settings and try again."
      );
    } finally {
      setSharingLocation(false);
    }
  };

  const openScreen = (path: "/hospitals" | "/security-towns") => {
    router.push(path);
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={colors.text}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Emergency</Text>
            <Text style={styles.headerSubtitle}>
              Help and important contacts
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color={colors.primary}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons
                name="shield-checkmark"
                size={30}
                color={colors.white}
              />
            </View>

            <Text style={styles.introTitle}>
              Help when you need it
            </Text>

            <Text style={styles.introDescription}>
              Find healthcare facilities, access emergency contacts,
              and share your current location when assistance is needed.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Emergency contact
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.emergencyCard,
              pressed && styles.cardPressed,
            ]}
            onPress={callEmergencyServices}
            disabled={callingEmergency}
            accessibilityRole="button"
            accessibilityLabel="Call national emergency number 112"
          >
            <View style={styles.emergencyIcon}>
              <Ionicons
                name="call"
                size={25}
                color="#C62828"
              />
            </View>

            <View style={styles.serviceText}>
              <Text style={styles.emergencyTitle}>
                National Emergency Number
              </Text>

              <Text style={styles.emergencyDescription}>
                Call 112 for emergency assistance in Nigeria.
              </Text>

              <Text style={styles.emergencyNumber}>
                112
              </Text>
            </View>

            {callingEmergency ? (
              <ActivityIndicator color="#C62828" />
            ) : (
              <Ionicons
                name="call-outline"
                size={23}
                color="#C62828"
              />
            )}
          </Pressable>

          <Text style={styles.sectionTitle}>
            Emergency services
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.serviceCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => openScreen("/hospitals")}
            accessibilityRole="button"
          >
            <View style={[styles.serviceIcon, styles.hospitalIcon]}>
              <Ionicons
                name="medkit-outline"
                size={25}
                color={colors.primary}
              />
            </View>

            <View style={styles.serviceText}>
              <Text style={styles.serviceTitle}>Hospitals</Text>
              <Text style={styles.serviceDescription}>
                Find hospitals and healthcare facilities.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.serviceCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => openScreen("/security-towns")}
            accessibilityRole="button"
          >
            <View style={[styles.serviceIcon, styles.securityIcon]}>
              <Ionicons
                name="shield-outline"
                size={25}
                color="#B7791F"
              />
            </View>

            <View style={styles.serviceText}>
              <Text style={styles.serviceTitle}>
                Local Security Contacts
              </Text>
              <Text style={styles.serviceDescription}>
                Choose your town to find available security contacts.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>

          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Ionicons
                name="location"
                size={25}
                color={colors.primary}
              />
            </View>

            <Text style={styles.locationTitle}>
              Share your location
            </Text>

            <Text style={styles.locationDescription}>
              Retrieve your current location and share a Google Maps
              link with someone you trust.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.locationButton,
                pressed && styles.buttonPressed,
                sharingLocation && styles.disabledButton,
              ]}
              onPress={shareMyLocation}
              disabled={sharingLocation}
              accessibilityRole="button"
            >
              {sharingLocation ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Ionicons
                  name="navigate-outline"
                  size={21}
                  color={colors.white}
                />
              )}

              <Text style={styles.locationButtonText}>
                {sharingLocation
                  ? "Getting your location..."
                  : "Share My Location"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.primary}
            />

            <Text style={styles.noticeText}>
              If you are facing an emergency, contact the appropriate
              emergency service directly. Phone calls depend on your
              device, network coverage, and service availability.
              AnambraFix does not dispatch emergency responders.
            </Text>
          </View>

          <Text style={styles.footer}>
            ANAMBRAFIX · YOUR STATE. YOUR VOICE.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E5F4E9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 35,
  },
  introCard: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 20,
    marginBottom: 25,
  },
  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  introTitle: {
    color: colors.white,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 8,
  },
  introDescription: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.95,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 3,
  },
  emergencyCard: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#F2CACA",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  emergencyIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#FFE0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyTitle: {
    color: "#8E2020",
    fontSize: 14,
    fontWeight: "800",
  },
  emergencyDescription: {
    color: "#875454",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  emergencyNumber: {
    color: "#B42318",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 5,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.75,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalIcon: {
    backgroundColor: "#E5F4E9",
  },
  securityIcon: {
    backgroundColor: "#FFF2D8",
  },
  serviceText: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },
  serviceTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  serviceDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  locationCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    marginTop: 12,
  },
  locationIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#E5F4E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },
  locationTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  locationDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 7,
  },
  locationButton: {
    minHeight: 52,
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 10,
  },
  locationButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  disabledButton: {
    opacity: 0.65,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#EAF5EC",
  },
  noticeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 18,
  },
  footer: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 22,
  },
});
