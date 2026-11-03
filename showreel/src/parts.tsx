import type React from "react";
import { createContext, useContext } from "react";
import {
  Interactive,
  interpolate,
  useCurrentFrame,
  type InteractivitySchema,
} from "remotion";
import { MATERIAL_ICONS } from "../../src/components/ui/materialIcons";
import { body, C, clamp, display, OUT, RIBBON, RIBBON_LENGTH } from "./theme";

/** Inside the fast-cut reel, scenes play without their own headline and supporting line. */
export const Bare = createContext(false);

export type IconName = keyof typeof MATERIAL_ICONS;

/** One of the app's own Material Symbols. */
export const Icon = ({
  name,
  size,
  color,
  style,
}: {
  name: IconName;
  size: number;
  color: string;
  style?: React.CSSProperties;
}) => (
  <svg width={size} height={size} viewBox="0 -960 960 960" style={style}>
    <path d={MATERIAL_ICONS[name]} fill={color} />
  </svg>
);

/** The awareness ribbon as one line, traced in over `progress` 0 to 1. */
export const Ribbon = ({
  height,
  color,
  progress,
  weight = 18,
  style,
}: {
  height: number;
  color: string;
  progress: number;
  weight?: number;
  style?: React.CSSProperties;
}) => (
  <svg
    width={(height * 200) / 260}
    height={height}
    viewBox="0 0 200 260"
    style={{ overflow: "visible", ...style }}
  >
    <path
      d={RIBBON}
      fill="none"
      stroke={color}
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={RIBBON_LENGTH}
      strokeDashoffset={RIBBON_LENGTH * (1 - progress)}
    />
  </svg>
);

/** An iPhone-sized frame around an app screen. */
export const Phone = ({
  children,
  background = C.ground,
  style,
}: {
  children: React.ReactNode;
  background?: string;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      position: "absolute",
      width: 430,
      height: 880,
      borderRadius: 72,
      padding: 14,
      background: "#0D0A18",
      boxShadow:
        "0 0 0 2px rgba(217,204,255,0.25), 0 60px 120px rgba(8,4,30,0.55), 0 20px 40px rgba(8,4,30,0.35)",
      ...style,
    }}
  >
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 58,
        overflow: "hidden",
        background,
        fontFamily: body,
        color: C.ink,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          translate: "-50% 0",
          width: 120,
          height: 34,
          borderRadius: 20,
          background: "#0D0A18",
          zIndex: 5,
        }}
      />
      {children}
    </div>
  </div>
);

/** The app's five tabs, with `active` lit. */
export const TabBar = ({ active }: { active: number }) => {
  const tabs: [string, IconName][] = [
    ["Today", "home"],
    ["Learn", "book"],
    ["Journey", "activity"],
    ["Community", "users"],
    ["Help", "life-buoy"],
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 92,
        display: "flex",
        background: C.ground,
        borderTop: `1px solid ${C.line}`,
        paddingTop: 10,
      }}
    >
      {tabs.map(([label, icon], index) => (
        <div
          key={label}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 500,
            color: index === active ? C.action : C.muted,
          }}
        >
          <Icon
            name={icon}
            size={26}
            color={index === active ? C.action : C.muted}
          />
          {label}
        </div>
      ))}
    </div>
  );
};

/** A screen title the way the app sets it. */
export const ScreenTitle = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: display,
      fontWeight: 800,
      fontSize: 38,
      letterSpacing: -0.5,
      padding: "70px 24px 14px",
    }}
  >
    {children}
  </div>
);

const HeadlineInner = ({
  children,
  delay = 0,
  style,
}: {
  readonly children: string;
  readonly delay?: number;
  readonly style?: React.CSSProperties;
}) => {
  const frame = useCurrentFrame();
  if (useContext(Bare)) return null;
  // Each word rises out of its own mask, a beat after the one before; "\n" breaks the line.
  return (
    <h1
      style={{
        margin: 0,
        fontFamily: display,
        fontWeight: 800,
        fontSize: 112,
        lineHeight: 1.0,
        letterSpacing: -3,
        color: "white",
        display: "flex",
        flexWrap: "wrap",
        columnGap: "0.24em",
        ...style,
      }}
    >
      {children
        .replace(/\n/g, " \n ")
        .split(" ")
        .filter(Boolean)
        .map((word, index) =>
          word === "\n" ? (
            <span key={index} style={{ flexBasis: "100%", height: 0 }} />
          ) : (
            <span
              key={index}
              style={{
                display: "inline-block",
                overflow: "hidden",
                paddingBottom: "0.1em",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  translate: `0 ${interpolate(frame - delay - index * 3, [0, 16], [110, 0], { ...clamp, easing: OUT })}%`,
                  rotate: `${interpolate(frame - delay - index * 3, [0, 16], [8, 0], { ...clamp, easing: OUT })}deg`,
                }}
              >
                {word}
              </span>
            </span>
          ),
        )}
    </h1>
  );
};

export const Headline = Interactive.create({
  Component: HeadlineInner,
  layout: "none",
  schema: {
    ...Interactive.textSchema,
    children: { type: "string", default: "Headline", description: "Text" },
  } as const satisfies InteractivitySchema,
});

/** A small supporting line that fades up under a headline. */
export const Kicker = ({
  children,
  delay,
  color = C.onPanelMuted,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  color?: string;
  style?: React.CSSProperties;
}) => {
  const frame = useCurrentFrame();
  if (useContext(Bare)) return null;
  return (
    <div
      style={{
        fontFamily: body,
        fontSize: 44,
        lineHeight: 1.35,
        textWrap: "balance",
        color,
        maxWidth: 720,
        opacity: interpolate(frame, [delay, delay + 14], [0, 1], clamp),
        translate: `0 ${interpolate(frame, [delay, delay + 18], [24, 0], { ...clamp, easing: OUT })}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
