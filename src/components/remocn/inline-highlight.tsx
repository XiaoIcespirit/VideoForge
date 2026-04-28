"use client";

import type { CSSProperties } from "react";
import {
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface InlineHighlightProps {
  before: string;
  highlight: string;
  after?: string;
  baseColor?: string;
  highlightColor?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  speed?: number;
  inline?: boolean;
  startFrame?: number;
  endFrame?: number;
  style?: CSSProperties;
  className?: string;
}

export function InlineHighlight({
  before,
  highlight,
  after = "",
  baseColor = "#171717",
  highlightColor = "#ff5e3a",
  fontSize = 48,
  fontWeight = 600,
  speed = 1,
  inline = false,
  startFrame,
  endFrame,
  style,
  className,
}: InlineHighlightProps) {
  const frame = useCurrentFrame() * speed;
  const { durationInFrames } = useVideoConfig();
  const progressStart = startFrame ?? durationInFrames * 0.2;
  const progressEnd = endFrame ?? durationInFrames * 0.7;

  const progress = interpolate(
    frame,
    [progressStart, progressEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const color = interpolateColors(
    progress,
    [0, 1],
    [baseColor, highlightColor],
  );

  const content = (
    <span
      className={className}
      style={{
        fontSize,
        fontWeight,
        color: baseColor,
        letterSpacing: 0,
        fontFamily:
          "Microsoft YaHei, PingFang SC, Noto Sans SC, -apple-system, BlinkMacSystemFont, sans-serif",
        ...style,
      }}
    >
      {before}
      <span style={{ color }}>{highlight}</span>
      {after}
    </span>
  );

  if (inline) {
    return content;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
      }}
    >
      {content}
    </div>
  );
}
