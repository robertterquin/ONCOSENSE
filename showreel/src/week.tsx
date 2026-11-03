import { interpolate, useCurrentFrame } from "remotion";
import { body, C, clamp, display, IN_OUT, OUT, POP } from "./theme";
import { useTall } from "./touch";

// "A week with OncoSense": the app's week strip (WeekStrip in CalendarCard.tsx) is the
// reel's timeline, Sunday 1 to Saturday 7 November 2026, the same week as the Today
// scene. The highlight walks a day at a time, a dot lands when that day's moment
// happens, and each day carries one line of what it was for.

/** 100 BPM in 3/4: a beat is 18 frames, a bar 54; each day is two bars. */
export const BEAT = 18;
export const INTRO = 3 * BEAT;
export const DAY = 6 * BEAT;
export const dayStart = (d: number) => INTRO + d * DAY;
export const SATURDAY = dayStart(6);
export const LOGO = SATURDAY + DAY;

export type DayNote = {
  name: string;
  line: string;
  /** What got done that day, for Saturday's look back. */
  recap: string;
  dot: string;
  doneAt: number;
};

const LETTERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const SIZE = 72;

/** Where the strip sits and how big: centered for the intro, on top through the days, and
 * a little lower on Saturday with the week's list under it. */
const useStripPlace = (frame: number) => {
  const tall = useTall();
  const top = tall ? 175 : 100;
  const middle = tall ? 860 : 470;
  const saturday = tall ? 400 : 210;
  const toTop = interpolate(frame, [INTRO - 14, INTRO + 6], [0, 1], {
    ...clamp,
    easing: IN_OUT,
  });
  const toMiddle = interpolate(frame, [SATURDAY + 4, SATURDAY + 26], [0, 1], {
    ...clamp,
    easing: IN_OUT,
  });
  const big = tall ? 1.15 : 1.35;
  return {
    y: middle + (top - middle) * toTop + (saturday - top) * toMiddle,
    scale: big + (1 - big) * toTop + ((tall ? 1.05 : 1.15) - 1) * toMiddle,
  };
};

