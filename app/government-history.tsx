
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

type HistoryChapter = {
  id: string;
  title: string;
  introduction: string | null;
  content: string;
  photograph_urls: string[] | null;
  display_order: number;
};

export default function GovernmentHistoryScreen() {
  const router = useRouter();

  const [chapters, setChapters] = useState<HistoryChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchChapters = useCallback(async () => {
    setError("");

    const { data, error: fetchError } = await supabase
      .from("government_history_chapters")
      .select(
        "id, title, introduction, content, photograph_urls, display_order"
      )
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setChapters((data ?? []) as HistoryChapter[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        await fetchChapters();

        if (active) {
          setLoading(false);
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [fetchChapters])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChapters();
    setRefreshing(false);
  };

  const openChapter = (id: string) => {
    router.push({
      pathname: "/government-history-details",
      params: { id },
    });
  };

  const renderChapter = ({
    item,
    index,
  }: {
    item: HistoryChapter;
    index: number;
  }) => {
    const coverImage = item.photograph_urls?.[0];

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => openChapter(item.id)}
      >
        {coverImage ? (
          <Image
            source={{ uri: coverImage }}
            style={styles.chapterImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="book-outline" size={36} color="#16834A" />
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.chapterNumber}>
            CHAPTER {index + 1}
          </Text>

          <Text style={styles.chapterTitle}>{item.title}</Text>

          <Text style={styles.introduction} numberOfLines={3}>
            {item.introduction?.trim() ||
              "Explore this chapter of Anambra State's history."}
          </Text>

          <View style={styles.readMoreRow}>
            <Text style={styles.readMore}>Read full chapter</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color="#16834A"
            />
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16834A" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={23} color="#173B2A" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            History of Anambra State
          </Text>
          <Text style={styles.headerSubtitle}>
            Discover our heritage and history
          </Text>
        </View>
      </View>

      <View style={styles.introBanner}>
        <Ionicons name="library-outline" size={27} color="#FFFFFF" />

        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Our Heritage</Text>
          <Text style={styles.bannerSubtitle}>
            Explore the history, people and heritage of Anambra State.
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color="#D64545"
          />

          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.retryButton}
            onPress={async () => {
              setLoading(true);
              await fetchChapters();
              setLoading(false);
            }}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={chapters}
          keyExtractor={(item) => item.id}
          renderItem={renderChapter}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#16834A"
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="book-outline"
                size={50}
                color="#9AA99F"
              />

              <Text style={styles.emptyTitle}>
                No history chapters yet
              </Text>

              <Text style={styles.emptyText}>
                Published Anambra State history chapters will appear here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EAF4ED",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#173B2A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#75847A",
    marginTop: 4,
  },
  introBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16834A",
    margin: 18,
    padding: 18,
    borderRadius: 17,
    gap: 13,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  bannerSubtitle: {
    fontSize: 12,
    lineHeight: 19,
    color: "#E7F5EB",
    marginTop: 5,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 35,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.88,
  },
  chapterImage: {
    width: "100%",
    height: 175,
    backgroundColor: "#EAF4ED",
  },
  imagePlaceholder: {
    width: "100%",
    height: 125,
    backgroundColor: "#EAF4ED",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    padding: 17,
  },
  chapterNumber: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16834A",
    letterSpacing: 1,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#173B2A",
    marginTop: 8,
  },
  introduction: {
    fontSize: 13,
    color: "#68786D",
    lineHeight: 21,
    marginTop: 8,
  },
  readMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 15,
  },
  readMore: {
    color: "#16834A",
    fontSize: 13,
    fontWeight: "800",
  },
  center: {
    flex: 1,
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
  retryButton: {
    backgroundColor: "#16834A",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 15,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyTitle: {
    color: "#173B2A",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 14,
  },
  emptyText: {
    color: "#75847A",
    textAlign: "center",
    marginTop: 7,
  },
});
