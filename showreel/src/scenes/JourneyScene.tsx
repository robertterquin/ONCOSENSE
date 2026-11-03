import { Audio } from "@remotion/media";
import { useRef } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { Headline, Icon, Kicker, Phone, ScreenTitle, TabBar } from "../parts";
import { C, clamp, display, IN_OUT, OUT, POP } from "../theme";
import { Finger, isPressed, sfx, type Touch, useTall } from "../touch";

// Journey in treatment ((tabs)/journey.tsx): "This week" as the ribbon thread
// (ThreadWeek.tsx), energy and pain over the last 7 days (Dashboard.tsx), then a tap on
// "Share with my doctor" brings up the summary (journey/summary.tsx).

// Monday to Sunday, Wednesday Nov 4 is today; Monday and Tuesday are checked in.
const LABELS = ["M", "T", "Today", "T", "F", "S", "S"];
const CHECKED = [true, true, false, false, false, false, false];
const TODAY = 2;
// Energy and pain for the last 7 days, 0 to 10.
const WEEK: [number, number][] = [
  [6, 4],
  [5, 5],
  [7, 3],
  [6, 3],
  [8, 2],
  [7, 3],
  [8, 2],
];
const SHARE = 80;
const SHEET = SHARE + 4;
const SEND = 112;

const thread = (width: number) => {
  const step = (width - 32) / 6;
  const x = (i: number) => 16 + i * step;
  return Array.from({ length: 6 }, (_, i) => {
    const y = 32 + (i % 2 ? 20 : -20);
    return `M ${x(i)} 32 C ${x(i) + step * 0.4} ${y}, ${x(i + 1) - step * 0.4} ${y}, ${x(i + 1)} 32`;
  });
};

const Section = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div style={{ padding: "0 24px" }}>
    <div style={{ fontFamily: display, fontWeight: 800, fontSize: 22 }}>
      {title}
    </div>
    <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>{subtitle}</div>
  </div>
);

