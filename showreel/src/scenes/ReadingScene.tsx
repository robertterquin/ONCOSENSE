import { Audio } from "@remotion/media";
import { useRef } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { Headline, Icon, type IconName, Kicker } from "../parts";
import { body, C, clamp, display, IN_OUT, OUT } from "../theme";
import { Finger, sfx, type Touch, useTall } from "../touch";

// Display settings: a tap on each option wipes the same check-in card from light to
// dark to Easier reading (darkPalette and highContrastDarkPalette in the app).

type Theme = {
  name: string;
  bg: string;
  ink: string;
  muted: string;
  tile: string;
  action: string;
  onAction: string;
  scale: number;
};

const THEMES: Theme[] = [
  {
    name: "Light",
    bg: "#FFFFFF",
    ink: "#221A36",
    muted: "#5D5672",
    tile: "#E0D8F5",
    action: "#5236B5",
    onAction: "#FFFFFF",
    scale: 1,
  },
  {
    name: "Dark",
    bg: "#231D37",
    ink: "#EDE9F7",
    muted: "#A9A1BF",
    tile: "#2F2747",
    action: "#B4A3F5",
    onAction: "#15111F",
    scale: 1,
  },
  {
    name: "Easier reading",
    bg: "#000000",
    ink: "#FFFFFF",
    muted: "#D6D0EA",
    tile: "#221D30",
    action: "#D4C7FF",
    onAction: "#000000",
    scale: 1.12,
  },
];
const MOODS: IconName[] = [
  "mood-rough",
  "mood-low",
  "mood-okay",
  "mood-good",
  "mood-great",
];
const TAPS = [30, 64];
const wipeStart = (i: number) => TAPS[i] + 2;

const Card = ({ theme }: { theme: Theme }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: 44,
      padding: 48,
      background: theme.bg,
      color: theme.ink,
      fontFamily: body,
      display: "flex",
      flexDirection: "column",
      gap: 26 * theme.scale,
    }}
  >
    <div
      style={{
        fontFamily: display,
        fontWeight: 800,
        fontSize: 48 * theme.scale,
      }}
    >
      Daily check-in
    </div>
    <div style={{ fontSize: 30 * theme.scale, color: theme.muted }}>
      How are you feeling today?
    </div>
    <div style={{ display: "flex", gap: 14 }}>
      {MOODS.map((mood) => (
        <div
          key={mood}
          style={{
            flex: 1,
            height: 100,
            borderRadius: 26,
            background: theme.tile,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={mood} size={52 * theme.scale} color={theme.action} />
        </div>
      ))}
    </div>
    <div
      style={{
        marginTop: "auto",
        height: 84,
        borderRadius: 42,
        background: theme.action,
        color: theme.onAction,
        fontSize: 30 * theme.scale,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Check in for today
    </div>
  </div>
);

const ReadingSceneInner = () => {
  const frame = useCurrentFrame();
  const tall = useTall();
  const dark = useRef<HTMLDivElement>(null);
  const easier = useRef<HTMLDivElement>(null);
  const touches: Touch[] = [
    { target: dark, down: TAPS[0] },
    { target: easier, down: TAPS[1] },
  ];
  const active = frame < TAPS[0] ? 0 : frame < TAPS[1] ? 1 : 2;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 140,
          top: tall ? 150 : 320,
          width: tall ? 920 : 780,
        }}
      >
        <Headline name="Headline" delay={4}>
          {"Easier reading,\nbuilt in."}
        </Headline>
        <Kicker
          delay={18}
          style={{ marginTop: 36, maxWidth: tall ? 920 : 720 }}
        >
          Light, dark and a high-contrast mode with larger text for chemo-brain
          days.
        </Kicker>
      </div>

      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 1020,
          top: tall ? 720 : 200,
          width: tall ? 920 : 760,
          height: tall ? 600 : 560,
          borderRadius: 44,
          boxShadow: "0 50px 100px rgba(8,4,30,0.5)",
          translate: `0 ${interpolate(frame, [0, 20], [120, 0], { ...clamp, easing: OUT })}px`,
          opacity: interpolate(frame, [0, 8], [0, 1], clamp),
        }}
      >
        <Card theme={THEMES[0]} />
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `inset(0 0 0 ${interpolate(frame, [wipeStart(i - 1), wipeStart(i - 1) + 16], [100, 0], { ...clamp, easing: IN_OUT })}% round 44px)`,
            }}
          >
            <Card theme={THEMES[i]} />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 1020,
          right: tall ? 80 : undefined,
          top: tall ? 1400 : 810,
          display: "flex",
          justifyContent: tall ? "center" : "flex-start",
          gap: 16,
          fontFamily: body,
          opacity: interpolate(frame, [10, 18], [0, 1], clamp),
        }}
      >
        {THEMES.map((theme, i) => (
          <div
            key={theme.name}
            ref={i === 1 ? dark : i === 2 ? easier : undefined}
            style={{
              padding: "16px 30px",
              borderRadius: 34,
              fontSize: tall ? 34 : 28,
              fontWeight: 500,
              background: i === active ? C.lavender : "rgba(255,255,255,0.08)",
              color: i === active ? C.panel : C.onPanelMuted,
              border: `1px solid ${i === active ? C.lavender : "rgba(255,255,255,0.2)"}`,
            }}
          >
            {theme.name}
          </div>
        ))}
      </div>

      <Finger touches={touches} size={80} />
      {TAPS.map((at) => (
        <Audio
          key={at}
          name="Switch theme"
          src={sfx("toggle")}
          from={at + 1}
          volume={0.45}
        />
      ))}
    </>
  );
};

export const ReadingScene = Interactive.create({
  Component: ReadingSceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
