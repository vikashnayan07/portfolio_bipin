import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

/**
 * Get time-of-day palette: shifts accent warmth & ambient tinting.
 * Returns a period name + CSS custom properties to inject.
 */
const getTimePalette = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) {
    // Dawn — warm amber tones
    return {
      period: "dawn",
      label: "🌅 Dawn Mode",
      vars: {
        "--tod-accent": "#FFB347",
        "--tod-accent-light": "#FFD699",
        "--tod-bg-tint": "rgba(255, 179, 71, 0.03)",
        "--tod-glow": "rgba(255, 179, 71, 0.15)",
      },
    };
  }
  if (hour >= 8 && hour < 12) {
    // Morning — bright saffron
    return {
      period: "morning",
      label: "☀️ Morning Mode",
      vars: {
        "--tod-accent": "#FF9933",
        "--tod-accent-light": "#F4A261",
        "--tod-bg-tint": "rgba(255, 153, 51, 0.02)",
        "--tod-glow": "rgba(255, 153, 51, 0.12)",
      },
    };
  }
  if (hour >= 12 && hour < 17) {
    // Afternoon — golden warm
    return {
      period: "afternoon",
      label: "🌤️ Afternoon Mode",
      vars: {
        "--tod-accent": "#FFD700",
        "--tod-accent-light": "#FFEAA7",
        "--tod-bg-tint": "rgba(255, 215, 0, 0.02)",
        "--tod-glow": "rgba(255, 215, 0, 0.10)",
      },
    };
  }
  if (hour >= 17 && hour < 21) {
    // Evening — warm sunset
    return {
      period: "evening",
      label: "🌇 Evening Mode",
      vars: {
        "--tod-accent": "#E88A1A",
        "--tod-accent-light": "#F4A261",
        "--tod-bg-tint": "rgba(232, 138, 26, 0.03)",
        "--tod-glow": "rgba(232, 138, 26, 0.15)",
      },
    };
  }
  // Night — cool deep blue accent with saffron warmth
  return {
    period: "night",
    label: "🌙 Night Mode",
    vars: {
      "--tod-accent": "#FF9933",
      "--tod-accent-light": "#F4A261",
      "--tod-bg-tint": "rgba(10, 25, 47, 0.05)",
      "--tod-glow": "rgba(255, 153, 51, 0.08)",
    },
  };
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("nexus-theme");
    if (saved !== null) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const timePalette = useMemo(() => getTimePalette(), []);

  useEffect(() => {
    localStorage.setItem("nexus-theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.body.classList.remove("light-mode");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.add("light-mode");
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Apply time-of-day CSS custom properties to :root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(timePalette.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.setAttribute("data-time-period", timePalette.period);
  }, [timePalette]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, timePalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
