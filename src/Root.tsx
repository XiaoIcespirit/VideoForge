import "./index.css";
import { Composition } from "remotion";
import { LectureComposition } from "./Composition";
import { lectureEpisodes } from "./episodes";
import { getDurationFrames } from "./templates/xiaoxuelingLecture/types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {lectureEpisodes.map((episode) => (
        <Composition
          key={episode.meta.compositionId}
          id={episode.meta.compositionId}
          component={LectureComposition}
          durationInFrames={getDurationFrames(episode)}
          fps={episode.meta.fps}
          width={episode.meta.width}
          height={episode.meta.height}
          defaultProps={{ episode }}
        />
      ))}
    </>
  );
};