export const WeekOverlay = ({ days }: { days: DayNote[] }) => {
  const frame = useCurrentFrame();
  const tall = useTall();
  const place = useStripPlace(frame);
  const width = tall ? 940 : 1040;
  const column = (width - 48) / 7;
  // The highlight steps to each day as it starts (Sunday as the intro ends).
  const pillAt = days.reduce(
    (x, _, d) =>
      x +
      interpolate(frame, [dayStart(d) - 10, dayStart(d) + 4], [0, d ? 1 : 0], {
        ...clamp,
        easing: POP,
      }),
    0,
  );
  const away = interpolate(frame, [LOGO - 14, LOGO], [1, 0], clamp);
  const caption = (d: number) => {
    const start = dayStart(d);
    return {
      opacity: interpolate(
        frame,
        [start + 8, start + 18, start + DAY - 10, start + DAY],
        [0, 1, 1, 0],
        clamp,
      ),
      translate: `0 ${interpolate(frame, [start + 8, start + 24], [28, 0], { ...clamp, easing: OUT })}px`,
    };
  };
  const inDays = frame >= INTRO - 6 && frame < LOGO;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: away,
      }}
    >
      {/* A soft floor under the day's line, so it reads over any scene. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: tall ? 560 : 360,
          background:
            "linear-gradient(to bottom, rgba(7,4,15,0) 0%, rgba(7,4,15,0.82) 70%)",
          opacity: interpolate(frame, [INTRO - 6, INTRO + 10], [0, 1], clamp),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: place.y,
          width,
          translate: "-50% -50%",
          scale: String(place.scale),
          padding: "18px 24px 16px",
          borderRadius: 40,
          background: "rgba(20,13,51,0.74)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 30px 80px rgba(7,4,15,0.45)",
          fontFamily: body,
          opacity: interpolate(frame, [0, 8], [0, 1], clamp),
        }}
      >
        <div style={{ position: "relative", display: "flex" }}>
          <div
            style={{
              position: "absolute",
              top: 36,
              left: column * pillAt + (column - SIZE) / 2,
              width: SIZE,
              height: SIZE,
              borderRadius: 24,
              background: C.lavender,
              scale: String(
                interpolate(frame, [INTRO - 16, INTRO - 2], [0, 1], {
                  ...clamp,
                  easing: POP,
                }),
              ),
            }}
          />
          {LETTERS.map((letter, d) => {
            const at = 4 + d * 3;
            const current = Math.round(pillAt) === d && frame >= INTRO - 8;
            const note = days[d];
            return (
              <div
                key={letter}
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  opacity: interpolate(frame, [at, at + 8], [0, 1], clamp),
                  translate: `0 ${interpolate(frame, [at, at + 12], [16, 0], { ...clamp, easing: POP })}px`,
                }}
              >
                <div style={{ fontSize: 22, color: C.onPanelMuted }}>
                  {letter}
                </div>
                <div
                  style={{
                    width: SIZE,
                    height: SIZE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: display,
                    fontWeight: 800,
                    fontSize: 32,
                    color: current ? C.panel : "white",
                  }}
                >
                  {d + 1}
                </div>
                <div
                  style={{ height: 12, display: "flex", alignItems: "center" }}
                >
                  {note ? (
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        background: note.dot,
                        boxShadow: `0 0 14px ${note.dot}`,
                        scale: String(
                          interpolate(
                            frame,
                            [note.doneAt, note.doneAt + 10],
                            [0, 1],
                            { ...clamp, easing: POP },
                          ),
                        ),
                      }}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The intro's line, under the strip. */}
      {[{ text: "A week with OncoSense.", from: 10, to: INTRO - 8 }].map(
        ({ text, from, to }) => (
          <div
            key={text}
            style={{
              position: "absolute",
              left: 80,
              right: 80,
              top: (tall ? 860 : 470) + (tall ? 170 : 150),
              textAlign: "center",
              fontFamily: body,
              fontSize: tall ? 50 : 46,
              color: C.onPanelMuted,
              opacity: interpolate(
                frame,
                [from, from + 10, to - 6, to],
                [0, 1, 1, 0],
                clamp,
              ),
              translate: `0 ${interpolate(frame, [from, from + 16], [20, 0], { ...clamp, easing: OUT })}px`,
            }}
          >
            {text}
          </div>
        ),
      )}

      {/* Saturday: the week, one row a day, each with its dot. */}
      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 160,
          right: tall ? 80 : 160,
          top: tall ? 560 : 350,
          display: "grid",
          gridTemplateColumns: tall ? "1fr" : "1fr 1fr",
          gap: tall ? 22 : 18,
          columnGap: 60,
          fontFamily: body,
        }}
      >
        {days.slice(0, 6).map((note, d) => {
          const start = SATURDAY + 20 + d * 5;
          return (
            <div
              key={note.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: tall ? "24px 28px" : "18px 24px",
                borderRadius: 26,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                opacity: interpolate(
                  frame,
                  [start, start + 8, LOGO - 12, LOGO - 2],
                  [0, 1, 1, 0],
                  clamp,
                ),
                translate: `0 ${interpolate(frame, [start, start + 14], [24, 0], { ...clamp, easing: OUT })}px`,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: note.dot,
                  boxShadow: `0 0 16px ${note.dot}`,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontFamily: display,
                  fontWeight: 800,
                  fontSize: tall ? 34 : 30,
                  color: "white",
                  width: tall ? 220 : 190,
                }}
              >
                {note.name}
              </div>
              <div style={{ fontSize: tall ? 32 : 28, color: C.onPanelMuted }}>
                {note.recap}
              </div>
            </div>
          );
        })}
      </div>

      {inDays
        ? days.map((note, d) => (
            <div
              key={note.name}
              style={{
                position: "absolute",
                left: tall ? 80 : 120,
                right: tall ? 80 : undefined,
                bottom: tall ? 150 : 84,
                maxWidth: tall ? undefined : 1100,
                ...caption(d),
              }}
            >
              <div
                style={{
                  fontFamily: display,
                  fontWeight: 800,
                  fontSize: tall ? 88 : 80,
                  letterSpacing: -2,
                  color: "white",
                  lineHeight: 1,
                }}
              >
                {note.name}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: body,
                  fontSize: tall ? 46 : 44,
                  lineHeight: 1.3,
                  color: C.onPanelMuted,
                  textWrap: "balance",
                }}
              >
                {note.line}
              </div>
            </div>
          ))
        : null}
    </div>
  );
};
