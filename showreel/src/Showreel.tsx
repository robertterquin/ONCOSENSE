import { Audio } from "@remotion/media";
import type React from "react";
import {
  Easing,
  interpolate,
  staticFile,
  Track,
  useCurrentFrame,
} from "remotion";
import { Bare } from "./parts";
import { CheckInScene } from "./scenes/CheckInScene";
import { CommunityScene } from "./scenes/CommunityScene";
import { HelpScene } from "./scenes/HelpScene";
import { LearnScene } from "./scenes/LearnScene";
import { LogoScene } from "./scenes/LogoScene";
import { JourneyScene } from "./scenes/JourneyScene";
import { TodayScene } from "./scenes/TodayScene";
import { C, clamp, IN_OUT } from "./theme";
import { sfx, useTall } from "./touch";
import { type DayNote, dayStart, LOGO, SATURDAY, WeekOverlay } from "./week";

// A week with OncoSense: one day, one feature. Each day's scene plays bare (no
// headline) under the week strip, trimmed so its moment lands mid-day, and swipes in
// like paging a calendar. Saturday looks back over the filled-in week; then the logo.
// 100 BPM in 3/4 (scripts/make-audio.mjs). Renders landscape (Showreel) and portrait
// (ShowreelPortrait).

type Point = [number, number];
/** Where to look in a scene's own layout (landscape, portrait), from start to end. */
type Focus = { L: [Point, Point?]; P: [Point, Point?] };
type Zoom = { L: [number, number]; P: [number, number] };

// Each day's scene starts 8 frames early and ends 8 late, so neighbors overlap for the swipe.
const SWIPE = 16;
const from = (d: number) => dayStart(d) - SWIPE / 2;
const LENGTH = dayStart(1) - dayStart(0) + SWIPE;

// Trims: the scene frame each day starts on. A day's dot lands at the scene's own moment.
const TRIM = {
  learn: 20,
  checkIn: 16,
  today: 0,
  journey: 10,
  community: 10,
  help: 6,
};
const at = (d: number, trim: number, moment: number) => from(d) + moment - trim;

const DAYS: DayNote[] = [
  {
    name: "Sunday",
    line: "Learn the early signs, and how to check yourself.",
    recap: "Learned the early signs",
    dot: C.lavender,
    doneAt: at(0, TRIM.learn, 56),
  },
  {
    name: "Monday",
    line: "Two taps to say how you really are.",
    recap: "Checked in: good, energy 8",
    dot: C.helpBright,
    doneAt: at(1, TRIM.checkIn, 96),
  },
  {
    name: "Tuesday",
    line: "Chemo, cycle 3 of 6. Halfway there.",
    recap: "Chemo, 3 of 6 done",
    dot: C.amber,
    doneAt: at(2, TRIM.today, 80),
  },
  {
    name: "Wednesday",
    line: "See how your week is going, and share it with your doctor.",
    recap: "Shared a summary with my doctor",
    dot: C.lavender,
    doneAt: at(3, TRIM.journey, 114),
  },
  {
    name: "Thursday",
    line: "Ask people who've been there.",
    recap: "Asked the community",
    dot: C.lavender,
    doneAt: at(4, TRIM.community, 53),
  },
  {
    name: "Friday",
    line: "Someone to talk to, one tap away.",
    recap: "Called the DOH hotline",
    dot: C.helpBright,
    doneAt: at(5, TRIM.help, 38),
  },
  {
    name: "Saturday",
    line: "Your whole week, in one calm place.",
    recap: "",
    dot: "white",
    doneAt: SATURDAY + 34,
  },
];

const FOCUS = {
  learn: {
    L: [
      [1370, 470],
      [1370, 540],
    ],
    P: [
      [540, 1120],
      [540, 1080],
    ],
  },
  checkIn: {
    L: [
      [475, 400],
      [600, 620],
    ],
    P: [
      [540, 1060],
      [600, 1300],
    ],
  },
  today: {
    L: [
      [1445, 470],
      [1250, 700],
    ],
    P: [
      [540, 1120],
      [430, 1380],
    ],
  },
  journey: {
    L: [
      [1445, 470],
      [1445, 640],
    ],
    P: [
      [540, 1110],
      [540, 1330],
    ],
  },
  community: {
    L: [
      [550, 480],
      [520, 380],
    ],
    P: [
      [540, 1050],
      [540, 960],
    ],
  },
  help: { L: [[860, 470]], P: [[540, 1060]] },
} satisfies Record<string, Focus>;