const JourneySceneInner = () => {
  const frame = useCurrentFrame();
  const tall = useTall();
  const share = useRef<HTMLDivElement>(null);
  const send = useRef<HTMLDivElement>(null);
  const touches: Touch[] = [
    { target: share, down: SHARE },
    { target: send, down: SEND },
  ];
  const width = 402;
  const step = (width - 32) / 6;
  const sheet = interpolate(frame, [SHEET, SHEET + 18], [100, 0], {
    ...clamp,
    easing: OUT,
  });
  const energy = interpolate(frame, [36, 56], [0, 7], clamp);
  const pain = interpolate(frame, [36, 56], [0, 3], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 140,
          top: tall ? 150 : 300,
          width: tall ? 920 : 860,
        }}
      >
        <Headline name="Headline" delay={6}>
          {"See how\nyou're doing."}
        </Headline>
        <Kicker
          delay={22}
          style={{ marginTop: 36, maxWidth: tall ? 920 : 720 }}
        >
          Check-ins become a week you can see, and a summary your doctor can
          read.
        </Kicker>
      </div>

      <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
        <Phone
          style={{
            left: tall ? 325 : 1230,
            top: tall ? 690 : 100,
            transformOrigin: "50% 0",
            scale: tall ? "1.1" : "1",
            translate: `0 ${interpolate(frame, [0, 26], [900, 0], { ...clamp, easing: OUT })}px`,
            rotate: `y ${interpolate(frame, [0, 40, 135], tall ? [-20, -4, 2] : [-28, -10, -6], { ...clamp, easing: OUT })}deg`,
          }}
        >
          <ScreenTitle>Journey</ScreenTitle>
          <div
            style={{
              padding: "0 24px",
              fontSize: 16,
              color: C.muted,
              marginTop: -8,
            }}
          >
            Breast cancer · In treatment
          </div>

          <div style={{ marginTop: 22 }}>
            <Section
              title="This week"
              subtitle={`${CHECKED.filter(Boolean).length} of 7 days checked in`}
            />
            <svg
              width={width}
              height={64}
              style={{ display: "block", marginTop: 8 }}
            >
              {thread(width).map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke={i < TODAY ? C.action : C.line}
                  strokeWidth={4}
                  strokeLinecap="round"
                  fill="none"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={
                    1 -
                    interpolate(frame, [14 + i * 4, 22 + i * 4], [0, 1], {
                      ...clamp,
                      easing: IN_OUT,
                    })
                  }
                />
              ))}
              {LABELS.map((label, i) => {
                const cx = 16 + i * step;
                const r = i === TODAY ? 14 : 11;
                const pop = interpolate(
                  frame,
                  [18 + i * 4, 28 + i * 4],
                  [0, 1],
                  { ...clamp, easing: POP },
                );
                return (
                  <g
                    key={i}
                    style={{
                      transformOrigin: `${cx}px 32px`,
                      scale: String(pop),
                    }}
                  >
                    <circle
                      cx={cx}
                      cy={32}
                      r={r}
                      fill={CHECKED[i] ? C.action : C.surface}
                      stroke={
                        i === TODAY ? C.action : i > TODAY ? C.line : C.border
                      }
                      strokeWidth={i === TODAY ? 3 : 2}
                    />
                    {CHECKED[i] ? (
                      <path
                        d={`M ${cx - 5} 32 l 3.5 3.5 l 6.5 -7`}
                        stroke="white"
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : null}
                  </g>
                );
              })}
            </svg>
            <div style={{ position: "relative", height: 20 }}>
              {LABELS.map((label, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 16 + i * step - 28,
                    width: 56,
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: i === TODAY ? C.action : C.muted,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Section title="Energy and pain" subtitle="Last 7 days, 0 to 10" />
            <div style={{ display: "flex", gap: 10, padding: "12px 16px 0" }}>
              {[
                {
                  label: "Energy, 7 days",
                  value: energy,
                  detail: "Up from last week",
                  tone: C.ink,
                },
                {
                  label: "Pain, 7 days",
                  value: pain,
                  detail: "Down from last week",
                  tone: C.amberInk,
                },
              ].map((tile) => (
                <div
                  key={tile.label}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: 20,
                    background: C.surface,
                    opacity: interpolate(frame, [32, 40], [0, 1], clamp),
                  }}
                >
                  <div style={{ fontSize: 13, color: C.muted }}>
                    {tile.label}
                  </div>
                  <div
                    style={{
                      fontFamily: display,
                      fontWeight: 800,
                      fontSize: 26,
                      color: tile.tone,
                    }}
                  >
                    {Math.round(tile.value)}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {tile.detail}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                margin: "10px 16px 0",
                padding: "14px 16px 10px",
                borderRadius: 20,
                background: C.surface,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 10,
                  height: 96,
                }}
              >
                {WEEK.map(([e, p], i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 3,
                      height: "100%",
                    }}
                  >
                    {[
                      [e, C.action],
                      [p, C.amberInk],
                    ].map(([v, color], j) => (
                      <div
                        key={j}
                        style={{
                          flex: 1,
                          borderRadius: 4,
                          background: color as string,
                          height: `${interpolate(frame, [44 + i * 3, 58 + i * 3], [0, (v as number) * 10], { ...clamp, easing: POP })}%`,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                {["T", "F", "S", "S", "M", "T", "W"].map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.muted,
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            ref={share}
            style={{
              margin: "16px 16px 0",
              height: 54,
              borderRadius: 27,
              border: `1px solid ${C.line}`,
              background: isPressed(frame, { target: share, down: SHARE })
                ? C.raised
                : C.surface,
              color: C.action,
              fontSize: 18,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: interpolate(frame, [60, 68], [0, 1], clamp),
            }}
          >
            <Icon name="share" size={22} color={C.action} />
            Share with my doctor
          </div>
          <TabBar active={2} />

          {/* The summary sheet. */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 560,
              padding: "26px 24px",
              borderRadius: "34px 34px 0 0",
              background: C.surface,
              boxShadow: "0 -20px 60px rgba(34,26,54,0.25)",
              translate: `0 ${sheet}%`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: 44,
                height: 5,
                borderRadius: 3,
                background: C.line,
                margin: "-10px auto 18px",
              }}
            />
            <div style={{ fontFamily: display, fontWeight: 800, fontSize: 28 }}>
              Summary for your doctor
            </div>
            <div
              style={{
                fontSize: 15,
                color: C.muted,
                marginTop: 6,
                lineHeight: 1.4,
              }}
            >
              A standardized clinical PDF you can send or print. Nothing is
              shared until you choose where.
            </div>
            {[
              ["Energy", "Better over the period"],
              ["Pain", "Better over the period"],
              ["Chemotherapy", "3 of 6 sessions"],
            ].map(([title, detail], i) => (
              <div
                key={title}
                style={{
                  marginTop: i ? 10 : 20,
                  padding: "12px 16px",
                  borderRadius: 18,
                  background: C.ground,
                  opacity: interpolate(
                    frame,
                    [SHEET + 10 + i * 4, SHEET + 18 + i * 4],
                    [0, 1],
                    clamp,
                  ),
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 14, color: C.muted }}>{detail}</div>
              </div>
            ))}
            <div
              ref={send}
              style={{
                marginTop: 22,
                height: 56,
                borderRadius: 28,
                background: frame >= SEND + 2 ? C.help : C.action,
                color: "white",
                fontSize: 18,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                scale: isPressed(frame, { target: send, down: SEND })
                  ? "0.96"
                  : "1",
              }}
            >
              <Icon
                name={frame >= SEND + 2 ? "check" : "share"}
                size={22}
                color="white"
              />
              {frame >= SEND + 2 ? "PDF ready to share" : "Share PDF"}
            </div>
          </div>
          <Finger touches={touches} />
        </Phone>
      </div>

      <Audio name="Thread" src={sfx("pop")} from={14} volume={0.3} />
      <Audio name="Sheet" src={sfx("whoosh")} from={SHEET - 2} volume={0.18} />
      <Audio name="Ready" src={sfx("ding")} from={SEND + 2} volume={0.55} />
    </>
  );
};

export const JourneyScene = Interactive.create({
  Component: JourneySceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
