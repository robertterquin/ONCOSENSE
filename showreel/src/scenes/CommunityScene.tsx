import { Audio } from "@remotion/media";
import { useRef } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { Headline, Icon, Kicker } from "../parts";
import { body, C, clamp, OUT, POP } from "../theme";
import { Finger, sfx, type Touch, useTall } from "../touch";

// Community: questions land as a stack, and a tap on the top one's thumbs-up votes.

const QUESTIONS = [
  {
    tag: "Treatment",
    text: "What helped with nausea after your first chemo session?",
    answers: 14,
    votes: 12,
  },
  {
    tag: "Screening",
    text: "How did you prepare for your first mammogram?",
    answers: 9,
    votes: 8,
  },
  {
    tag: "After treatment",
    text: "Is it normal to still feel tired months after radiation?",
    answers: 21,
    votes: 17,
  },
];
const VOTE = 52;

const CommunitySceneInner = () => {
  const frame = useCurrentFrame();
  const tall = useTall();
  const thumb = useRef<HTMLDivElement>(null);
  const touches: Touch[] = [{ target: thumb, down: VOTE }];
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 1060,
          top: tall ? 150 : 300,
          width: tall ? 920 : 760,
        }}
      >
        <Headline name="Headline" delay={6}>
          {"Ask. Answer.\nTogether."}
        </Headline>
        <Kicker
          delay={22}
          style={{ marginTop: 36, maxWidth: tall ? 920 : 720 }}
        >
          Questions from people who&apos;ve been there, sorted by what helped
          most.
        </Kicker>
      </div>

      <div
        style={{
          position: "absolute",
          left: tall ? 80 : 150,
          top: tall ? 720 : 170,
          width: tall ? 920 : 800,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {QUESTIONS.map((question, i) => {
          const at = 4 + i * 7;
          const top = i === 0;
          const voted = top && frame >= VOTE;
          return (
            <div
              key={question.tag}
              style={{
                position: "relative",
                padding: "30px 34px",
                borderRadius: 34,
                background: C.surface,
                fontFamily: body,
                color: C.ink,
                boxShadow: "0 30px 60px rgba(8,4,30,0.4)",
                opacity: interpolate(frame, [at, at + 8], [0, 1], clamp),
                translate: `0 ${interpolate(frame, [at, at + 22], [500, 0], { ...clamp, easing: OUT })}px`,
                rotate: `${interpolate(frame, [at, at + 22], [i % 2 ? 7 : -7, 0], { ...clamp, easing: OUT })}deg`,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: 16,
                  background: C.raised,
                  color: C.action,
                  fontSize: 20,
                  fontWeight: 500,
                }}
              >
                {question.tag}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  marginTop: 14,
                }}
              >
                {question.text}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  marginTop: 18,
                  fontSize: 22,
                  color: C.muted,
                }}
              >
                <div
                  ref={top ? thumb : undefined}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 16px",
                    margin: "-8px -16px",
                    borderRadius: 24,
                    background: voted ? C.raised : "transparent",
                  }}
                >
                  {top ? (
                    <div
                      style={{
                        position: "absolute",
                        left: 2,
                        top: -6,
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        border: `3px solid ${C.action}`,
                        opacity:
                          frame < VOTE
                            ? 0
                            : interpolate(
                                frame,
                                [VOTE, VOTE + 14],
                                [1, 0],
                                clamp,
                              ),
                        scale: String(
                          interpolate(frame, [VOTE, VOTE + 14], [0.4, 1.8], {
                            ...clamp,
                            easing: OUT,
                          }),
                        ),
                      }}
                    />
                  ) : null}
                  <Icon
                    name="thumbs-up"
                    size={32}
                    color={voted ? C.action : C.muted}
                    style={{
                      scale: String(
                        top
                          ? interpolate(
                              frame,
                              [VOTE, VOTE + 4, VOTE + 14],
                              [1, 1.5, 1],
                              { ...clamp, easing: POP },
                            )
                          : 1,
                      ),
                      rotate: `${top ? interpolate(frame, [VOTE, VOTE + 5, VOTE + 14], [0, -18, 0], clamp) : 0}deg`,
                    }}
                  />
                  <span
                    style={{
                      color: voted ? C.action : C.muted,
                      fontWeight: voted ? 600 : 400,
                    }}
                  >
                    {question.votes + (voted ? 1 : 0)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name="message" size={30} color={C.muted} />
                  {question.answers} answers
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Finger touches={touches} size={84} />
      {QUESTIONS.map((question, i) => (
        <Audio
          key={question.tag}
          name="Card"
          src={sfx("pop")}
          from={4 + i * 7}
          volume={0.3}
        />
      ))}
      <Audio name="Vote" src={sfx("ding")} from={VOTE + 1} volume={0.6} />
    </>
  );
};

export const CommunityScene = Interactive.create({
  Component: CommunitySceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
