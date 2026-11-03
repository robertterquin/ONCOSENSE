import { Composition, Folder } from "remotion";
import { Headline } from "./parts";
import { LogoScene } from "./scenes/LogoScene";
import { TabsScene } from "./scenes/TabsScene";
import { TodayScene } from "./scenes/TodayScene";
import { CheckInScene } from "./scenes/CheckInScene";
import { LearnScene } from "./scenes/LearnScene";
import { CommunityScene } from "./scenes/CommunityScene";
import { HelpScene } from "./scenes/HelpScene";
import { JourneyScene } from "./scenes/JourneyScene";
import { Showreel } from "./Showreel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Showreel"
        component={Showreel}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ShowreelPortrait"
        component={Showreel}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="Scenes">
        <Composition
          id="LogoScene"
          component={LogoScene}
          durationInFrames={90}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            tagline:
              "Know the early signs, check yourself, and keep track of treatment, in one calm place.",
            footnote: "",
            style: {
              backgroundColor: "#140D33",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />
        <Composition
          id="TabsScene"
          component={TabsScene}
          durationInFrames={90}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="TodayScene"
          component={TodayScene}
          durationInFrames={135}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ style: { backgroundColor: "#140D33" } }}
        />
        <Composition
          id="CheckInScene"
          component={CheckInScene}
          durationInFrames={135}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ style: { backgroundColor: "#2E1F66" } }}
        />
        <Composition
          id="LearnScene"
          component={LearnScene}
          durationInFrames={135}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ style: { backgroundColor: "#EBE8F2" } }}
        />
        <Composition
          id="CommunityScene"
          component={CommunityScene}
          durationInFrames={105}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ style: { backgroundColor: "#140D33" } }}
        />
        <Composition
          id="HelpScene"
          component={HelpScene}
          durationInFrames={105}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ style: { backgroundColor: "#0E6B63" } }}
        />
        <Composition
          id="JourneyScene"
          component={JourneyScene}
          durationInFrames={135}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ style: { backgroundColor: "#140D33" } }}
        />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="Headline"
          component={Headline}
          durationInFrames={60}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            children: "Your treatment week, at a glance.",
            delay: 0,
            style: { padding: 140, backgroundColor: "#140D33" },
          }}
        />
      </Folder>
    </>
  );
};
