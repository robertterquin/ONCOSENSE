import { Audio } from "@remotion/media";
import { type Ref, useRef } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import {
  Headline,
  Icon,
  Kicker,
  Phone,
  Ribbon,
  ScreenTitle,
  TabBar,
} from "../parts";
import { body, C, clamp, display, OUT, POP } from "../theme";
import { Finger, isPressed, sfx, type Touch, useTall } from "../touch";

// Today for someone in treatment: the treatment week card (TreatmentWeekCard.tsx) builds
// itself day by day, a tap opens today's session, and the course's progress pops out.

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
// Sunday Nov 1 to Saturday Nov 7, 2026: check-ins, today's session, a blood test.
const MARKS: string[][] = [
  [C.helpBright],
  [C.helpBright],
  [C.amber],
  [],
  [C.lavender],
  [],
  [],
];
const DAY_AT = (i: number) => 30 + i * 3;
const OPEN = 72;
const CARD = 80;
const COUNT: [number, number] = [84, 100];
// Frames where the session count steps up (0 to 3 over COUNT).
const COUNT_TICKS = [1, 2, 3].map((k) =>
  Math.round(COUNT[0] + ((COUNT[1] - COUNT[0]) * (k - 0.5)) / 3),
);

const Row = ({
  dot,
  title,
  detail,
  accent,
  at,
  pressed = false,
  openRef,
}: {
  dot: string;
  title: string;
  detail: string;
  accent: boolean;
  at: number;
  pressed?: boolean;
  /** The "Open" link, where a tap lands. */
  openRef?: Ref<HTMLDivElement>;
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        borderTop: "1px solid rgba(255,255,255,0.14)",
        padding: "14px 10px",
        margin: "0 -10px",
        borderRadius: 14,
        background: pressed ? "rgba(255,255,255,0.12)" : "transparent",
        opacity: interpolate(frame, [at, at + 10], [0, 1], clamp),
        translate: `${interpolate(frame, [at, at + 14], [40, 0], { ...clamp, easing: OUT })}px 0`,
      }}
    >
      <div
        style={{ width: 10, height: 10, borderRadius: 5, background: dot }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 19, fontWeight: 500, color: "white" }}>
          {title}
        </div>
        <div
          style={{ fontSize: 15, color: accent ? C.lavender : C.onPanelMuted }}
        >
          {detail}
        </div>
      </div>
      <div ref={openRef} style={{ fontSize: 17, color: C.lavender }}>
        Open
      </div>
    </div>
  );
};

