import { loadFont as loadFigtree } from "@remotion/google-fonts/Figtree";
import { loadFont as loadLexend } from "@remotion/google-fonts/Lexend";
import { Easing } from "remotion";

// The app's own type and colors (src/theme/palette.ts in OncoSense), so the reel looks
// like the product it shows.

export const display = loadFigtree("normal", {
  weights: ["800"],
  subsets: ["latin"],
}).fontFamily;

export const body = loadLexend("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin"],
}).fontFamily;

export const C = {
  night: "#140D33",
  panel: "#2E1F66",
  panelTop: "#41309A",
  lavender: "#D9CCFF",
  onPanelMuted: "#E6E0FA",
  ground: "#EBE8F2",
  surface: "#FFFFFF",
  raised: "#E0D8F5",
  ink: "#221A36",
  muted: "#5D5672",
  line: "#DDD5EE",
  border: "#CEC6E2",
  action: "#5236B5",
  help: "#0E6B63",
  helpBright: "#6FD3C5",
  helpTint: "#E1F2EF",
  amber: "#F5BE4A",
  amberInk: "#8A5A00",
  sun: "#FDF1D6",
  danger: "#C2255C",
};

// The ribbon drawn as one continuous line (RibbonMark.tsx), in a 200 x 260 box.
export const RIBBON =
  "M62 248 L126 118 C146 76 146 34 100 34 C54 34 54 76 74 118 L138 248";
export const RIBBON_LENGTH = 520;

export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const POP = Easing.spring({ damping: 12, mass: 0.6 });

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
