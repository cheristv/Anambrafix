
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

type HistoryChapter = {
  id: string;
  title: string;
  introduction: string | null;
  content: string;
  photograph_urls: string[] | null;
  display_order: number;
};

export default function GovernmentHistoryDetailsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [chapter, setChapter] = useState<HistoryChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchChapter = async () => {
      setLoading(true);
      setError("");
      setChapter(null);

      if (!id) {
        setError("History chapter could not be identified.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("government_history_chapters")
        .select(
          "id, title, introduction, content, photograph_urls, display_order"
        )
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
      } else if (!data) {
        setError("This history chapter is currently unavailable.");
      } else {
        setChapter(data as HistoryChapter);
      }

      setLoading(false);
    };

    fetchChapter();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16834A" />
        <Text style={styles.loadingText}>
          Loading history chapter...
        </Text>
      </View>
    );
  }

  if (error || !chapter) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color="#D64545"
        />

        <Text style={styles.errorText}>
          {error || "History chapter not found."}
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/government-history")}
        >
          <Text style={styles.backButtonText}>
            Back to history
          </Text>
        </Pressable>
      </View>
    );
  }

  const photographs = (chapter.photograph_urls ?? []).filter(
    (url) => typeof url === "string" && url.trim().length > 0
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
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

          <Text style={styles.headerTitle}>
            Anambra State History
          </Text>
        </View>

        {photographs.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.gallery}
            >
              {photographs.map((url, index) => (
                <Image
                  key={`${url}-${index}`}
                  source={{ uri: url }}
                  style={[
                    styles.heroImage,
                    { width },
                  ]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {photographs.length > 1 && (
              <View style={styles.photoCount}>
                <Ionicons
                  name="images-outline"
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.photoCountText}>
                  {photographs.length} photographs
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="library-outline"
              size={60}
              color="#16834A"
            />
            <Text style={styles.placeholderText}>
              Anambra State Heritage
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            HISTORY OF ANAMBRA STATE
          </Text>

          <Text style={styles.title}>
            {chapter.title}
          </Text>

          {chapter.introduction?.trim() ? (
            <View style={styles.introductionCard}>
              <Text style={styles.introductionLabel}>
                INTRODUCTION
              </Text>

              <Text style={styles.introductionText}>
                {chapter.introduction}
              </Text>
            </View>
          ) : null}

          <View style={styles.historyCard}>
            <Text style={styles.sectionTitle}>
              The Story
            </Text>

            <Text style={styles.historyText}>
              {chapter.content}
            </Text>
          </View>

          {photographs.length > 0 && (
            <View style={styles.gallerySection}>
              <Text style={styles.sectionTitle}>
                Historical Photographs
              </Text>

              <View style={styles.photoGrid}>
                {photographs.map((url, index) => (
                  <Image
                    key={`${url}-grid-${index}`}
                    source={{ uri: url }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <Ionicons
              name="leaf-outline"
              size={20}
              color="#16834A"
            />

            <Text style={styles.footerText}>
              Preserving our heritage for future generations.
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#173B2A",
  },
  gallery: {
    width: "100%",
    height: 240,
  },
  heroImage: {
    height: 240,
    backgroundColor: "#EAF4ED",
  },
  photoCount: {
    position: "absolute",
    right: 15,
    bottom: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: "#E4F2E8",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  placeholderText: {
    color: "#16834A",
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16834A",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#173B2A",
    lineHeight: 33,
    marginTop: 9,
    marginBottom: 18,
  },
  introductionCard: {
    backgroundColor: "#EAF4ED",
    padding: 17,
    borderRadius: 15,
    marginBottom: 17,
  },
  introductionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16834A",
    letterSpacing: 1,
    marginBottom: 9,
  },
  introductionText: {
    fontSize: 14,
    color: "#345342",
    lineHeight: 23,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    padding: 19,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#173B2A",
    marginBottom: 13,
  },
  historyText: {
    fontSize: 14,
    color: "#59685E",
    lineHeight: 26,
  },
  gallerySection: {
    marginTop: 22,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  galleryImage: {
    width: "48%",
    height: 135,
    borderRadius: 12,
    backgroundColor: "#EAF4ED",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 25,
    padding: 15,
  },
  footerText: {
    color: "#68786D",
    fontSize: 12,
    fontWeight: "600",
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
