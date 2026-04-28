import { vibeCodingEpisode1 } from "./episodes/vibeCodingEpisode1";
import { XiaoxuelingLectureTemplate } from "./templates/VibeCodingShort";
import type { LectureEpisode } from "./templates/xiaoxuelingLecture/types";

export const LectureComposition: React.FC<{ episode: LectureEpisode }> = ({
  episode,
}) => {
  return <XiaoxuelingLectureTemplate episode={episode} />;
};

export const MyComposition: React.FC = () => {
  return <LectureComposition episode={vibeCodingEpisode1} />;
};