const ZOOM = {
  learn: { L: [0.95, 1.05], P: [0.85, 0.92] },
  checkIn: { L: [1.05, 1.15], P: [0.92, 0.98] },
  today: { L: [1.0, 1.12], P: [0.9, 0.98] },
  journey: { L: [1.0, 1.1], P: [0.92, 0.98] },
  community: { L: [1.0, 1.1], P: [0.9, 0.96] },
  help: { L: [0.9, 0.95], P: [0.82, 0.86] },
} satisfies Record<string, Zoom>;

export const Showreel = () => {
  const frame = useCurrentFrame();
  const tall = useTall();

  // The camera on one day: a slow drift between two focus points, swiping in from the
  // right and out to the left. Content sits between the strip and the day's line.
  const day = (
    d: number,
    focus: Focus,
    zoom: Zoom,
    bg: string,
  ): React.CSSProperties => {
    const start = from(d);
    const end = start + LENGTH;
    const t = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.4, 0, 0.6, 1),
    });
    const [a, b = a] = tall ? focus.P : focus.L;
    const [z0, z1] = tall ? zoom.P : zoom.L;
    const f = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const c = tall ? [540, 880] : [960, 500];
    const width = tall ? 1080 : 1920;
    const swipe =
      interpolate(frame, [start, start + SWIPE], [width, 0], {
        ...clamp,
        easing: IN_OUT,
      }) +
      interpolate(frame, [end - SWIPE, end], [0, -width], {
        ...clamp,
        easing: IN_OUT,
      });
    return {
      backgroundColor: bg,
      // Fills whatever the drift uncovers with the scene's own color.
      boxShadow: `0 0 0 3000px ${bg}`,
      transformOrigin: `${f[0]}px ${f[1]}px`,
      translate: `${c[0] - f[0] + swipe}px ${c[1] - f[1]}px`,
      scale: String(z0 + (z1 - z0) * t),
    };
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.night,
        overflow: "hidden",
      }}
    >
      <Bare.Provider value>
        <Track name="Even days">
          <LearnScene
            name="Sunday"
            from={from(0)}
            durationInFrames={LENGTH}
            trimBefore={TRIM.learn}
            style={day(0, FOCUS.learn, ZOOM.learn, C.ground)}
          />
          <TodayScene
            name="Tuesday"
            from={from(2)}
            durationInFrames={LENGTH}
            trimBefore={TRIM.today}
            style={day(2, FOCUS.today, ZOOM.today, C.night)}
          />
          <CommunityScene
            name="Thursday"
            from={from(4)}
            durationInFrames={LENGTH}
            trimBefore={TRIM.community}
            style={day(4, FOCUS.community, ZOOM.community, C.night)}
          />
        </Track>
        <Track name="Odd days">
          <CheckInScene
            name="Monday"
            from={from(1)}
            durationInFrames={LENGTH}
            trimBefore={TRIM.checkIn}
            style={day(1, FOCUS.checkIn, ZOOM.checkIn, C.panel)}
          />
          <JourneyScene
            name="Wednesday"
            from={from(3)}
            durationInFrames={LENGTH}
            trimBefore={TRIM.journey}
            style={day(3, FOCUS.journey, ZOOM.journey, C.night)}
          />
          <HelpScene
            name="Friday"
            from={from(5)}
            durationInFrames={LENGTH}
            trimBefore={TRIM.help}
            style={day(5, FOCUS.help, ZOOM.help, C.help)}
          />
        </Track>
      </Bare.Provider>

      <WeekOverlay days={DAYS} />

      <Track name="Close">
        <LogoScene
          name="Logo"
          from={LOGO}
          durationInFrames={900 - LOGO}
          tagline="Every day, in one calm place."
          footnote="General health information, not medical advice."
          style={{
            backgroundColor: C.night,
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </Track>

      <Audio name="Music" src={staticFile("audio/music.wav")} volume={0.7} />
      {[1, 2, 3, 4, 5, 6].map((d) => (
        <Audio
          key={`swipe-${d}`}
          name="Next day"
          src={sfx("whoosh")}
          from={dayStart(d) - 10}
          volume={0.16}
        />
      ))}
      {DAYS.map((note) => (
        <Audio
          key={note.name}
          name={`${note.name} dot`}
          src={sfx("pop")}
          from={note.doneAt}
          volume={0.3}
        />
      ))}
    </div>
  );
};
