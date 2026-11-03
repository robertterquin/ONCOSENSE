import { Audio } from "@remotion/media";
import { type Ref, useRef } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import {
  Headline,
  Icon,
  type IconName,
  Kicker,
  Phone,
  ScreenTitle,
  TabBar,
} from "../parts";
import { body, C, clamp, display, OUT, POP } from "../theme";
import { Finger, isPressed, sfx, type Touch, useTall } from "../touch";

// Journey's daily check-in, done by hand: tap a mood, drag energy up and pain down,
// save, and the week's moods rise as bars beside the phone.

const MOODS: [IconName, string][] = [
  ["mood-rough", "Rough"],
  ["mood-low", "Low"],
  ["mood-okay", "Okay"],
  ["mood-good", "Good"],
  ["mood-great", "Great"],
];
const PICKED = 3;
const MOOD_TAP = 36;
const ENERGY = { down: 48, up: 64, from: 4, to: 8 };
const PAIN = { down: 72, up: 84, from: 6, to: 2 };
const SAVE = 94;
const CHART = 98;
const WEEK = [3, 2, 3, 4, 3, 4, 4];

// The slider follows the finger while it's held; a tick for each whole step it passes.
const value = (frame: number, drag: typeof ENERGY) =>
  interpolate(frame, [drag.down + 1, drag.up - 1], [drag.from, drag.to], {
    ...clamp,
    easing: OUT,
  });
const stepTicks = (drag: typeof ENERGY) => {
  const ticks: number[] = [];
  for (let f = drag.down; f <= drag.up; f++) {
    if (Math.round(value(f, drag)) !== Math.round(value(f - 1, drag)))
      ticks.push(f);
  }
  return ticks;
};

