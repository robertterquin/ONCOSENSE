import { Audio } from "@remotion/media";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { Kicker, Ribbon } from "../parts";
import { body, C, clamp, display, IN_OUT, OUT, POP } from "../theme";
import { sfx, useTall } from "../touch";

// Open and close: the ribbon traces itself as one line, steps aside (up, in portrait),
// and the name slides out from behind it.

const TRACED = 38;

const LogoSceneInner = ({
  tagline,
  footnote,
}: {
  readonly tagline: string;
  readonly footnote: string;
}) => {
  const frame = useCurrentFrame();
  const tall = useTall();
  const word = tall
    ? { size: 168, width: 820, height: 190 }
    : { size: 196, width: 980, height: 0 };
  const gap = 40;
  // How far the ribbon starts from its place in the lockup, so it starts centered.
  const offset = tall ? (word.height + gap) / 2 : (word.width + gap) / 2;
  const step = interpolate(frame, [36, 58], [offset, 0], {
    ...clamp,
    easing: IN_OUT,
  });
  return (
    <>
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.panelTop} 0%, rgba(65,48,154,0) 62%)`,
          opacity: interpolate(frame, [0, 40], [0, 0.9], clamp),
          scale: String(interpolate(frame, [0, 120], [0.7, 1.1], clamp)),
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: tall ? "column" : "row",
          alignItems: "center",
          gap,
          translate: `0 ${interpolate(frame, [40, 62], [0, tall ? -140 : -60], { ...clamp, easing: IN_OUT })}px`,
        }}
      >
        <Ribbon
          height={tall ? 280 : 300}
          color={C.lavender}
          weight={20}
          progress={interpolate(frame, [4, TRACED], [0, 1], {
            ...clamp,
            easing: IN_OUT,
          })}
          style={{
            translate: tall ? `0 ${step}px` : `${step}px 0`,
            scale: String(
              interpolate(frame, [34, 44], [1.12, 1], {
                ...clamp,
                easing: POP,
              }),
            ),
          }}
        />
        <div
          style={{
            width: word.width,
            textAlign: tall ? "center" : "left",
            fontFamily: display,
            fontWeight: 800,
            fontSize: word.size,
            lineHeight: 1,
            letterSpacing: -6,
            whiteSpace: "nowrap",
            color: "white",
            clipPath: `inset(-20% ${interpolate(frame, [40, 62], [100, 0], { ...clamp, easing: IN_OUT })}% -20% 0)`,
            translate: `${interpolate(frame, [40, 62], [-120, 0], { ...clamp, easing: OUT })}px 0`,
          }}
        >
          OncoSense
        </div>
      </div>
      <Kicker
        delay={56}
        style={{
          position: "absolute",
          top: tall ? 1290 : 720,
          left: tall ? 80 : undefined,
          right: tall ? 80 : undefined,
          maxWidth: tall ? undefined : 1180,
          fontSize: tall ? 48 : 44,
          textAlign: "center",
        }}
      >
        {tagline}
      </Kicker>
      <div
        style={{
          position: "absolute",
          bottom: tall ? 140 : 90,
          fontFamily: body,
          fontSize: 26,
          color: C.lavender,
          opacity: interpolate(frame, [70, 84], [0, 0.75], clamp),
        }}
      >
        {footnote}
      </div>
      <Audio name="Bloom" src={sfx("bloom")} from={TRACED - 2} volume={0.7} />
    </>
  );
};

export const LogoScene = Interactive.create({
  Component: LogoSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    tagline: { type: "string", default: "", description: "Tagline" },
    footnote: { type: "string", default: "", description: "Footnote" },
  },
});
