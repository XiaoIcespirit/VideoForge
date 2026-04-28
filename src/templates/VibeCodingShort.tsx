import type { Caption } from "@remotion/captions";
import type { CSSProperties, FC } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText, CodeBlock } from "remotion-bits";
import { DataFlowPipes } from "../components/remocn/data-flow-pipes";
import { InlineHighlight } from "../components/remocn/inline-highlight";
import {
  TerminalSimulator,
  type TerminalLine as RemocnTerminalLine,
} from "../components/remocn/terminal-simulator";
import type {
  AnalogyScene,
  ChapterMapScene,
  ColdOpenScene,
  CoreConceptScene,
  EngineeringScene,
  LectureBrand,
  LectureCharacter,
  LectureEpisode,
  LectureScene,
  MiniDemoScene,
  PitfallScene,
  TakeawayScene,
} from "./xiaoxuelingLecture/types";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const popEase = Easing.bezier(0.34, 1.56, 0.64, 1);
const softInOut = Easing.bezier(0.45, 0, 0.55, 1);
const teal = "#20dbc5";
const blue = "#4f8cff";
const coral = "#ff6d61";
const yellow = "#f6d84a";
const green = "#7df28d";

const assetSrc = (path: string) =>
  /^https?:\/\//.test(path) ? path : staticFile(path);

