import { Platform, type TextStyle, type ViewStyle } from "react-native";

/** iPhone 14/15/16 Plus logical canvas. Screens flex; content never grows past this. */
export const canvas = {
  width: 430,
  height: 932,
  inset: 20,
} as const;

export const colors = {
  paper: "#F4EDE1",
  paperDeep: "#E8DCC8",
  ink: "#3A2A1F",
  inkSoft: "#6B5344",
  teal: "#2F6F6A",
  tealDeep: "#245652",
  tealSoft: "#D7E8E5",
  amber: "#E0A14A",
  amberSoft: "#F6E3C0",
  rose: "#C45C5C",
  roseSoft: "#F3D6D4",
  white: "#FFFDF8",
  lock: "#C4B6A6",
} as const;

export const alpha = {
  inkFaint: "rgba(58, 42, 31, 0.06)",
  inkSoft: "rgba(58, 42, 31, 0.12)",
  inkMuted: "rgba(58, 42, 31, 0.45)",
  overlay: "rgba(58, 42, 31, 0.45)",
  tealGlow: "rgba(47, 111, 106, 0.22)",
} as const;

/** SF Pro Rounded via the system rounded design. Do not embed SF files. */
export const fontFamily = Platform.select({
  ios: "ui-rounded",
  android: "sans-serif",
  default: "ui-rounded",
}) as string;

function face(
  size: number,
  weight: NonNullable<TextStyle["fontWeight"]>,
  tracking: number,
  lineHeight: number,
): TextStyle {
  return {
    fontFamily,
    fontSize: size,
    fontWeight: weight,
    letterSpacing: tracking,
    lineHeight,
  };
}

/** Tight iOS text styles — 17pt body, 11pt floor, SF tracking. */
export const type = {
  display: face(34, "700", 0.37, 41),
  title: face(28, "700", 0.36, 34),
  subtitle: face(22, "700", 0.35, 28),
  headline: face(17, "600", -0.41, 22),
  body: face(17, "400", -0.41, 22),
  callout: face(16, "600", -0.32, 21),
  footnote: face(13, "600", -0.08, 18),
  caption: face(12, "600", 0, 16),
  micro: face(11, "600", 0.07, 13),
} as const;

export const fonts = {
  regular: fontFamily,
  medium: fontFamily,
  semibold: fontFamily,
  bold: fontFamily,
  extraBold: fontFamily,
} as const;

export const squircle = {
  borderCurve: "continuous" as const,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  tile: 14,
  pill: 999,
} as const;

/** 4pt grid. Screen inset is `canvas.inset` (20). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  huge: 32,
} as const;

export const hit = {
  kid: 56,
} as const;

function lift(y: number, blur: number, opacity: number, elevation: number): ViewStyle {
  return {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: y },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };
}

/** One light from above. Warm ink, never black. */
export const shadow = {
  rest: lift(2, 6, 0.1, 2),
  tile: lift(4, 10, 0.1, 3),
  card: lift(8, 20, 0.1, 6),
  float: lift(12, 28, 0.12, 10),
} as const;

export const shadowLayer = {
  rest: {
    ambient: lift(4, 10, 0.06, 1),
    key: lift(1, 3, 0.1, 2),
  },
  tile: {
    ambient: lift(6, 14, 0.06, 2),
    key: lift(2, 6, 0.1, 3),
  },
  card: {
    ambient: lift(10, 22, 0.06, 4),
    key: lift(3, 8, 0.1, 5),
  },
} as const;
