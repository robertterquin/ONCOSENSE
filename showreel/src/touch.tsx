import { Audio } from "@remotion/media";
import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import {
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, IN_OUT, OUT } from "./theme";

/** A synthesized sound in public/audio (scripts/make-audio.mjs). */
export const sfx = (
  name:
    | "tap"
    | "pop"
    | "tick"
    | "ding"
    | "ring"
    | "bloom"
    | "toggle"
    | "whoosh",
) => staticFile(`audio/${name}.wav`);

export const useTall = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/** A press on `target` from `down` to `up` (a tap by default; longer for a drag). */
export type Touch = {
  target: RefObject<HTMLElement | null>;
  down: number;
  up?: number;
};

type Point = [number, number];

// The target's center in the finger's own positioned parent. Offsets ignore CSS
// transforms, so the finger lands on the element wherever a scale or tilt puts it.
const centerIn = (
  target: HTMLElement | null,
  parent: Element | null,
): Point | null => {
  if (!target || !parent) return null;
  let x = target.offsetWidth / 2;
  let y = target.offsetHeight / 2;
  let node: HTMLElement | null = target;
  while (node && node !== parent) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return node ? [Math.round(x), Math.round(y)] : null;
};

const ENTRY: Point = [140, 260];

/**
 * A fingertip that presses each target in turn, measured from the layout every frame,
 * gliding between them, with a ripple and a tap sound on each press. Put it in the
 * same positioned container as its targets.
 */
export const Finger = ({
  touches,
  size = 72,
}: {
  touches: Touch[];
  size?: number;
}) => {
  const frame = useCurrentFrame();
  const self = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<(Point | null)[]>([]);

  // Measured after every render (layout moves frame to frame); it only sets state when a
  // point changed, so it settles in one extra pass, before paint.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const parent = self.current?.offsetParent ?? null;
    const next = touches.map(({ target }) => centerIn(target.current, parent));
    if (JSON.stringify(next) !== JSON.stringify(points)) setPoints(next);
  });

  const ups = touches.map((touch) => touch.up ?? touch.down + 4);
  const at = (i: number): Point => points[i] ?? [0, 0];
  const mix = (a: Point, b: Point, t: number): Point => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];

  const current = touches.reduce(
    (last, touch, i) => (touch.down <= frame ? i : last),
    -1,
  );
  let point: Point;
  let opacity = 1;
  if (current === -1) {
    const t = interpolate(
      frame,
      [touches[0].down - 16, touches[0].down - 2],
      [0, 1],
      { ...clamp, easing: OUT },
    );
    point = mix([at(0)[0] + ENTRY[0], at(0)[1] + ENTRY[1]], at(0), t);
    opacity = interpolate(
      frame,
      [touches[0].down - 16, touches[0].down - 8],
      [0, 1],
      clamp,
    );
  } else if (frame <= ups[current]) {
    point = at(current);
  } else if (current < touches.length - 1) {
    const t = interpolate(
      frame,
      [ups[current] + 1, touches[current + 1].down - 2],
      [0, 1],
      { ...clamp, easing: IN_OUT },
    );
    point = mix(at(current), at(current + 1), t);
  } else {
    const t = interpolate(
      frame,
      [ups[current] + 2, ups[current] + 16],
      [0, 1],
      { ...clamp, easing: IN_OUT },
    );
    point = mix(
      at(current),
      [at(current)[0] + ENTRY[0], at(current)[1] + ENTRY[1]],
      t,
    );
    opacity = interpolate(
      frame,
      [ups[current] + 4, ups[current] + 14],
      [1, 0],
      clamp,
    );
  }
  const pressed = touches.some(
    (touch, i) => frame >= touch.down - 2 && frame <= ups[i] + 2,
  );
  const press = touches.reduce(
    (scale, touch, i) =>
      Math.min(
        scale,
        interpolate(
          frame,
          [touch.down - 2, touch.down, ups[i], ups[i] + 3],
          [1, 0.78, 0.78, 1],
          clamp,
        ),
      ),
    1,
  );

  return (
    <>
      <div
        ref={self}
        style={{
          position: "absolute",
          left: point[0] - size / 2,
          top: point[1] - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          background: pressed
            ? "rgba(255,255,255,0.62)"
            : "rgba(255,255,255,0.45)",
          border: "3px solid white",
          boxShadow:
            "0 0 0 2px rgba(34,26,54,0.35), 0 8px 24px rgba(10,6,30,0.35)",
          opacity: points.length ? opacity : 0,
          scale: String(press),
          zIndex: 20,
          pointerEvents: "none",
        }}
      />
      {touches.map((touch, i) => (
        <div
          key={`ripple-${i}`}
          style={{
            position: "absolute",
            left: at(i)[0] - size / 2,
            top: at(i)[1] - size / 2,
            width: size,
            height: size,
            borderRadius: size / 2,
            border: "3px solid white",
            zIndex: 19,
            opacity:
              frame < touch.down
                ? 0
                : interpolate(
                    frame,
                    [touch.down, touch.down + 14],
                    [0.9, 0],
                    clamp,
                  ),
            scale: String(
              interpolate(frame, [touch.down, touch.down + 14], [0.6, 2.2], {
                ...clamp,
                easing: OUT,
              }),
            ),
          }}
        />
      ))}
      {touches.map((touch, i) => (
        <Audio
          key={`tap-${i}`}
          name="Tap"
          src={sfx("tap")}
          from={touch.down}
          volume={0.8}
        />
      ))}
    </>
  );
};

/** Whether `frame` is inside a touch on this target (for pressed states). */
export const isPressed = (frame: number, touch: Touch) =>
  frame >= touch.down && frame <= (touch.up ?? touch.down + 4);
