
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  display_order: number;
};

export default function GovernmentChairmanDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [chairman, setChairman] = useState<Chairman | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchChairman = async () => {
      if (!id) {
        setError("Chairman information could not be identified.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("local_government_chairmen")
        .select(
          "id, lga_name, full_name, political_party, start_date, end_date, biography, image_url, is_current, display_order"
        )
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setError(error.message);
        setChairman(null);
      } else if (!data) {
        setError("This chairman's profile is currently unavailable.");
        setChairman(null);
      } else {
        setChairman(data);
      }

      setLoading(false);
    };

    fetchChairman();

    return () => {
      active = false;
    };
  }, [id]);

  const formatDate = (date: string | null) => {
    if (!date) return null;

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16834A" />
        <Text style={styles.loadingText}>
          Loading chairman's profile...
        </Text>
      </View>
    );
  }

  if (error || !chairman) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color="#D64545"
        />

        <Text style={styles.errorText}>
          {error || "Chairman profile not found."}
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backIcon}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#173B2A"
            />
          </Pressable>

          <Text style={styles.topBarTitle}>
            Chairman's Profile
          </Text>
        </View>

        <View style={styles.profileSection}>
          {chairman.image_url ? (
            <Image
              source={{ uri: chairman.image_url }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons
                name="person"
                size={65}
                color="#16834A"
              />
            </View>
          )}

          <Text style={styles.name}>
            {chairman.full_name}
          </Text>

          <Text style={styles.position}>
            Local Government Chairman
          </Text>

          <View style={styles.lgaBadge}>
            <Ionicons
              name="location-outline"
              size={14}
              color="#16834A"
            />
            <Text style={styles.lgaText}>
              {chairman.lga_name} LGA
            </Text>
          </View>

          {chairman.is_current && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentText}>
                CURRENT CHAIRMAN
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.yearCard}>
            <View style={styles.yearIcon}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color="#16834A"
              />
            </View>

            <View style={styles.tenureContent}>
              <Text style={styles.sectionLabel}>
                TENURE
              </Text>

              <Text style={styles.yearText}>
                {formatDate(chairman.start_date) || "Not provided"}
                {" - "}
                {chairman.is_current
                  ? "Present"
                  : formatDate(chairman.end_date) || "Not provided"}
              </Text>
            </View>
          </View>

          {chairman.political_party ? (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                Political Party
              </Text>

              <Text style={styles.bodyText}>
                {chairman.political_party}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>
              Biography
            </Text>

            <Text style={styles.bodyText}>
              {chairman.biography?.trim() ||
                "Biography information has not been added yet."}
            </Text>
          </View>

          <View style={styles.footer}>
            <Ionicons
              name="leaf-outline"
              size={20}
              color="#16834A"
            />

            <Text style={styles.footerText}>
              Preserving Anambra's leadership history for future generations.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    gap: 14,
  },
  backIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EAF4ED",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#173B2A",
  },
  profileSection: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 28,
  },
  photo: {
    width: 155,
    height: 170,
    borderRadius: 20,
    backgroundColor: "#EAF4ED",
  },
  photoPlaceholder: {
    width: 155,
    height: 170,
    borderRadius: 20,
    backgroundColor: "#EAF4ED",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 23,
    fontWeight: "900",
    color: "#173B2A",
    textAlign: "center",
    marginTop: 18,
  },
  position: {
    fontSize: 14,
    color: "#75847A",
    marginTop: 7,
  },
  lgaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF4ED",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 9,
    gap: 5,
    marginTop: 13,
  },
  lgaText: {
    color: "#16834A",
    fontSize: 12,
    fontWeight: "800",
  },
  currentBadge: {
    backgroundColor: "#E4F4E9",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 12,
  },
  currentText: {
    color: "#16834A",
    fontSize: 10,
    fontWeight: "800",
  },
  content: {
    padding: 18,
    gap: 15,
  },
  yearCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    gap: 13,
  },
  yearIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#EAF4ED",
    alignItems: "center",
    justifyContent: "center",
  },
  tenureContent: {
    flex: 1,
  },
  sectionLabel: {
    color: "#75847A",
    fontSize: 10,
    fontWeight: "800",
  },
  yearText: {
    color: "#173B2A",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 19,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#173B2A",
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 23,
    color: "#59685E",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    padding: 15,
  },
  footerText: {
    flex: 1,
    color: "#68786D",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  center: {
    flex: 1,
    backgroundColor: "#F5F8F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  loadingText: {
    color: "#68786D",
    marginTop: 12,
  },
  errorText: {
    color: "#D64545",
    textAlign: "center",
    marginTop: 12,
  },
  backButton: {
    backgroundColor: "#16834A",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
