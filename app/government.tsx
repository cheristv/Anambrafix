
import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const governmentSections = [
  {
    title: "Anambra Governors History",
    description:
      "Explore the military administrators and elected governors who have led Anambra State since 1991.",
    icon: "business-outline" as const,
    route: "/government-governors" as const,
    number: "01",
    category: "STATE LEADERSHIP",
  },
  {
    title: "Local Government Chairmen",
    description:
      "Discover the chairmen and leadership history of Anambra State's 21 Local Government Areas.",
    icon: "people-outline" as const,
    route: "/government-chairmen" as const,
    number: "02",
    category: "LOCAL GOVERNMENT",
  },
  {
    title: "History of Anambra State",
    description:
      "Discover the origins, heritage, important events and development of Anambra State.",
    icon: "book-outline" as const,
    route: "/government-history" as const,
    number: "03",
    category: "OUR HERITAGE",
  },
];

export default function GovernmentScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back navigation */}
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backPressed,
          ]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
        >
          <View style={styles.backIcon}>
            <Ionicons name="arrow-back" size={19} color="#087A52" />
          </View>
          <Text style={styles.backText}>Back to Home</Text>
        </Pressable>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroDecorationOne} />
          <View style={styles.heroDecorationTwo} />

          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="shield-checkmark"
                size={29}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.officialTag}>
              <View style={styles.officialDot} />
              <Text style={styles.officialText}>ANAMBRA STATE</Text>
            </View>
          </View>

          <Text style={styles.heroEyebrow}>
            GOVERNMENT & PUBLIC INFORMATION
          </Text>

          <Text style={styles.heroTitle}>
            Government{"\n"}& Leadership
          </Text>

          <Text style={styles.heroDescription}>
            Discover the people, leadership and history that have shaped
            Anambra State.
          </Text>

          <View style={styles.heroDivider} />

          <View style={styles.heroFooter}>
            <Ionicons
              name="location-outline"
              size={16}
              color="#C5E7D5"
            />
            <Text style={styles.heroFooterText}>
              ANAMBRA STATE, NIGERIA
            </Text>
          </View>
        </View>

        {/* Section heading */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>DISCOVER ANAMBRA</Text>
            <Text style={styles.sectionTitle}>Explore Government</Text>
            <Text style={styles.sectionSubtitle}>
              Choose an area to explore
            </Text>
          </View>

          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountNumber}>03</Text>
            <Text style={styles.sectionCountLabel}>SECTIONS</Text>
          </View>
        </View>

        {/* Government cards */}
        {governmentSections.map((section) => (
          <Pressable
            key={section.number}
            accessibilityRole="button"
            accessibilityLabel={`Open ${section.title}`}
            android_ripple={{ color: "#E5F3EA" }}
            style={({ pressed }) => [
              styles.sectionCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push(section.route)}
          >
            <View style={styles.cardAccent} />

            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <View style={styles.cardIconOuter}>
                  <View style={styles.cardIcon}>
                    <Ionicons
                      name={section.icon}
                      size={27}
                      color="#087A52"
                    />
                  </View>
                </View>

                <View style={styles.cardNumberBadge}>
                  <Text style={styles.cardNumber}>{section.number}</Text>
                </View>
              </View>

              <Text style={styles.cardCategory}>{section.category}</Text>

              <Text style={styles.cardTitle}>{section.title}</Text>

              <Text style={styles.cardDescription}>
                {section.description}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.exploreLabel}>
                  <Text style={styles.exploreText}>Explore section</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color="#087A52"
                  />
                </View>

                <View style={styles.arrowCircle}>
                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </View>
              </View>
            </View>
          </Pressable>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <View style={styles.footerBrand}>
            <Ionicons
              name="leaf-outline"
              size={17}
              color="#087A52"
            />
            <Text style={styles.footerTitle}>AnambraFix</Text>
          </View>
          <Text style={styles.footerText}>
            Preserving our history. Understanding our leadership.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7F4",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 9,
    paddingBottom: 45,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
    marginBottom: 20,
    paddingVertical: 5,
    paddingRight: 12,
  },

  backIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    backgroundColor: "#E5F2EA",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: "#174633",
    fontSize: 13,
    fontWeight: "700",
  },

  backPressed: {
    opacity: 0.65,
  },

  hero: {
    backgroundColor: "#103D2C",
    borderRadius: 27,
    padding: 23,
    marginBottom: 31,
    overflow: "hidden",
  },

  heroDecorationOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 30,
    borderColor: "rgba(255,255,255,0.035)",
    right: -75,
    top: -75,
  },

  heroDecorationTwo: {
    position: "absolute",
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: "rgba(0,135,90,0.13)",
    right: 5,
    bottom: -75,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#087D56",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },

  officialTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.09)",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 30,
  },

  officialDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#65D6A2",
  },

  officialText: {
    color: "#D9EEE3",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  heroEyebrow: {
    color: "#91D5B2",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 10,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  heroDescription: {
    color: "#D0E4D9",
    fontSize: 13,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 290,
  },

  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.13)",
    marginTop: 23,
    marginBottom: 16,
  },

  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  heroFooterText: {
    color: "#D3E8DC",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  sectionEyebrow: {
    color: "#087A52",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  sectionTitle: {
    color: "#153D2D",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  sectionSubtitle: {
    color: "#849189",
    fontSize: 12,
    marginTop: 5,
  },

  sectionCount: {
    width: 53,
    height: 53,
    borderRadius: 17,
    backgroundColor: "#E5F2EA",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionCountNumber: {
    color: "#087A52",
    fontSize: 17,
    fontWeight: "900",
  },

  sectionCountLabel: {
    color: "#6C8C7A",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 1,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E6EEE8",
    elevation: 3,
    shadowColor: "#153D2D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.055,
    shadowRadius: 12,
  },

  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
    backgroundColor: "#F8FCF9",
  },

  cardAccent: {
    height: 4,
    backgroundColor: "#087A52",
    width: "100%",
  },

  cardContent: {
    padding: 19,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  cardIconOuter: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#EAF5EE",
    alignItems: "center",
    justifyContent: "center",
  },

  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#D9EFE2",
    alignItems: "center",
    justifyContent: "center",
  },

  cardNumberBadge: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#F3F7F4",
    borderWidth: 1,
    borderColor: "#E8EFEA",
    alignItems: "center",
    justifyContent: "center",
  },

  cardNumber: {
    color: "#8BA194",
    fontSize: 12,
    fontWeight: "900",
  },

  cardCategory: {
    color: "#087A52",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 7,
  },

  cardTitle: {
    color: "#173D2E",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.35,
  },

  cardDescription: {
    color: "#77857D",
    fontSize: 12,
    lineHeight: 20,
    marginTop: 8,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EDF2EE",
    marginTop: 18,
    paddingTop: 14,
  },

  exploreLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  exploreText: {
    color: "#087A52",
    fontSize: 12,
    fontWeight: "900",
  },

  arrowCircle: {
    width: 35,
    height: 35,
    borderRadius: 13,
    backgroundColor: "#087A52",
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    alignItems: "center",
    marginTop: 17,
  },

  footerLine: {
    width: 45,
    height: 3,
    borderRadius: 5,
    backgroundColor: "#C8DED0",
    marginBottom: 17,
  },

  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  footerTitle: {
    color: "#174633",
    fontSize: 14,
    fontWeight: "900",
  },

  footerText: {
    color: "#8A9890",
    fontSize: 11,
    textAlign: "center",
    marginTop: 7,
  },
});
