export const palette = {
  // Primary color: #274653
  // Secondary color: #f16b60
  // Accent color: #f59482

  indigo50: "#eef2ff",
  indigo100: "#e0e7ff",
  indigo400: "#818cf8",
  indigo500: "#6366f1",
  indigo600: "#4f46e5",
  indigo700: "#4338ca",

  violet400: "#a78bfa",
  violet500: "#8b5cf6",

  rose400: "#fb7185",
  rose500: "#f43f5e",

  amber400: "#fbbf24",
  amber500: "#f59e0b",

  emerald400: "#34d399",
  emerald500: "#10b981",

  sky400: "#38bdf8",
  sky500: "#0ea5e9",

  neutral50: "#fafafa",
  neutral100: "#f5f5f5",
  neutral200: "#e5e5e5",
  neutral300: "#d4d4d4",
  neutral400: "#a3a3a3",
  neutral500: "#737373",
  neutral600: "#525252",
  neutral700: "#404040",
  neutral800: "#262626",
  neutral900: "#171717",
  neutral950: "#0a0a0a",

  white: "#ffffff",
  black: "#000000",
};

export const lightTheme = {
  dark: false,
  colors: {
    background: "#f8f8fc",
    surface: "#ffffff",
    surfaceAlt: "#f1f1f8",
    border: "#ebebf5",
    borderLight: "#f3f3fa",

    primary: palette.indigo500,
    primaryLight: palette.indigo100,
    primaryDark: palette.indigo700,

    accent: palette.violet500,
    accentLight: "#f3f0ff",

    success: palette.emerald500,
    warning: palette.amber500,
    danger: palette.rose500,
    info: palette.sky500,

    text: "#1a1a2e",
    textSecondary: "#6b6b8a",
    textTertiary: "#a0a0b8",
    textInverse: "#ffffff",

    tabBar: "#ffffff",
    tabBarBorder: "#ebebf5",
    tabBarActive: palette.indigo500,
    tabBarInactive: "#b0b0c8",

    drawerBackground: "#ffffff",
    drawerActive: palette.indigo50,
    drawerActiveText: palette.indigo600,
    drawerInactiveText: "#6b6b8a",

    card1: palette.indigo500,
    card2: palette.violet500,
    card3: palette.rose500,
    card4: palette.emerald500,

    gradientStart: palette.indigo500,
    gradientEnd: palette.violet500,

    shadow: "rgba(99, 102, 241, 0.12)",
    shadowDark: "rgba(0,0,0,0.08)",

    white: "#ffffff",
    statusBar: "dark-content" ? "dark-content" : "light-content",
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    background: "#0f0f1a",
    surface: "#1a1a2e",
    surfaceAlt: "#1e1e32",
    border: "#2a2a42",
    borderLight: "#232338",

    primary: palette.indigo400,
    primaryLight: "#1e1e3f",
    primaryDark: palette.indigo500,

    accent: palette.violet400,
    accentLight: "#1e1a35",

    success: palette.emerald400,
    warning: palette.amber400,
    danger: palette.rose400,
    info: palette.sky400,

    text: "#eeeeff",
    textSecondary: "#9090b8",
    textTertiary: "#5a5a7a",
    textInverse: "#0f0f1a",

    tabBar: "#13131f",
    tabBarBorder: "#2a2a42",
    tabBarActive: palette.indigo400,
    tabBarInactive: "#4a4a6a",

    drawerBackground: "#13131f",
    drawerActive: "#1e1e3f",
    drawerActiveText: palette.indigo400,
    drawerInactiveText: "#7070a0",

    card1: "#1e2050",
    card2: "#251a45",
    card3: "#3a1a2e",
    card4: "#0f2a24",

    gradientStart: palette.indigo600,
    gradientEnd: "#5b21b6",

    shadow: "rgba(0,0,0,0.4)",
    shadowDark: "rgba(0,0,0,0.6)",

    white: "#ffffff",
    statusBar: "light-content" ? "dark-content" : "light-content",
  },
};
