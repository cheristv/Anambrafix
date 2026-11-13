
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

export type AppColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  white: string;
  black: string;
  inputBackground: string;
};

type ThemeContextType = {
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  theme: AppColors;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "igbo_eze_north_theme";

const lightTheme: AppColors = {
  primary: "#126B40",
  primaryDark: "#0B4D2D",
  primaryLight: "#EAF4ED",
  background: "#F7F9F7",
  surface: "#FFFFFF",
  text: "#182820",
  textSecondary: "#68766D",
  border: "#DCE5DE",
  success: "#23834D",
  warning: "#D8A62E",
  danger: "#D93636",
  white: "#FFFFFF",
  black: "#000000",
  inputBackground: "#F1F5F2",
};

const darkTheme: AppColors = {
  primary: "#55B985",
  primaryDark: "#26784E",
  primaryLight: "#193D2C",
  background: "#101A14",
  surface: "#1B2920",
  text: "#F0F5F1",
  textSecondary: "#A6B5AA",
  border: "#34483A",
  success: "#62C68B",
  warning: "#E9BD55",
  danger: "#FF7777",
  white: "#FFFFFF",
  black: "#000000",
  inputBackground: "#26372C",
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();

  const [mode, setModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);

        if (
          savedTheme === "light" ||
          savedTheme === "dark" ||
          savedTheme === "system"
        ) {
          setModeState(savedTheme);
        }
      } catch (error) {
        console.log("Theme loading error:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    AsyncStorage.setItem(STORAGE_KEY, mode).catch((error) => {
      console.log("Theme saving error:", error);
    });
  }, [mode, isLoaded]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const resolvedMode =
    mode === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : mode;

  const theme = useMemo(
    () => (resolvedMode === "dark" ? darkTheme : lightTheme),
    [resolvedMode]
  );

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      theme,
      setMode,
    }),
    [mode, resolvedMode, theme, setMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme must be used inside ThemeProvider."
    );
  }

  return context;
}
