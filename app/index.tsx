
import { useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

export default function IndexScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/anambralogo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Anambra State logo"
        />

        <Text style={styles.title}>
          ANAMBRAFIX
        </Text>

        <Text style={styles.subtitle}>
          Your Community. Your Voice.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 170,
    height: 170,
    marginBottom: 18,
  },
  title: {
    color: "#087A43",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  subtitle: {
    color: "#52665B",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 9,
    textAlign: "center",
  },
});
