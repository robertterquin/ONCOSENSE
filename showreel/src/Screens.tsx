import { Img, staticFile } from "remotion";
import { C } from "./theme";

// A still of three real app screens side by side (Welcome, Today, Journey) for posts and
// decks. The images in public/screens are iPhone 17 Pro simulator screenshots
// (1206 x 2622, 402 x 874 points at 3x). They carry their own status bar and Dynamic
// Island, so the frame is a plain bezel.

const SCREENS = ["welcome", "today", "journey"];
const SCREEN = { width: 402, height: 874, radius: 56 };
const BEZEL = 14;
const PHONE = {
  width: SCREEN.width + BEZEL * 2,
  height: SCREEN.height + BEZEL * 2,
};

export const Screens = () => {
  const gap = 120;
  const left = (1800 - (PHONE.width * 3 + gap * 2)) / 2;
  const top = (1240 - PHONE.height) / 2;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, ${C.panelTop} 0%, ${C.night} 55%, #07040F 100%)`,
      }}
    >
      {SCREENS.map((name, i) => (
        <div
          key={name}
          style={{
            position: "absolute",
            left: left + i * (PHONE.width + gap),
            top,
            width: PHONE.width,
            height: PHONE.height,
            padding: BEZEL,
            boxSizing: "border-box",
            borderRadius: SCREEN.radius + BEZEL,
            background: "#0D0A18",
            boxShadow:
              "0 0 0 2px rgba(217,204,255,0.25), 0 60px 120px rgba(8,4,30,0.55), 0 20px 40px rgba(8,4,30,0.35)",
          }}
        >
          <Img
            src={staticFile(`screens/${name}.png`)}
            style={{
              display: "block",
              width: SCREEN.width,
              height: SCREEN.height,
              borderRadius: SCREEN.radius,
            }}
          />
        </div>
      ))}
    </div>
  );
};
