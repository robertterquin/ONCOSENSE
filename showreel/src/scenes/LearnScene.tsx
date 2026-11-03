import { Audio } from "@remotion/media";
import { useRef } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { Headline, Icon, type IconName, Kicker } from "../parts";
import { body, C, clamp, display, OUT, POP } from "../theme";
import { Finger, isPressed, sfx, type Touch, useTall } from "../touch";

// Learn: the cancer types cascade in as tiles, a tap on Breast opens its self-check
// guide, and a tap on Next moves it to the second step.

const TYPES: [IconName, string][] = [
  ["breast", "Breast"],
  ["cervix", "Cervical"],
  ["colon", "Colorectal"],
  ["lungs", "Lung"],
  ["liver", "Liver"],
  ["prostate", "Prostate"],
  ["skin-check", "Skin"],
  ["thyroid", "Thyroid"],
  ["ovaries", "Ovarian"],
  ["stomach", "Stomach"],
  ["blood-cells", "Leukemia"],
  ["testicular", "Testicular"],
];
const PICK = 50;
const GUIDE = PICK + 6;
const NEXT_TAP = 88;
const NEXT = NEXT_TAP + 2;
// The first two steps of a breast self-exam (looking, before feeling).
const STEPS = [
  "Stand at a mirror with your arms at your sides. Look for changes in size, shape or skin.",
  "Now raise your arms high and look for the same changes.",
];

const LearnSceneInner = () => {
  const frame = useCurrentFrame();
  const tall = useTall();
  const breast = useRef<HTMLDivElement>(null);
  const next = useRef<HTMLDivElement>(null);
  const touches: Touch[] = [
    { target: breast, down: PICK },
    { target: next, down: NEXT_TAP },
  ];
  const columns = tall ? 3 : 4;
  const step = frame < NEXT ? 0 : 1;
  const stepStart = step ? NEXT : GUIDE + 8;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 140,
          top: tall ? 150 : 300,
          width: tall ? 920 : 760,
        }}
      >
        <Headline name="Headline" delay={6} style={{ color: C.ink }}>
          {"Know the\nearly signs."}
        </Headline>
        <Kicker
          delay={22}
          color={C.muted}
          style={{ marginTop: 36, maxWidth: tall ? 920 : 720 }}
        >
          Cancer types, their early signs and screening, and step-by-step
          self-checks.
        </Kicker>
      </div>

      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 960,
          top: tall ? 720 : 150,
          width: tall ? 920 : 820,
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 20,
          filter: `blur(${interpolate(frame, [GUIDE, GUIDE + 14], [0, 8], clamp)}px)`,
          opacity: interpolate(frame, [GUIDE, GUIDE + 14], [1, 0.45], clamp),
        }}
      >
        {TYPES.map(([icon, label], i) => {
          const at = 4 + ((i % columns) + Math.floor(i / columns)) * 4;
          const picked =
            i === 0 &&
            isPressed(frame, { target: breast, down: PICK, up: PICK + 6 });
          return (
            <div
              key={label}
              ref={i === 0 ? breast : undefined}
              style={{
                height: tall ? 200 : 220,
                borderRadius: 32,
                background: picked ? C.raised : C.surface,
                border: `1px solid ${picked ? C.action : C.line}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                fontFamily: body,
                fontSize: 26,
                fontWeight: 600,
                color: C.ink,
                opacity: interpolate(frame, [at, at + 6], [0, 1], clamp),
                scale: String(
                  interpolate(frame, [at, at + 14], [0.5, 1], {
                    ...clamp,
                    easing: POP,
                  }) * (picked ? 0.94 : 1),
                ),
                rotate: `${interpolate(frame, [at, at + 14], [i % 2 ? 10 : -10, 0], { ...clamp, easing: OUT })}deg`,
              }}
            >
              <div
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 30,
                  background: C.raised,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={icon} size={64} color={C.action} />
              </div>
              {label}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 1010,
          top: tall ? 820 : 230,
          width: tall ? 920 : 720,
          padding: 48,
          borderRadius: 44,
          background: C.surface,
          boxShadow: "0 50px 100px rgba(34,26,54,0.28)",
          fontFamily: body,
          color: C.ink,
          zIndex: 2,
          opacity: interpolate(frame, [GUIDE, GUIDE + 8], [0, 1], clamp),
          translate: `0 ${interpolate(frame, [GUIDE, GUIDE + 20], [260, 0], { ...clamp, easing: OUT })}px`,
          rotate: `${interpolate(frame, [GUIDE, GUIDE + 20], [6, 0], { ...clamp, easing: OUT })}deg`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 24,
              background: C.raised,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="breast" size={48} color={C.action} />
          </div>
          <div>
            <div style={{ fontFamily: display, fontWeight: 800, fontSize: 44 }}>
              Breast self-exam
            </div>
            <div style={{ fontSize: 24, color: C.muted }}>
              Step {step + 1} of 5 · Once a month
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 34 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 12,
                borderRadius: 6,
                background: C.raised,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: C.action,
                  width: `${i > 1 ? 0 : interpolate(frame, i ? [NEXT, NEXT + 10] : [GUIDE + 12, GUIDE + 22], [0, 100], clamp)}%`,
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 32,
            lineHeight: 1.4,
            marginTop: 30,
            minHeight: 135,
            opacity: interpolate(frame - stepStart, [0, 10], [0, 1], clamp),
            translate: `${interpolate(frame - stepStart, [0, 14], [40, 0], { ...clamp, easing: OUT })}px 0`,
          }}
        >
          {STEPS[step]}
        </div>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
        >
          <div
            ref={next}
            style={{
              padding: "18px 40px",
              borderRadius: 36,
              background: C.action,
              color: "white",
              fontSize: 28,
              fontWeight: 800,
              scale: isPressed(frame, { target: next, down: NEXT_TAP })
                ? "0.95"
                : "1",
            }}
          >
            Next step
          </div>
        </div>
      </div>

      <Finger touches={touches} size={84} />
      {TYPES.map(([, label], i) =>
        i % 3 === 0 ? (
          <Audio
            key={label}
            name="Tile"
            src={sfx("tick")}
            from={4 + i}
            volume={0.2}
          />
        ) : null,
      )}
      <Audio name="Guide" src={sfx("pop")} from={GUIDE} volume={0.45} />
      <Audio name="Step" src={sfx("tick")} from={NEXT} volume={0.4} />
    </>
  );
};

export const LearnScene = Interactive.create({
  Component: LearnSceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
