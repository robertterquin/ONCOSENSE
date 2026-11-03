import { Audio } from "@remotion/media";
import { useRef } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { Headline, Icon, type IconName } from "../parts";
import { body, C, clamp, OUT, POP } from "../theme";
import { Finger, isPressed, sfx, type Touch, useTall } from "../touch";

// Help, in the app's teal for help and calling: the sections slide in, and a tap on
// the call button starts it ringing.

const SECTIONS: [IconName, string, string][] = [
  ["phone", "Hotlines", "Talk to someone today"],
  ["shield", "Help with costs", "PhilHealth and other programs"],
  ["users", "Support groups", "Near you or online"],
  ["hospital", "Screening centers", "Find one in your region"],
];
const CALL = 36;
const RING = CALL + 2;
const LOOP = 30;

const HelpSceneInner = () => {
  const frame = useCurrentFrame();
  const tall = useTall();
  const button = useRef<HTMLDivElement>(null);
  const touches: Touch[] = [{ target: button, down: CALL }];
  const ringing = frame >= RING;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 140,
          top: tall ? 150 : 150,
          width: tall ? 920 : 900,
        }}
      >
        <Headline name="Headline" delay={6}>
          {"Help is one\ntap away."}
        </Headline>
      </div>
      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 140,
          top: tall ? 1270 : 470,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {SECTIONS.map(([icon, title, line], i) => {
          const at = 18 + i * 5;
          return (
            <div
              key={title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "18px 26px",
                borderRadius: 26,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.16)",
                fontFamily: body,
                color: "white",
                width: tall ? 920 : 760,
                boxSizing: "border-box",
                opacity: interpolate(frame, [at, at + 8], [0, 1], clamp),
                translate: `${interpolate(frame, [at, at + 18], [-120, 0], { ...clamp, easing: OUT })}px 0`,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: C.helpTint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={icon} size={38} color={C.help} />
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 24, color: C.helpTint, opacity: 0.85 }}>
                  {line}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          // Placed by left/top, not a translate: the finger measures layout offsets.
          position: "absolute",
          left: (tall ? 540 : 1400) - 300,
          top: tall ? 585 : 265,
          width: 600,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((ring) => {
          // Rings leave the button one after another, on a loop, once it's tapped.
          const since = frame - RING - ring * 10;
          const t = since % LOOP;
          return (
            <div
              key={ring}
              style={{
                position: "absolute",
                top: 0,
                width: 320,
                height: 320,
                borderRadius: 160,
                border: `4px solid ${C.helpBright}`,
                opacity:
                  since < 0 ? 0 : interpolate(t, [0, LOOP], [0.8, 0], clamp),
                scale: String(
                  interpolate(t, [0, LOOP], [1, 2.1], {
                    ...clamp,
                    easing: OUT,
                  }),
                ),
              }}
            />
          );
        })}
        <div
          ref={button}
          style={{
            width: 320,
            height: 320,
            borderRadius: 160,
            background: ringing ? C.helpBright : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 40px 80px rgba(0,30,26,0.45)",
            scale: String(
              interpolate(frame, [8, 24], [0, 1], { ...clamp, easing: POP }) *
                (isPressed(frame, { target: button, down: CALL }) ? 0.93 : 1),
            ),
          }}
        >
          <Icon
            name="phone"
            size={150}
            color={ringing ? "#04332F" : C.help}
            style={{
              rotate: `${ringing ? Math.sin(frame / 1.6) * interpolate((frame - RING) % LOOP, [0, 8, 16], [0, 14, 0], clamp) : 0}deg`,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 60,
            padding: "20px 44px",
            borderRadius: 44,
            background: ringing ? "white" : C.helpBright,
            color: "#04332F",
            fontFamily: body,
            fontSize: 44,
            fontWeight: 800,
            opacity: interpolate(frame, [18, 26], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [18, 32], [30, 0], { ...clamp, easing: OUT })}px`,
          }}
        >
          {ringing ? "Calling 1555…" : "Call 1555"}
        </div>
      </div>

      <Finger touches={touches} size={96} />
      <Audio name="Button" src={sfx("pop")} from={10} volume={0.4} />
      {SECTIONS.map(([, title], i) => (
        <Audio
          key={title}
          name="Row"
          src={sfx("tick")}
          from={18 + i * 5}
          volume={0.2}
        />
      ))}
      <Audio name="Ring" src={sfx("ring")} from={RING} volume={0.45} />
    </>
  );
};

export const HelpScene = Interactive.create({
  Component: HelpSceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
