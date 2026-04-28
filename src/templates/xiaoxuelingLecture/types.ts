import type { Caption } from "@remotion/captions";

export type CharacterView = "front" | "side" | "back";

export type LectureMeta = {
  compositionId: string;
  fps: number;
  width: number;
  height: number;
  durationSeconds: number;
};

export type LectureBrand = {
  seriesTitle: string;
  chapterTitle: string;
  episodeLabel: string;
  subtitleLabel: string;
  ambientChips: string[];
};

export type LectureCharacter = {
  image: string;
  sourceAspect: number;
  viewsPerSheet: number;
};

type SceneKind =
  | "coldOpen"
  | "chapterMap"
  | "coreConcept"
  | "analogy"
  | "engineering"
  | "miniDemo"
  | "pitfall"
  | "takeaway";

export type BaseScene = {
  id: string;
  kind: SceneKind;
  start: number;
  end: number;
  label: string;
};

export type ChapterNode = {
  label: string;
  caption: string;
};

export type TranslationPair = {
  abstract: string;
  action: string;
};

export type PromptBlock = {
  label: string;
  text: string;
};

export type DemoStep = {
  label: string;
  title: string;
  detail: string;
};

export type TerminalLine = {
  prompt?: string;
  text: string;
  tone?: "normal" | "success" | "warning";
};

export type ColdOpenScene = BaseScene & {
  kind: "coldOpen";
  eyebrow: string;
  headline: string;
  contrastLeft: string;
  contrastRight: string;
  punchline: string;
};

export type ChapterMapScene = BaseScene & {
  kind: "chapterMap";
  title: string;
  question: string;
  nodes: ChapterNode[];
};

export type CoreConceptScene = BaseScene & {
  kind: "coreConcept";
  title: string;
  definition: string;
  keywords: string[];
  formula: string[];
  warning: string;
};

export type AnalogyScene = BaseScene & {
  kind: "analogy";
  title: string;
  analogyTitle: string;
  analogy: string;
  bullets: string[];
  bottomNote: string;
};

export type EngineeringScene = BaseScene & {
  kind: "engineering";
  title: string;
  mapping: TranslationPair[];
  promptBlocks: PromptBlock[];
  principle: string;
};

export type MiniDemoScene = BaseScene & {
  kind: "miniDemo";
  title: string;
  steps: DemoStep[];
  readmeLines: string[];
  terminalLines: TerminalLine[];
};

export type PitfallScene = BaseScene & {
  kind: "pitfall";
  title: string;
  badTitle: string;
  goodTitle: string;
  badItems: string[];
  goodItems: string[];
  warning: string;
};

export type TakeawayScene = BaseScene & {
  kind: "takeaway";
  title: string;
  principle: string;
  checklist: string[];
  nextTitle: string;
  signoff: string;
};

export type LectureScene =
  | ColdOpenScene
  | ChapterMapScene
  | CoreConceptScene
  | AnalogyScene
  | EngineeringScene
  | MiniDemoScene
  | PitfallScene
  | TakeawayScene;

export type LectureEpisode = {
  meta: LectureMeta;
  brand: LectureBrand;
  character: LectureCharacter;
  highlightWords: string[];
  scenes: LectureScene[];
  captions: Caption[];
};

export const createCaption = (
  text: string,
  start: number,
  end: number,
): Caption => ({
  text,
  startMs: start * 1000,
  endMs: end * 1000,
  timestampMs: null,
  confidence: null,
});

export const getDurationFrames = (episode: LectureEpisode) =>
  Math.round(episode.meta.durationSeconds * episode.meta.fps);