const ease = (
  frame: number,
  start: number,
  end: number,
  easing: (input: number) => number = easeOut,
) =>
  interpolate(frame, [start, end], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const value = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (input: number) => number = easeOut,
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const pop = (frame: number, delay: number, fps: number) =>
  interpolate(
    frame,
    [delay * fps, delay * fps + 0.16 * fps, delay * fps + 0.42 * fps],
    [0, 1.08, 1],
    {
      easing: popEase,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

const revealStyle = (
  frame: number,
  delay: number,
  fps: number,
  offsetX = 0,
  offsetY = 28,
): CSSProperties => {
  const enter = ease(frame, delay * fps, delay * fps + 0.48 * fps);
  return {
    opacity: enter,
    transform: `translate3d(${(1 - enter) * offsetX}px, ${
      (1 - enter) * offsetY
    }px, 0)`,
  };
};

export const XiaoxuelingLectureTemplate: FC<{ episode: LectureEpisode }> = ({
  episode,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="vibe-root">
      <TechBackdrop chips={episode.brand.ambientChips} />
      <XiaoxuelingMascotBadge character={episode.character} />
      {episode.scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={Math.round(scene.start * fps)}
          durationInFrames={Math.round((scene.end - scene.start) * fps)}
        >
          <SceneLayer scene={scene} />
        </Sequence>
      ))}
      <TopBar episode={episode} />
      <SmartSubtitleStrip
        captions={episode.captions}
        frame={frame}
        fps={fps}
        highlightWords={episode.highlightWords}
        label={episode.brand.subtitleLabel}
      />
    </AbsoluteFill>
  );
};

export const VibeCodingShort = XiaoxuelingLectureTemplate;

const SceneLayer: FC<{ scene: LectureScene }> = ({ scene }) => {
  switch (scene.kind) {
    case "coldOpen":
      return <ColdOpen scene={scene} />;
    case "chapterMap":
      return <ChapterMap scene={scene} />;
    case "coreConcept":
      return <CoreConcept scene={scene} />;
    case "analogy":
      return <Analogy scene={scene} />;
    case "engineering":
      return <EngineeringTranslation scene={scene} />;
    case "miniDemo":
      return <MiniDemo scene={scene} />;
    case "pitfall":
      return <Pitfall scene={scene} />;
    case "takeaway":
      return <Takeaway scene={scene} />;
  }
};

const TechBackdrop: FC<{ chips: string[] }> = ({ chips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drift = Math.sin((frame / fps) * Math.PI * 2 * 0.04) * 16;
  const scan = (frame % (fps * 9)) * 1.7;
  const nodePositions = [
    [126, 310],
    [920, 340],
    [820, 1260],
    [172, 1430],
    [620, 1660],
  ];

  return (
    <AbsoluteFill className="tech-backdrop">
      <div
        className="tech-grid"
        style={{ transform: `translate3d(${drift}px, ${scan % 64}px, 0)` }}
      />
      <div
        className="scan-line"
        style={{ transform: `translate3d(0, ${220 + (scan % 1180)}px, 0)` }}
      />
      <svg className="node-field" viewBox="0 0 1080 1920">
        <path
          d="M122 350 C300 230 480 470 660 350 S920 240 980 420"
          fill="none"
          stroke="rgba(32, 219, 197, 0.18)"
          strokeWidth="4"
        />
        <path
          d="M130 1380 C330 1190 520 1480 724 1320 S940 1160 980 1420"
          fill="none"
          stroke="rgba(79, 140, 255, 0.16)"
          strokeWidth="4"
        />
        {nodePositions.map(([x, y], index) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={index % 2 === 0 ? 7 : 5}
            fill={index % 2 === 0 ? teal : blue}
            opacity={0.55}
          />
        ))}
      </svg>
      {chips.map((chip, index) => (
        <FloatingChip key={`${chip}-${index}`} index={index} text={chip} />
      ))}
    </AbsoluteFill>
  );
};

const FloatingChip: FC<{ index: number; text: string }> = ({ index, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const positions = [
    [72, 270],
    [780, 300],
    [760, 1410],
    [92, 1510],
  ];
  const [x, y] = positions[index % positions.length];
  const bob = Math.sin((frame / fps + index * 0.6) * Math.PI * 2 * 0.16) * 9;

  return (
    <div className="floating-chip" style={{ left: x, top: y + bob }}>
      {text}
    </div>
  );
};

const XiaoxuelingMascotBadge: FC<{ character: LectureCharacter }> = ({
  character,
}) => {
  const height = 252;
  const cropWidth = (height * character.sourceAspect) / character.viewsPerSheet;
  const sourceWidth = height * character.sourceAspect;

  return (
    <div className="mascot-badge" style={{ width: cropWidth, height }}>
      <Img
        src={assetSrc(character.image)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: sourceWidth,
          height,
          maxWidth: "none",
        }}
      />
    </div>
  );
};

const TopBar: FC<{ episode: { brand: LectureBrand } }> = ({ episode }) => (
  <div className="top-bar">
    <div className="top-pill">{episode.brand.episodeLabel}</div>
    <div className="top-text">{episode.brand.chapterTitle}</div>
  </div>
);

const SmartSubtitleStrip: FC<{
  captions: Caption[];
  frame: number;
  fps: number;
  highlightWords: string[];
  label: string;
}> = ({ captions, frame, fps, highlightWords, label }) => {
  const ms = (frame / fps) * 1000;
  const active = captions.find(
    (caption) => ms >= caption.startMs && ms < caption.endMs,
  );
  const activeStartFrame = active ? (active.startMs / 1000) * fps : frame;
  const localFrame = active ? frame - activeStartFrame : 0;
  const enter = active ? ease(localFrame, 0, 0.2 * fps) : 0;
  const durationFrames = active
    ? ((active.endMs - active.startMs) / 1000) * fps
    : 1;
  const weight = active ? getSubtitleWeight(active.text) : 0;
  const fontSize = getSubtitleFontSize(weight);
  const shouldScroll = weight > 22;
  const holdFrames = 0.25 * fps;
  const scrollDistance = shouldScroll
    ? getSubtitleScrollDistance(weight, fontSize)
    : 0;
  const scrollEndFrame = Math.max(holdFrames + 1, durationFrames - holdFrames);
  const scrollX =
    shouldScroll && durationFrames > holdFrames * 2
      ? interpolate(localFrame, [holdFrames, scrollEndFrame], [0, -scrollDistance], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <div className="subtitle-wrap">
      <div className="subtitle-label">{label}</div>
      <div
        className="subtitle-text"
        style={{
          opacity: enter,
          fontSize,
          transform: `translateY(${(1 - enter) * 18}px)`,
        }}
      >
        <div className="subtitle-line-clip">
          <span
            className={shouldScroll ? "subtitle-line-track scrolling" : "subtitle-line-track"}
            style={{ transform: `translate3d(${scrollX}px, 0, 0)` }}
          >
            {active ? (
              <HighlightedText
                endFrame={activeStartFrame + 0.5 * fps}
                startFrame={activeStartFrame}
                text={active.text}
                words={highlightWords}
              />
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
};

const getSubtitleWeight = (text: string) =>
  Array.from(text).reduce((total, char) => {
    if (char === " ") {
      return total + 0.35;
    }
    return char.charCodeAt(0) < 128 ? total + 0.58 : total + 1;
  }, 0);

const getSubtitleFontSize = (weight: number) => {
  if (weight <= 16) {
    return 42;
  }
  if (weight <= 19) {
    return 38;
  }
  if (weight <= 22) {
    return 34;
  }
  return 32;
};

const getSubtitleScrollDistance = (weight: number, fontSize: number) =>
  Math.min(360, Math.max(0, (weight - 21) * fontSize * 0.62));

const HighlightedText: FC<{
  text: string;
  words: string[];
  startFrame: number;
  endFrame: number;
}> = ({
  text,
  words,
  startFrame,
  endFrame,
}) => {
  if (words.length === 0) {
    return <>{text}</>;
  }

  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  const match = sortedWords.reduce<{ index: number; word: string } | null>(
    (best, word) => {
      const index = text.indexOf(word);
      if (index === -1) {
        return best;
      }
      if (best === null || index < best.index) {
        return { index, word };
      }
      return best;
    },
    null,
  );

  if (match === null) {
    return <>{text}</>;
  }

  return (
    <InlineHighlight
      after={text.slice(match.index + match.word.length)}
      baseColor="#f6fbff"
      before={text.slice(0, match.index)}
      endFrame={endFrame}
      fontSize="inherit"
      fontWeight={900}
      highlight={match.word}
      highlightColor={yellow}
      inline
      startFrame={startFrame}
    />
  );
};

const SceneBadge: FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div className="scene-badge" style={revealStyle(frame, 0.1, fps, -22, 0)}>
      {label}
    </div>
  );
};

const BitBlurWords: FC<{
  children: string;
  className?: string;
  style?: CSSProperties;
  split?: "word" | "character";
}> = ({ children, className, style, split = "word" }) => (
  <AnimatedText
    className={className}
    style={style}
    transition={{
      y: [40, 0],
      blur: [10, 0],
      opacity: [0, 1],
      split,
      splitStagger: split === "word" ? 1 : 0.45,
      easing: "easeOutCubic",
    }}
  >
    {children}
  </AnimatedText>
);

const BitWordByWord: FC<{
  children: string;
  className?: string;
  style?: CSSProperties;
}> = ({ children, className, style }) => (
  <AnimatedText
    className={className}
    style={style}
    transition={{
      y: [20, 0],
      opacity: [0, 1],
      split: "word",
      splitStagger: 3,
      easing: "easeOutQuad",
    }}
  >
    {children}
  </AnimatedText>
);

const InlineCallout: FC<{
  children: string;
  className?: string;
  tone?: "neutral" | "warning" | "success";
}> = ({ children, className, tone = "neutral" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = ease(frame, 0.24 * fps, 0.92 * fps, softInOut);

  return (
    <div className={`inline-callout ${tone} ${className ?? ""}`}>
      <BitWordByWord>{children}</BitWordByWord>
      <span className="callout-line" style={{ transform: `scaleX(${line})` }} />
    </div>
  );
};

const ColdOpen: FC<{ scene: ColdOpenScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const camera = value(frame, [0, 7.5 * fps], [1, 1.035], softInOut);
  const rightEnter = ease(frame, 3.25 * fps, 3.8 * fps);
  const punch = ease(frame, 5.7 * fps, 6.4 * fps);

  return (
    <AbsoluteFill>
      <div className="cold-slash" style={{ transform: `scale(${camera})` }} />
      <div className="cold-copy" style={{ transform: `scale(${camera})` }}>
        <div className="eyebrow">{scene.eyebrow}</div>
        <BitBlurWords className="cold-headline" split="character">
          {scene.headline}
        </BitBlurWords>
        <div className="contrast-board">
          <div className="contrast-card bad">{scene.contrastLeft}</div>
          <div
            className="contrast-card good"
            style={{
              opacity: rightEnter,
              transform: `translateX(${(1 - rightEnter) * 38}px)`,
            }}
          >
            {scene.contrastRight}
          </div>
        </div>
        <div
          className="punchline"
          style={{
            opacity: punch,
            transform: `translateY(${(1 - punch) * 30}px)`,
          }}
        >
          {scene.punchline}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ChapterMap: FC<{ scene: ChapterMapScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <SceneBadge label={scene.label} />
      <div className="chapter-copy">
        <div className="section-title" style={revealStyle(frame, 0.3, fps)}>
          {scene.title}
        </div>
        <InlineCallout className="chapter-question" tone="warning">
          {scene.question}
        </InlineCallout>
      </div>
      <ChapterRouteMap scene={scene} />
    </AbsoluteFill>
  );
};

const ChapterRouteMap: FC<{ scene: ChapterMapScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = [teal, blue, yellow];
  const routeProgress = ease(frame, 3.2 * fps, 13.4 * fps, softInOut);
  const nodePositions = [
    { x: 130, y: 250 },
    { x: 450, y: 94 },
    { x: 770, y: 250 },
  ];
  const pipeNodes = nodePositions.map((node, index) => ({
    id: `step-${index}`,
    label: "",
    x: 190 + index * 450,
    y: index === 1 ? 210 : 390,
  }));
  const pipeEdges = [
    { from: "step-0", to: "step-1", startFrame: 0 },
    { from: "step-1", to: "step-2", startFrame: 20 },
  ];

  return (
    <div className="chapter-route-map" style={revealStyle(frame, 2.7, fps)}>
      <DataFlowPipes
        background="transparent"
        className="chapter-data-pipes"
        edges={pipeEdges}
        nodeColor="rgba(8, 16, 23, 0.16)"
        nodes={pipeNodes}
        pipeColor="rgba(246, 251, 255, 0.08)"
        pulseColor={teal}
        pulseDuration={46}
        pulseLength={86}
        speed={0.8}
        textColor="transparent"
      />
      <svg className="chapter-route-svg" viewBox="0 0 900 360">
        <path
          d="M130 250 C260 72 330 72 450 94 S640 420 770 250"
          fill="none"
          stroke="rgba(246, 251, 255, 0.1)"
          strokeLinecap="round"
          strokeWidth="9"
        />
        <path
          d="M130 250 C260 72 330 72 450 94 S640 420 770 250"
          fill="none"
          stroke={teal}
          strokeDasharray="980"
          strokeDashoffset={(1 - routeProgress) * 980}
          strokeLinecap="round"
          strokeWidth="9"
        />
      </svg>
      {scene.nodes.map((node, index) => {
        const active = frame > (4 + index * 3.1) * fps;
        const position = nodePositions[index];
        return (
          <div
            className={active ? "chapter-route-node active" : "chapter-route-node"}
            key={node.label}
            style={{
              left: position.x,
              top: position.y,
              borderColor: active ? colors[index] : "rgba(246, 251, 255, 0.16)",
            }}
          >
            <div
              className="chapter-route-index"
              style={{ backgroundColor: active ? colors[index] : "rgba(246,251,255,0.18)" }}
            >
              {index + 1}
            </div>
            <div className="chapter-route-copy">
              <strong>{node.label}</strong>
              <span>{node.caption}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CoreConcept: FC<{ scene: CoreConceptScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <SceneBadge label={scene.label} />
      <div className="concept-card" style={revealStyle(frame, 0.25, fps)}>
        <div className="section-title">{scene.title}</div>
        <p>{scene.definition}</p>
      </div>
      <div className="keyword-orbit">
        {scene.keywords.map((keyword, index) => (
          <div
            key={keyword}
            className="concept-keyword"
            style={{
              ...revealStyle(frame, 4.2 + index * 1.7, fps, 0, 26),
              borderColor: [teal, blue, yellow, green][index],
            }}
          >
            <BitBlurWords>{keyword}</BitBlurWords>
          </div>
        ))}
      </div>
      <div className="formula-stack">
        {scene.formula.map((step, index) => (
          <FormulaStep
            key={step}
            delay={15.2 + index * 3.3}
            index={index}
            step={step}
          />
        ))}
      </div>
      <InlineCallout className="warning-strip" tone="warning">
        {scene.warning}
      </InlineCallout>
    </AbsoluteFill>
  );
};

const FormulaStep: FC<{ delay: number; index: number; step: string }> = ({
  delay,
  index,
  step,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = [teal, blue, yellow, green];

  return (
    <div className="formula-row" style={revealStyle(frame, delay, fps, 36, 0)}>
      <span style={{ backgroundColor: colors[index] }}>{index + 1}</span>
      <strong>{step}</strong>
    </div>
  );
};

const Analogy: FC<{ scene: AnalogyScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const route = ease(frame, 7.8 * fps, 16.2 * fps, softInOut);

  return (
    <AbsoluteFill>
      <SceneBadge label={scene.label} />
      <div className="analogy-title" style={revealStyle(frame, 0.25, fps)}>
        <span>{scene.title}</span>
        <BitBlurWords className="analogy-main">{scene.analogyTitle}</BitBlurWords>
        <em>{scene.analogy}</em>
      </div>
      <div className="route-panel" style={revealStyle(frame, 3.2, fps, 0, 32)}>
        <svg width="760" height="260" viewBox="0 0 760 260">
          <path
            d="M58 200 C186 42 386 220 532 86 S690 68 718 36"
            fill="none"
            stroke={teal}
            strokeLinecap="round"
            strokeWidth="10"
            strokeDasharray="860"
            strokeDashoffset={(1 - route) * 860}
          />
          <circle cx="58" cy="200" r="18" fill={blue} />
          <circle cx="718" cy="36" r="18" fill={yellow} />
        </svg>
        <div className="route-label start">模糊需求</div>
        <div className="route-label end">可验收结果</div>
      </div>
      <div className="analogy-bullets">
        {scene.bullets.map((bullet, index) => (
          <div
            key={bullet}
            className="analogy-bullet"
            style={revealStyle(frame, 8.8 + index * 4.2, fps, 44, 0)}
          >
            <span>{index + 1}</span>
            {bullet}
          </div>
        ))}
      </div>
      <InlineCallout className="bottom-note" tone="success">
        {scene.bottomNote}
      </InlineCallout>
    </AbsoluteFill>
  );
};

const EngineeringTranslation: FC<{ scene: EngineeringScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const promptCode = scene.promptBlocks
    .map((block) => `${block.label}: ${block.text}`)
    .join("\n");

  return (
    <AbsoluteFill>
      <SceneBadge label={scene.label} />
      <div className="engineering-title" style={revealStyle(frame, 0.25, fps)}>
        <BitBlurWords>{scene.title}</BitBlurWords>
      </div>
      <div className="mapping-table">
        {scene.mapping.map((pair, index) => (
          <div
            key={pair.abstract}
            className="mapping-row"
            style={revealStyle(frame, 3.2 + index * 2.1, fps, -42, 0)}
          >
            <span>{pair.abstract}</span>
            <strong>{pair.action}</strong>
          </div>
        ))}
      </div>
      <div className="prompt-panel" style={revealStyle(frame, 13.4, fps, 0, 38)}>
        <div className="panel-kicker">bit-typing-code-block / Prompt</div>
        <TypingCodeBlockPanel code={promptCode} delay={15} language="markdown" />
      </div>
      <InlineCallout className="engineering-principle" tone="warning">
        {scene.principle}
      </InlineCallout>
    </AbsoluteFill>
  );
};

const MiniDemo: FC<{ scene: MiniDemoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const activeStep = Math.min(
    scene.steps.length - 1,
    Math.floor(value(frame, [3 * fps, 34 * fps], [0, scene.steps.length], softInOut)),
  );

  return (
    <AbsoluteFill>
      <SceneBadge label={scene.label} />
      <div className="demo-title" style={revealStyle(frame, 0.25, fps)}>
        <BitBlurWords>{scene.title}</BitBlurWords>
      </div>
      <div className="demo-steps">
        {scene.steps.map((step, index) => (
          <div
            key={step.label}
            className="demo-step"
            style={{
              ...revealStyle(frame, 2.2 + index * 4.2, fps, -34, 0),
              borderColor: index <= activeStep ? teal : "rgba(246,251,255,0.16)",
            }}
          >
            <span>{step.label}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="artifact-stack">
        <ReadmePanel lines={scene.readmeLines} delay={4.2} />
      </div>
      <TerminalPanel lines={scene.terminalLines} />
    </AbsoluteFill>
  );
};

const ReadmePanel: FC<{ delay: number; lines: string[] }> = ({ delay, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const code = lines.join("\n");

  return (
    <div className="readme-panel" style={revealStyle(frame, delay, fps, 38, 0)}>
      <div className="window-bar">
        <span />
        <span />
        <span />
        bit-basic-code-block / README.md
      </div>
      <CodeBlock
        code={code}
        fontSize={23}
        language="markdown"
        lineHeight={1.45}
        padding={22}
        showLineNumbers={false}
        theme="dark"
        transition={{
          duration: 30,
          lineStagger: 5,
          opacity: [0, 1],
          y: [10, 0],
        }}
      />
    </div>
  );
};

const TypingCodeBlockPanel: FC<{
  code: string;
  delay: number;
  language: string;
}> = ({ code, delay, language }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay * fps);
  const charIndex = Math.floor(local / 0.58);
  const showCursor = Math.floor(frame / 15) % 2 === 0;
  const visibleCode = code.slice(0, charIndex);

  return (
    <CodeBlock
      code={visibleCode + (showCursor ? "|" : " ")}
      fontSize={22}
      language={language}
      lineHeight={1.35}
      padding={20}
      showLineNumbers={false}
      theme="dark"
      transition={{ opacity: [0, 1], y: [12, 0], frames: [0, 20] }}
    />
  );
};

const TerminalPanel: FC<{ lines: MiniDemoScene["terminalLines"] }> = ({
  lines,
}) => {
  const terminalLines: RemocnTerminalLine[] = lines.map((line, index) => ({
    delay: index === 0 ? 0 : 8,
    text: line.text,
    type: line.prompt
      ? "command"
      : line.tone === "success"
        ? "success"
        : line.tone === "warning"
          ? "error"
          : "log",
  }));

  return (
    <div className="terminal-simulator-shell">
      <TerminalSimulator
        background="#071018"
        charsPerFrame={1.4}
        chromeColor="#0f1d25"
        chunkSize={5}
        fontSize={24}
        lines={terminalLines}
        prompt=">"
        title="remocn terminal-simulator / 验证闭环"
      />
    </div>
  );
};

const Pitfall: FC<{ scene: PitfallScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <SceneBadge label={scene.label} />
      <div className="pitfall-title" style={revealStyle(frame, 0.2, fps)}>
        <BitBlurWords>{scene.title}</BitBlurWords>
      </div>
      <CompareList
        delay={2.0}
        items={scene.badItems}
        tone="bad"
        title={scene.badTitle}
        x={104}
      />
      <CompareList
        delay={5.6}
        items={scene.goodItems}
        tone="good"
        title={scene.goodTitle}
        x={570}
      />
      <InlineCallout className="pitfall-warning" tone="warning">
        {scene.warning}
      </InlineCallout>
    </AbsoluteFill>
  );
};

const CompareList: FC<{
  delay: number;
  items: string[];
  title: string;
  tone: "bad" | "good";
  x: number;
}> = ({ delay, items, title, tone, x }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = tone === "bad" ? coral : teal;

  return (
    <div
      className={`compare-list ${tone}`}
      style={{ left: x, ...revealStyle(frame, delay, fps, 0, 34) }}
    >
      <div className="compare-title" style={{ color }}>
        {title}
      </div>
      {items.map((item, index) => (
        <div
          key={item}
          className="compare-item"
          style={revealStyle(frame, delay + 0.7 + index * 0.7, fps, 18, 0)}
        >
          <span style={{ backgroundColor: color }}>{tone === "bad" ? "x" : "✓"}</span>
          {item}
        </div>
      ))}
    </div>
  );
};

const Takeaway: FC<{ scene: TakeawayScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sign = pop(frame, 5.7, fps);

  return (
    <AbsoluteFill>
      <div className="takeaway-wrap">
        <div className="panel-kicker">{scene.title}</div>
        <BitBlurWords className="takeaway-principle" split="character">
          {scene.principle}
        </BitBlurWords>
        <div className="takeaway-checklist">
          {scene.checklist.map((item, index) => (
            <span
              key={item}
              style={{
                ...revealStyle(frame, 2.4 + index * 0.45, fps, 0, 18),
                borderColor: [teal, blue, yellow][index],
              }}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="next-title" style={revealStyle(frame, 4.2, fps)}>
          {scene.nextTitle}
        </div>
        <div
          className="signoff"
          style={{ transform: `scale(${sign}) rotate(-2deg)` }}
        >
          {scene.signoff}
        </div>
      </div>
    </AbsoluteFill>
  );
};
