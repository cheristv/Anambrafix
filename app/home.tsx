
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { supabase } from "../lib/supabase";
import { useAppTheme } from "../context/ThemeContext";
import HomepagePicture from "./HomepagePicture";

const logo = require("../assets/anambralogo.png");

type Announcement = {
  id: string;
  title: string;
  body: string;
  published_at: string | null;
};

type TabName = "Home" | "Services" | "Reports" | "Settings";

const services = [
  {
    id: "report",
    icon: "📋",
    title: "Report an Issue",
    description: "Report problems affecting your community.",
    color: "#E5F3EB",
    darkColor: "#193D2B",
    route: "/my-reports",
  },
  {
    id: "emergency",
    icon: "🚨",
    title: "Emergency Help",
    description: "Find important emergency contacts.",
    color: "#FCEBE9",
    darkColor: "#492825",
    route: "/emergency",
  },
  {
    id: "government",
    icon: "🏛️",
    title: "Government",
    description: "Explore government and LGA information.",
    color: "#FFF2D9",
    darkColor: "#46391F",
    route: "/government",
  },
  {
    id: "projects",
    icon: "🏗️",
    title: "Community Projects",
    description: "Discover development across Anambra.",
    color: "#EEE9FA",
    darkColor: "#34294B",
    route: "/projects",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme, resolvedMode } = useAppTheme();

  const isDark = resolvedMode === "dark";

  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView> | null>(null);
  const servicesPosition = useRef(0);

  const [activeTab, setActiveTab] = useState<TabName>("Home");

  const [announcement, setAnnouncement] =
    useState<Announcement | null>(null);

  const [announcementLoading, setAnnouncementLoading] =
    useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [slideRefreshKey, setSlideRefreshKey] = useState(0);

  const styles = createStyles(theme, isDark);

  // LOAD LATEST ANNOUNCEMENT
  const loadAnnouncement = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("id,title,body,published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.log("Announcement error:", error.message);
        return;
      }

      setAnnouncement(data);
    } catch (error) {
      console.log("Announcement loading error:", error);
    } finally {
      setAnnouncementLoading(false);
    }
  }, []);

  // REFRESH HOMEPAGE
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadAnnouncement();
      setSlideRefreshKey((previous) => previous + 1);
    } finally {
      setRefreshing(false);
    }
  }, [loadAnnouncement]);

  // INITIAL LOAD AND REALTIME UPDATES
  useEffect(() => {
    loadAnnouncement();

    const channel = supabase
      .channel("anambrafix-home-announcements")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements",
        },
        () => {
          loadAnnouncement();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadAnnouncement]);

  // OPEN SERVICE
  const openService = (route: string) => {
    router.push(route as any);
  };

  // OPEN ANNOUNCEMENTS
  const openAnnouncement = () => {
    router.push("/announcements" as any);
  };

  // BOTTOM NAVIGATION
  const handleNavigation = (section: TabName) => {
    setActiveTab(section);

    switch (section) {
      case "Home":
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
        break;

      case "Services":
        scrollViewRef.current?.scrollTo({
          y: Math.max(servicesPosition.current - 15, 0),
          animated: true,
        });
        break;

      case "Reports":
        router.push("/my-reports" as any);
        break;

      case "Settings":
        router.push("/settings" as any);
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
              title="Refreshing..."
              titleColor={theme.textSecondary}
            />
          }
        >

          {/* TOP HEADER */}

          <View style={styles.header}>
            <View style={styles.brandContainer}>
              <View style={styles.logoWrapper}>
                <Image
                  source={logo}
                  style={styles.logo}
                  resizeMode="contain"
                  accessibilityLabel="AnambraFix logo"
                />
              </View>

              <View style={styles.brandTextContainer}>
                <Text style={styles.brandName}>
                  ANAMBRAFIX
                </Text>

                <Text style={styles.brandSubtitle}>
                  YOUR STATE. YOUR VOICE.
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.settingsButton}
              onPress={() => router.push("/settings" as any)}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
            >
              <Text style={styles.settingsIcon}>⚙</Text>
            </Pressable>
          </View>

          {/* HERO SECTION */}

          <View style={styles.hero}>
            <View style={styles.heroDecorationOne} />
            <View style={styles.heroDecorationTwo} />

            <View style={styles.heroTop}>
              <View style={styles.heroBadge}>
                <View style={styles.onlineDot} />

                <Text style={styles.heroBadgeText}>
                  ANAMBRA STATE
                </Text>
              </View>

              <Image
                source={logo}
                style={styles.heroLogo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.heroTitle}>
              Let's build a{"\n"}
              <Text style={styles.heroHighlight}>
                better Anambra.
              </Text>
            </Text>

            <Text style={styles.heroDescription}>
              Your voice matters. Report community issues,
              discover government initiatives and help
              make our communities better.
            </Text>

            <Pressable
              onPress={() => router.push("/my-reports" as any)}
              style={({ pressed }) => [
                styles.heroButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.heroButtonText}>
                Report an Issue
              </Text>

              <Text style={styles.heroButtonArrow}>
                →
              </Text>
            </Pressable>

            <Text style={styles.heroFooter}>
              CITIZEN PARTICIPATION • COMMUNITY DEVELOPMENT
            </Text>
          </View>

          {/* HOMEPAGE SLIDESHOW */}

          <View style={styles.sliderContainer}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>
                  Discover Anambra
                </Text>

                <Text style={styles.sectionSubtitle}>
                  News, highlights and community updates
                </Text>
              </View>
            </View>

            <View style={styles.sliderCard}>
              <HomepagePicture key={slideRefreshKey} />
            </View>
          </View>

          {/* ANNOUNCEMENTS */}

          <Pressable
            onPress={openAnnouncement}
            style={({ pressed }) => [
              styles.announcementCard,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="View official announcements"
          >
            <View style={styles.announcementHeader}>
              <View style={styles.announcementIconBox}>
                <Text style={styles.announcementIcon}>
                  📢
                </Text>
              </View>

              <View style={styles.announcementHeading}>
                <Text style={styles.announcementLabel}>
                  OFFICIAL UPDATES
                </Text>

                <Text style={styles.announcementSubLabel}>
                  Announcements from AnambraFix
                </Text>
              </View>

              <Text style={styles.announcementArrow}>
                ↗
              </Text>
            </View>

            <View style={styles.announcementDivider} />

            {announcementLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.announcementPreview}>
                  Loading latest updates...
                </Text>
              </View>
            ) : announcement ? (
              <>
                <Text
                  style={styles.announcementTitle}
                  numberOfLines={2}
                >
                  {announcement.title}
                </Text>

                <Text
                  style={styles.announcementPreview}
                  numberOfLines={2}
                >
                  {announcement.body}
                </Text>
              </>
            ) : (
              <Text style={styles.announcementPreview}>
                No new announcements at the moment.
                Check back for important updates.
              </Text>
            )}

            <Text style={styles.announcementLink}>
              View all announcements →
            </Text>
          </Pressable>

          {/* SERVICES */}

          <View
            style={styles.servicesSection}
            onLayout={(event) => {
              servicesPosition.current =
                event.nativeEvent.layout.y;
            }}
          >
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>
                  Explore Services
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Everything you need, in one place.
                </Text>
              </View>

              <View style={styles.serviceCount}>
                <Text style={styles.serviceCountText}>
                  04
                </Text>
              </View>
            </View>

            <View style={styles.servicesGrid}>
              {services.map((service, index) => (
                <Pressable
                  key={service.id}
                  onPress={() => openService(service.route)}
                  style={({ pressed }) => [
                    styles.serviceCard,
                    {
                      opacity: pressed ? 0.8 : 1,
                      transform: [
                        { scale: pressed ? 0.98 : 1 },
                      ],
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={service.title}
                >
                  <View
                    style={[
                      styles.serviceIconContainer,
                      {
                        backgroundColor: isDark
                          ? service.darkColor
                          : service.color,
                      },
                    ]}
                  >
                    <Text style={styles.serviceIcon}>
                      {service.icon}
                    </Text>
                  </View>

                  <View style={styles.serviceNumber}>
                    <Text style={styles.serviceNumberText}>
                      0{index + 1}
                    </Text>
                  </View>

                  <Text style={styles.serviceTitle}>
                    {service.title}
                  </Text>

                  <Text style={styles.serviceDescription}>
                    {service.description}
                  </Text>

                  <View style={styles.serviceBottom}>
                    <Text style={styles.serviceAction}>
                      Explore
                    </Text>

                    <Text style={styles.serviceArrow}>
                      ↗
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* EMERGENCY ASSISTANCE */}

          <Pressable
            onPress={() => router.push("/emergency" as any)}
            style={({ pressed }) => [
              styles.emergencyCard,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Emergency assistance"
          >
            <View style={styles.emergencyIconBox}>
              <Text style={styles.emergencyIcon}>
                🚨
              </Text>
            </View>

            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyEyebrow}>
                NEED HELP?
              </Text>

              <Text style={styles.emergencyTitle}>
                Emergency Assistance
              </Text>

              <Text style={styles.emergencyDescription}>
                Find hospitals, police contacts and other
                important emergency information.
              </Text>

              <Text style={styles.emergencyAction}>
                Get assistance →
              </Text>
            </View>

            <Text style={styles.emergencyArrow}>
              ›
            </Text>
          </Pressable>

          {/* COMMUNITY MESSAGE */}

          <View style={styles.communityCard}>
            <View style={styles.communityTop}>
              <View style={styles.communityIconBox}>
                <Text style={styles.communityIcon}>
                  🌱
                </Text>
              </View>

              <View style={styles.communityBadge}>
                <Text style={styles.communityBadgeText}>
                  OUR COMMUNITY
                </Text>
              </View>
            </View>

            <Text style={styles.communityTitle}>
              Every voice counts.
            </Text>

            <Text style={styles.communityDescription}>
              A better Anambra starts with citizens who care.
              Your reports, ideas and participation can help
              create lasting improvements in our communities.
            </Text>

            <View style={styles.communityDivider} />

            <Text style={styles.communityFooter}>
              TOGETHER, WE CAN MAKE A DIFFERENCE.
            </Text>
          </View>

          {/* FOOTER */}

          <View style={styles.footer}>
            <Image
              source={logo}
              style={styles.footerLogo}
              resizeMode="contain"
            />

            <Text style={styles.footerBrand}>
              ANAMBRAFIX
            </Text>

            <Text style={styles.footerTagline}>
              Your State. Your Voice. Your Future.
            </Text>

            <View style={styles.footerDivider} />

            <Text style={styles.footerText}>
              Anambra State, Nigeria
            </Text>

            <Text style={styles.founderText}>
              An initiative by EYAH CHRISTIAN CHINECHEREM
            </Text>
          </View>

        </ScrollView>

        {/* BOTTOM NAVIGATION */}

        <View style={styles.bottomNavigation}>
          {(
            [
              ["Home", "⌂"],
              ["Services", "▦"],
              ["Reports", "▤"],
              ["Settings", "⚙"],
            ] as [TabName, string][]
          ).map(([section, icon]) => {
            const active = activeTab === section;

            return (
              <Pressable
                key={section}
                style={styles.navItem}
                onPress={() => handleNavigation(section)}
                accessibilityRole="button"
                accessibilityLabel={section}
              >
                <View
                  style={[
                    styles.navIconContainer,
                    active && styles.activeNavIconContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.navIcon,
                      active && styles.activeNavIcon,
                    ]}
                  >
                    {icon}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.navLabel,
                    active && styles.activeNavLabel,
                  ]}
                >
                  {section}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(
  theme: ReturnType<typeof useAppTheme>["theme"],
  isDark: boolean
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },

    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      paddingHorizontal: 19,
      paddingTop: 12,
      paddingBottom: 30,
    },

    // HEADER

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 19,
    },

    brandContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    logoWrapper: {
      width: 53,
      height: 53,
      borderRadius: 17,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
    },

    logo: {
      width: 43,
      height: 43,
    },

    brandTextContainer: {
      flex: 1,
    },

    brandName: {
      color: theme.primary,
      fontSize: 19,
      fontWeight: "900",
      letterSpacing: 1,
    },

    brandSubtitle: {
      color: theme.textSecondary,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.3,
      marginTop: 5,
    },

    settingsButton: {
      width: 45,
      height: 45,
      borderRadius: 15,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },

    settingsIcon: {
      color: theme.text,
      fontSize: 23,
    },

    // HERO

    hero: {
      backgroundColor: "#075C39",
      borderRadius: 25,
      padding: 21,
      paddingTop: 20,
      marginBottom: 27,
      overflow: "hidden",
      minHeight: 300,
    },

    heroDecorationOne: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: "rgba(255,255,255,0.045)",
      right: -75,
      top: 45,
    },

    heroDecorationTwo: {
      position: "absolute",
      width: 125,
      height: 125,
      borderRadius: 65,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.09)",
      right: -32,
      bottom: -35,
    },

    heroTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 23,
    },

    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: 30,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#A5E8A7",
      marginRight: 7,
    },

    heroBadgeText: {
      color: "#FFFFFF",
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1.4,
    },

    heroLogo: {
      width: 54,
      height: 54,
    },

    heroTitle: {
      color: "#FFFFFF",
      fontSize: 30,
      lineHeight: 38,
      fontWeight: "900",
      letterSpacing: -0.7,
    },

    heroHighlight: {
      color: "#B9E8C5",
    },

    heroDescription: {
      color: "#E1F2E7",
      fontSize: 12,
      lineHeight: 19,
      marginTop: 11,
      maxWidth: 300,
    },

    heroButton: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 46,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      alignSelf: "flex-start",
      minWidth: 164,
      marginTop: 19,
    },

    heroButtonText: {
      color: "#075C39",
      fontSize: 12,
      fontWeight: "900",
    },

    heroButtonArrow: {
      color: "#075C39",
      fontSize: 20,
      fontWeight: "800",
    },

    heroFooter: {
      color: "#B7DCC5",
      fontSize: 8,
      fontWeight: "800",
      letterSpacing: 1,
      marginTop: 20,
    },

    // SECTIONS

    sectionHeading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },

    sectionTitle: {
      color: theme.text,
      fontSize: 19,
      fontWeight: "900",
      letterSpacing: -0.3,
    },

    sectionSubtitle: {
      color: theme.textSecondary,
      fontSize: 11,
      marginTop: 5,
    },

    sliderContainer: {
      marginBottom: 25,
    },

    sliderCard: {
      borderRadius: 19,
      overflow: "hidden",
      backgroundColor: theme.surface,
    },

    // ANNOUNCEMENTS

    announcementCard: {
      backgroundColor: isDark ? "#164A32" : "#087A49",
      borderRadius: 20,
      padding: 17,
      marginBottom: 28,
    },

    announcementHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    announcementIconBox: {
      width: 41,
      height: 41,
      borderRadius: 13,
      backgroundColor: "rgba(255,255,255,0.14)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
    },

    announcementIcon: {
      fontSize: 19,
    },

    announcementHeading: {
      flex: 1,
    },

    announcementLabel: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 0.7,
    },

    announcementSubLabel: {
      color: "#D0EBDD",
      fontSize: 9,
      marginTop: 4,
    },

    announcementArrow: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "800",
    },

    announcementDivider: {
      height: 1,
      backgroundColor: "rgba(255,255,255,0.19)",
      marginVertical: 15,
    },

    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    announcementTitle: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
      lineHeight: 21,
      marginBottom: 7,
    },

    announcementPreview: {
      color: "#E3F4E9",
      fontSize: 11,
      lineHeight: 18,
    },

    announcementLink: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "900",
      marginTop: 15,
    },

    // SERVICES

    servicesSection: {
      marginBottom: 10,
    },

    serviceCount: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: isDark ? "#193C2C" : "#E6F3EA",
      alignItems: "center",
      justifyContent: "center",
    },

    serviceCountText: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: "900",
    },

    servicesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },

    serviceCard: {
      width: "48.2%",
      minHeight: 190,
      backgroundColor: theme.surface,
      borderRadius: 19,
      padding: 14,
      marginBottom: 13,
      borderWidth: 1,
      borderColor: theme.border,
    },

    serviceIconContainer: {
      width: 47,
      height: 47,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 15,
    },

    serviceIcon: {
      fontSize: 24,
    },

    serviceNumber: {
      position: "absolute",
      right: 14,
      top: 17,
    },

    serviceNumberText: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: "800",
      opacity: 0.65,
    },

    serviceTitle: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "900",
      lineHeight: 18,
      marginBottom: 7,
    },

    serviceDescription: {
      color: theme.textSecondary,
      fontSize: 10,
      lineHeight: 16,
      minHeight: 32,
    },

    serviceBottom: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 13,
    },

    serviceAction: {
      color: theme.primary,
      fontSize: 10,
      fontWeight: "900",
    },

    serviceArrow: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: "900",
    },

    // EMERGENCY

    emergencyCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#492825" : "#FFF0ED",
      borderRadius: 20,
      padding: 16,
      marginTop: 7,
      marginBottom: 17,
      borderWidth: 1,
      borderColor: isDark ? "#70413C" : "#F4D8D3",
    },

    emergencyIconBox: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: isDark ? "#60332F" : "#FCE0DC",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    emergencyIcon: {
      fontSize: 24,
    },

    emergencyContent: {
      flex: 1,
    },

    emergencyEyebrow: {
      color: isDark ? "#E9A29A" : "#B74A41",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1,
      marginBottom: 5,
    },

    emergencyTitle: {
      color: isDark ? "#FFD4CF" : "#852C25",
      fontSize: 13,
      fontWeight: "900",
      marginBottom: 5,
    },

    emergencyDescription: {
      color: isDark ? "#E4BDB8" : "#865752",
      fontSize: 10,
      lineHeight: 16,
    },

    emergencyAction: {
      color: isDark ? "#FFB5AB" : "#A9332B",
      fontSize: 11,
      fontWeight: "900",
      marginTop: 9,
    },

    emergencyArrow: {
      color: isDark ? "#FFB5AB" : "#A9332B",
      fontSize: 27,
      marginLeft: 7,
    },

    // COMMUNITY

    communityCard: {
      backgroundColor: theme.surface,
      borderRadius: 21,
      padding: 19,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 27,
    },

    communityTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },

    communityIconBox: {
      width: 43,
      height: 43,
      borderRadius: 14,
      backgroundColor: isDark ? "#193D2B" : "#E6F3EA",
      alignItems: "center",
      justifyContent: "center",
    },

    communityIcon: {
      fontSize: 23,
    },

    communityBadge: {
      backgroundColor: isDark ? "#193D2B" : "#EAF4ED",
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 20,
    },

    communityBadgeText: {
      color: theme.primary,
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.9,
    },

    communityTitle: {
      color: theme.text,
      fontSize: 21,
      fontWeight: "900",
      marginBottom: 9,
    },

    communityDescription: {
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 19,
    },

    communityDivider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 15,
    },

    communityFooter: {
      color: theme.primary,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1,
    },

    // FOOTER

    footer: {
      alignItems: "center",
      paddingTop: 10,
      paddingBottom: 12,
    },

    footerLogo: {
      width: 55,
      height: 55,
      marginBottom: 7,
    },

    footerBrand: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: 2,
    },

    footerTagline: {
      color: theme.textSecondary,
      fontSize: 10,
      marginTop: 5,
    },

    footerDivider: {
      width: 45,
      height: 2,
      backgroundColor: theme.primary,
      borderRadius: 2,
      marginVertical: 15,
    },

    footerText: {
      color: theme.textSecondary,
      fontSize: 10,
    },

    founderText: {
      color: theme.textSecondary,
      fontSize: 9,
      marginTop: 9,
      textAlign: "center",
    },

    // BOTTOM NAVIGATION

    bottomNavigation: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingHorizontal: 7,
      paddingTop: 8,
      paddingBottom: 9,
      minHeight: 76,
    },

    navItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    navIconContainer: {
      width: 53,
      height: 35,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },

    activeNavIconContainer: {
      backgroundColor: isDark ? "#164A32" : "#E5F3EA",
    },

    navIcon: {
      color: theme.textSecondary,
      fontSize: 23,
      fontWeight: "700",
    },

    activeNavIcon: {
      color: theme.primary,
    },

    navLabel: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: "600",
    },

    activeNavLabel: {
      color: theme.primary,
      fontSize: 10,
      fontWeight: "900",
    },
  });
}
