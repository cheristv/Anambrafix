
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import type { EmailOtpType } from "@supabase/supabase-js";

import colors from "../../constants/colors";
import { supabase } from "../../lib/supabase";

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string | string[];
    token_hash?: string | string[];
    type?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();

  const started = useRef(false);
  const [message, setMessage] = useState(
    "Verifying your email address..."
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const processConfirmation = async () => {
      const code = first(params.code);
      const tokenHash = first(params.token_hash);
      const type = first(params.type);
      const error = first(params.error);
      const errorDescription = first(params.error_description);

      if (error || errorDescription) {
        setFailed(true);
        setMessage(
          errorDescription || error || "The confirmation link could not be verified."
        );
        return;
      }

      try {
        let result;

        if (code) {
          result = await supabase.auth.exchangeCodeForSession(code);
        } else if (tokenHash && (type === "signup" || type === "email")) {
          result = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });
        } else {
          setFailed(true);
          setMessage(
            "This confirmation link is incomplete or invalid. Please request a new confirmation email."
          );
          return;
        }

        if (result.error) {
          setFailed(true);
          setMessage(result.error.message);
          return;
        }

        setMessage("Your email address has been confirmed successfully.");
      } catch {
        setFailed(true);
        setMessage(
          "We couldn't verify your email. Please check your connection and try again."
        );
      }
    };

    processConfirmation();
  }, [params.code, params.token_hash, params.type, params.error, params.error_description]);

  return (
    <View style={styles.container}>
      {!failed && <ActivityIndicator size="large" color={colors.primary} />}

      <Text style={styles.title}>
        {failed ? "Confirmation unsuccessful" : "Email confirmation"}
      </Text>

      <Text style={styles.message}>{message}</Text>

      {failed ? (
        <Text
          style={styles.link}
          onPress={() => router.replace("/login")}
        >
          Return to Login
        </Text>
      ) : message.includes("confirmed successfully") ? (
        <Text
          style={styles.link}
          onPress={() => router.replace("/login?confirmed=1")}
        >
          Continue to Login
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginTop: 22,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    textAlign: "center",
  },
  link: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 28,
    padding: 12,
  },
});