const Slider = ({
  label,
  drag,
  color,
  thumbRef,
}: {
  label: string;
  drag: typeof ENERGY;
  color: string;
  thumbRef: Ref<HTMLDivElement>;
}) => {
  const frame = useCurrentFrame();
  const v = value(frame, drag);
  const held = frame >= drag.down && frame <= drag.up;
  return (
    <div style={{ padding: "10px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18,
          fontWeight: 500,
        }}
      >
        <span>{label}</span>
        <span style={{ color: held ? C.action : C.muted }}>
          {Math.round(v)} of 10
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 10,
          borderRadius: 5,
          background: C.raised,
          marginTop: 14,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${v * 10}%`,
            borderRadius: 5,
            background: color,
          }}
        />
        <div
          ref={thumbRef}
          style={{
            position: "absolute",
            top: -11,
            left: `calc(${v * 10}% - 16px)`,
            width: 32,
            height: 32,
            borderRadius: 16,
            background: "white",
            boxShadow: "0 2px 8px rgba(34,26,54,0.3)",
            scale: held ? "1.2" : "1",
          }}
        />
      </div>
    </div>
  );
};

const CheckInSceneInner = () => {
  const frame = useCurrentFrame();
  const tall = useTall();
  const good = useRef<HTMLDivElement>(null);
  const energy = useRef<HTMLDivElement>(null);
  const pain = useRef<HTMLDivElement>(null);
  const save = useRef<HTMLDivElement>(null);
  const touches: Touch[] = [
    { target: good, down: MOOD_TAP },
    { target: energy, down: ENERGY.down, up: ENERGY.up },
    { target: pain, down: PAIN.down, up: PAIN.up },
    { target: save, down: SAVE },
  ];
  const picked = frame >= MOOD_TAP;
  const saved = frame >= SAVE + 2;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 980,
          top: tall ? 150 : 230,
          width: tall ? 920 : 820,
        }}
      >
        <Headline name="Headline" delay={6}>
          {"Two taps.\nEvery day."}
        </Headline>
        <Kicker
          delay={22}
          style={{ marginTop: 36, maxWidth: tall ? 920 : 720 }}
        >
          Mood, energy and pain in seconds, then a summary you can bring to your
          doctor.
        </Kicker>
      </div>

      <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
        <Phone
          style={{
            left: tall ? 325 : 260,
            top: tall ? 690 : 100,
            transformOrigin: "50% 0",
            scale: tall ? "1.1" : "1",
            translate: `0 ${interpolate(frame, [0, 26], [900, 0], { ...clamp, easing: OUT })}px`,
            rotate: `y ${interpolate(frame, [0, 40, 135], tall ? [20, 4, -2] : [28, 10, 6], { ...clamp, easing: OUT })}deg`,
          }}
        >
          <ScreenTitle>Check in</ScreenTitle>
          <div
            style={{ padding: "0 24px 14px", fontSize: 20, fontWeight: 500 }}
          >
            How are you feeling?
          </div>
          <div style={{ display: "flex", gap: 8, padding: "0 16px" }}>
            {MOODS.map(([icon, label], i) => {
              const on = picked && i === PICKED;
              return (
                <div
                  key={label}
                  ref={i === PICKED ? good : undefined}
                  style={{
                    flex: 1,
                    height: 92,
                    borderRadius: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontSize: 14,
                    background: on ? C.action : C.raised,
                    color: on ? "white" : C.ink,
                    scale: String(
                      i === PICKED
                        ? interpolate(
                            frame,
                            [MOOD_TAP - 2, MOOD_TAP, MOOD_TAP + 10],
                            [1, 0.88, 1],
                            { ...clamp, easing: POP },
                          )
                        : 1,
                    ),
                    opacity: interpolate(
                      frame,
                      [16 + i * 3, 24 + i * 3],
                      [0, 1],
                      clamp,
                    ),
                  }}
                >
                  <Icon name={icon} size={36} color={on ? "white" : C.action} />
                  {label}
                </div>
              );
            })}
          </div>
          <div style={{ height: 22 }} />
          <Slider
            label="Energy"
            drag={ENERGY}
            color={C.action}
            thumbRef={energy}
          />
          <Slider label="Pain" drag={PAIN} color={C.amberInk} thumbRef={pain} />
          <div
            ref={save}
            style={{
              margin: "22px 16px 0",
              height: 58,
              borderRadius: 29,
              background: saved ? C.help : C.action,
              color: "white",
              fontSize: 19,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              scale: isPressed(frame, { target: save, down: SAVE })
                ? "0.96"
                : "1",
            }}
          >
            {saved ? <Icon name="check" size={24} color="white" /> : null}
            {saved ? "Saved" : "Save check-in"}
          </div>
          <TabBar active={2} />
          <Finger touches={touches} />
        </Phone>
      </div>

      <div
        style={{
          position: "absolute",
          left: tall ? 530 : 620,
          top: tall ? 1520 : 690,
          width: 470,
          padding: "24px 28px",
          borderRadius: 26,
          background: C.surface,
          boxShadow: "0 30px 60px rgba(8,4,30,0.45)",
          fontFamily: body,
          color: C.ink,
          zIndex: 30,
          opacity: interpolate(frame, [CHART, CHART + 8], [0, 1], clamp),
          scale: String(
            interpolate(frame, [CHART, CHART + 14], [0.6, 1], {
              ...clamp,
              easing: POP,
            }),
          ),
          rotate: `${interpolate(frame, [CHART, CHART + 18], [8, 3], { ...clamp, easing: OUT })}deg`,
        }}
      >
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 30 }}>
          How you&apos;ve been
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            height: 130,
            marginTop: 14,
          }}
        >
          {WEEK.map((mood, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: "100%",
                  borderRadius: 8,
                  background: i === WEEK.length - 1 ? C.action : C.raised,
                  height: interpolate(
                    frame,
                    [CHART + 4 + i * 2, CHART + 18 + i * 2],
                    [0, mood * 24],
                    { ...clamp, easing: POP },
                  ),
                }}
              />
              <div style={{ fontSize: 14, color: C.muted }}>{"SMTWTFS"[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <Audio name="Mood" src={sfx("pop")} from={MOOD_TAP + 1} volume={0.4} />
      {stepTicks(ENERGY).map((at) => (
        <Audio
          key={`e${at}`}
          name="Energy step"
          src={sfx("tick")}
          from={at}
          volume={0.35}
        />
      ))}
      {stepTicks(PAIN).map((at) => (
        <Audio
          key={`p${at}`}
          name="Pain step"
          src={sfx("tick")}
          from={at}
          volume={0.35}
        />
      ))}
      <Audio name="Saved" src={sfx("ding")} from={SAVE + 2} volume={0.6} />
      <Audio name="Chart" src={sfx("pop")} from={CHART} volume={0.4} />
    </>
  );
};

export const CheckInScene = Interactive.create({
  Component: CheckInSceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