const TodaySceneInner = () => {
  const frame = useCurrentFrame();
  const tall = useTall();
  const session = useRef<HTMLDivElement>(null);
  const open: Touch = { target: session, down: OPEN };
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
          {"Your week,\nat a glance."}
        </Headline>
        <Kicker
          delay={22}
          style={{ marginTop: 36, maxWidth: tall ? 920 : 720 }}
        >
          Sessions, appointments and check-ins on one calendar, with what to
          bring and when to rest.
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
          <ScreenTitle>Today</ScreenTitle>
          <div
            style={{
              padding: "0 24px",
              fontSize: 17,
              color: C.muted,
              marginTop: -8,
            }}
          >
            Tuesday, November 3
          </div>
          <div
            style={{
              position: "relative",
              margin: "18px 16px 0",
              padding: 22,
              borderRadius: 30,
              background: C.panel,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              scale: String(
                interpolate(frame, [18, 34], [0.85, 1], {
                  ...clamp,
                  easing: POP,
                }),
              ),
              opacity: interpolate(frame, [18, 26], [0, 1], clamp),
            }}
          >
            <Ribbon
              height={36}
              color={C.lavender}
              weight={18}
              progress={interpolate(frame, [26, 46], [0, 1], clamp)}
              style={{ position: "absolute", right: 20, top: 20 }}
            />
            <div style={{ paddingRight: 40 }}>
              <div
                style={{
                  fontFamily: display,
                  fontWeight: 800,
                  fontSize: 24,
                  color: "white",
                }}
              >
                Today: Chemotherapy, cycle 3 of 6
              </div>
              <div
                style={{ fontSize: 15, color: C.onPanelMuted, marginTop: 4 }}
              >
                At 9:00 AM, Cancer Center. Bring your questions and any notes.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                borderTop: "1px solid rgba(255,255,255,0.14)",
                paddingTop: 12,
              }}
            >
              {DAYS.map((day, i) => {
                const at = DAY_AT(i);
                return (
                  <div
                    key={day}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                      opacity: interpolate(frame, [at, at + 6], [0, 1], clamp),
                      translate: `0 ${interpolate(frame, [at, at + 10], [18, 0], { ...clamp, easing: POP })}px`,
                    }}
                  >
                    <div style={{ fontSize: 13, color: C.onPanelMuted }}>
                      {day}
                    </div>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 17,
                        fontWeight: 500,
                        background: i === 2 ? C.lavender : "transparent",
                        color: i === 2 ? C.panel : "white",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div style={{ display: "flex", gap: 3, height: 7 }}>
                      {MARKS[i].map((color) => (
                        <div
                          key={color}
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            background: color,
                            scale: String(
                              interpolate(frame, [at + 12, at + 20], [0, 1], {
                                ...clamp,
                                easing: POP,
                              }),
                            ),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <Row
                openRef={session}
                dot={C.amber}
                title="Chemotherapy"
                detail="Today, 9:00 AM · Plan some rest after"
                accent
                at={50}
                pressed={isPressed(frame, { ...open, up: OPEN + 6 })}
              />
              <Row
                dot={C.lavender}
                title="Blood test"
                detail="Nov 5, 8:00 AM, Laboratory"
                accent={false}
                at={56}
              />
            </div>
          </div>
          <div
            style={{
              margin: "16px 16px 0",
              padding: 20,
              borderRadius: 24,
              background: C.surface,
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: interpolate(frame, [62, 72], [0, 1], clamp),
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: C.raised,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="mood-good" size={30} color={C.action} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 500 }}>
                Daily check-in
              </div>
              <div style={{ fontSize: 15, color: C.muted }}>
                How are you feeling today?
              </div>
            </div>
          </div>
          <TabBar active={0} />
          <Finger touches={[open]} />
        </Phone>
      </div>

      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 940,
          top: tall ? 1530 : 760,
          width: 470,
          padding: "22px 26px",
          borderRadius: 26,
          background: C.surface,
          boxShadow: "0 30px 60px rgba(8,4,30,0.45)",
          fontFamily: body,
          color: C.ink,
          zIndex: 30,
          opacity: interpolate(frame, [CARD, CARD + 8], [0, 1], clamp),
          scale: String(
            interpolate(frame, [CARD, CARD + 14], [0.6, 1], {
              ...clamp,
              easing: POP,
            }),
          ),
          rotate: `${interpolate(frame, [CARD, CARD + 18], [-8, -3], { ...clamp, easing: OUT })}deg`,
        }}
      >
        <div style={{ fontSize: 18, color: C.muted }}>Chemotherapy</div>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 36 }}>
          {Math.round(interpolate(frame, COUNT, [0, 3], clamp))} of 6 sessions
          done
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 10,
                borderRadius: 5,
                background: C.raised,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: C.action,
                  width: `${interpolate(frame, [COUNT[0] + i * 6, COUNT[0] + 6 + i * 6], [0, i < 3 ? 100 : 0], clamp)}%`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <Audio name="Card" src={sfx("pop")} from={18} volume={0.35} />
      {DAYS.map((day, i) => (
        <Audio
          key={day}
          name={`Day ${day}`}
          src={sfx("tick")}
          from={DAY_AT(i)}
          volume={0.18}
        />
      ))}
      <Audio name="Progress" src={sfx("pop")} from={CARD} volume={0.5} />
      {COUNT_TICKS.map((at) => (
        <Audio
          key={at}
          name="Count"
          src={sfx("tick")}
          from={at}
          volume={0.35}
        />
      ))}
    </>
  );
};

export const TodayScene = Interactive.create({
  Component: TodaySceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
