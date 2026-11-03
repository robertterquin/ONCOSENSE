import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { Icon, type IconName } from "../parts";
import { body, C, clamp, display, OUT } from "../theme";
import { useTall } from "../touch";

// The five tabs as a beat: one word a cut, on the music's beat (15 frames at 120 BPM),
// each in its own corner of the palette, with the tab bar filling in underneath.

const BEAT = 15;

const TABS: {
  label: string;
  icon: IconName;
  bg: string;
  fg: string;
  line: string;
}[] = [
  {
    label: "Today",
    icon: "home",
    bg: C.panel,
    fg: "white",
    line: "Your day, your checks, your week",
  },
  {
    label: "Learn",
    icon: "book",
    bg: C.ground,
    fg: C.ink,
    line: "Signs, screening and self-checks",
  },
  {
    label: "Journey",
    icon: "activity",
    bg: C.action,
    fg: "white",
    line: "Mood, pain, energy and treatment",
  },
  {
    label: "Community",
    icon: "users",
    bg: C.night,
    fg: C.lavender,
    line: "Questions answered by people who know",
  },
  {
    label: "Help",
    icon: "life-buoy",
    bg: C.help,
    fg: "white",
    line: "Hotlines, costs and support near you",
  },
];

const TabsSceneInner = () => {
  const frame = useCurrentFrame();
  const tall = useTall();
  const index = Math.min(TABS.length - 1, Math.floor(frame / BEAT));
  const local = frame - index * BEAT;
  const tab = TABS[index];
  return (
    <div style={{ position: "absolute", inset: 0, background: tab.bg }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: tall ? "column" : "row",
            alignItems: "center",
            gap: tall ? 30 : 48,
            scale: String(
              interpolate(local, [0, 10], [1.18, 1], { ...clamp, easing: OUT }),
            ),
            filter: `blur(${interpolate(local, [0, 5], [10, 0], clamp)}px)`,
          }}
        >
          <Icon
            name={tab.icon}
            size={tall ? 200 : 220}
            color={tab.fg}
            style={{
              rotate: `${interpolate(local, [0, 12], [-25, 0], { ...clamp, easing: OUT })}deg`,
            }}
          />
          <div
            style={{
              fontFamily: display,
              fontWeight: 800,
              fontSize: tall ? 172 : 260,
              letterSpacing: tall ? -6 : -9,
              lineHeight: 1,
              color: tab.fg,
            }}
          >
            {tab.label}
          </div>
        </div>
        <div
          style={{
            fontFamily: body,
            fontSize: tall ? 48 : 46,
            textAlign: "center",
            color: tab.fg,
            opacity: interpolate(local, [3, 9], [0, 0.85], clamp),
          }}
        >
          {tab.line}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: tall ? 160 : 100,
          display: "flex",
          justifyContent: "center",
          gap: 22,
        }}
      >
        {TABS.map((item, i) => (
          <div
            key={item.label}
            style={{
              width: i === index ? 120 : 26,
              height: 12,
              borderRadius: 6,
              background: tab.fg,
              opacity: i <= index ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const TabsScene = Interactive.create({
  Component: TabsSceneInner,
  layout: "absolute-fill",
});
