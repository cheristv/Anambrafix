
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useAppTheme } from "../context/ThemeContext";

type Slide = {
  id: string;
  title: string | null;
  image_path: string;
  is_published: boolean;
  sort_order: number;
};

export default function HomepagePicture() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadSlides = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("homepage_slides")
        .select("id, title, image_path, is_published, sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      setSlides(data ?? []);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error loading homepage slides:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlides();

    const channel = supabase
      .channel("homepage-picture-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "homepage_slides",
        },
        () => {
          loadSlides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadSlides]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((previousIndex) => {
        return (previousIndex + 1) % slides.length;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlide = slides[currentIndex];

  const imageUrl = currentSlide
    ? supabase.storage
        .from("homepage-images")
        .getPublicUrl(currentSlide.image_path).data.publicUrl
    : null;

  const heroHeight = Math.min(width * 0.52, 230);

  if (loading) {
    return (
      <View
        style={[
          styles.placeholder,
          {
            height: heroHeight,
            backgroundColor: theme.background,
          },
        ]}
      >
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  if (!currentSlide || !imageUrl) {
    return (
      <View
        style={[
          styles.placeholder,
          {
            height: heroHeight,
            backgroundColor: theme.background,
          },
        ]}
      >
        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
          Welcome to Igbo-Eze North
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: heroHeight }]}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      {!!currentSlide.title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {currentSlide.title}
          </Text>
        </View>
      )}

      {slides.length > 1 && (
        <View style={styles.indicators}>
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E5E7EB",
  },

  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  overlay: {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: "rgba(0,0,0,0.18)",
},

  titleContainer: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  indicators: {
    position: "absolute",
    bottom: 12,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.55)",
  },

  activeIndicator: {
    width: 17,
    backgroundColor: "#FFFFFF",
  },

  placeholder: {
    width: "100%",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
