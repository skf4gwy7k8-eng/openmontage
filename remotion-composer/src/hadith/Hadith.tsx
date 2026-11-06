import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import fonts from "./fonts.json";

// ---------------------------------------------------------------------------
// Palette (beige)
// ---------------------------------------------------------------------------
const C = {
  skyTop: "#F4EADB",
  skyBottom: "#E7D5B6",
  skyTopDark: "#CDBB9F",
  skyBottomDark: "#BCA684",
  skyTopLight: "#FBF4E6",
  skyBottomLight: "#EEDDBD",
  floorTop: "#D9C39F",
  floorBottom: "#C8AE86",
  figure: "#6E5038",
  figureLight: "#8C6A4C",
  text: "#3D2B1D",
  plaque: "#3D2B1D",
  plaqueText: "#F4EADB",
  gold: "#C08F3A",
  goldSoft: "#E6C27A",
};

const W = 1080;
const H = 1920;
const HORIZON = 1150;
const FIG_X = 540;

// ---------------------------------------------------------------------------
// Fonts (self-hosted copies of Google Fonts: PT Serif, Manrope, Amiri for ﷺ)
// ---------------------------------------------------------------------------
const FontFaces: React.FC = () => {
  const css = (fonts as Array<Record<string, string>>)
    .map(
      (f) =>
        `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};font-display:block;src:url(${staticFile(
          f.file,
        )}) format('woff2');unicode-range:${f.range};}`,
    )
    .join("\n");
  return <style>{css}</style>;
};

const SERIF = "'PT Serif', 'Amiri', serif";
const SANS = "'Manrope', 'Inter', sans-serif";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type Key<T> = [number, T];
const ease = Easing.bezier(0.45, 0, 0.25, 1);

function keyed(frame: number, keys: Key<number>[]): number {
  return interpolate(
    frame,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

type P = [number, number];
type Pose = Record<
  | "head"
  | "neck"
  | "hip"
  | "lElbow"
  | "lHand"
  | "rElbow"
  | "rHand"
  | "lKnee"
  | "lFoot"
  | "rKnee"
  | "rFoot",
  P
>;

const STAND: Pose = {
  head: [0, -338],
  neck: [0, -290],
  hip: [0, -165],
  lElbow: [-34, -222],
  lHand: [-42, -155],
  rElbow: [34, -222],
  rHand: [42, -155],
  lKnee: [-20, -84],
  lFoot: [-28, 0],
  rKnee: [20, -84],
  rFoot: [28, 0],
};
const OPEN: Pose = {
  ...STAND,
  head: [0, -342],
  lElbow: [-70, -320],
  lHand: [-110, -385],
  rElbow: [70, -320],
  rHand: [110, -385],
};
const DUA: Pose = {
  ...STAND,
  head: [0, -334],
  lElbow: [-62, -232],
  lHand: [-52, -300],
  rElbow: [62, -232],
  rHand: [52, -300],
};
const CARRY: Pose = {
  ...STAND,
  head: [0, -334],
  lElbow: [-62, -330],
  lHand: [-44, -400],
  rElbow: [62, -330],
  rHand: [44, -400],
};
const STRAIN: Pose = {
  head: [6, -296],
  neck: [4, -252],
  hip: [0, -132],
  lElbow: [-58, -290],
  lHand: [-40, -352],
  rElbow: [66, -290],
  rHand: [48, -352],
  lKnee: [-46, -66],
  lFoot: [-38, 0],
  rKnee: [46, -66],
  rFoot: [38, 0],
};

const POSE_KEYS: Key<Pose>[] = [
  [0, STAND],
  [285, STAND],
  [318, OPEN],
  [405, OPEN],
  [435, DUA],
  [482, DUA],
  [500, CARRY],
  [545, CARRY],
  [585, STRAIN],
  [625, STRAIN],
  [660, STAND],
  [680, DUA],
  [800, DUA],
];

function poseAt(frame: number): Pose {
  let i = 0;
  while (i < POSE_KEYS.length - 2 && frame > POSE_KEYS[i + 1][0]) i++;
  const [f0, a] = POSE_KEYS[i];
  const [f1, b] = POSE_KEYS[i + 1];
  const t = ease(Math.min(1, Math.max(0, (frame - f0) / (f1 - f0))));
  const out = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    out[k] = [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t];
  });
  // gentle breathing
  const breath = Math.sin(frame / 18) * 2.2;
  (["head", "neck", "lElbow", "rElbow", "lHand", "rHand"] as (keyof Pose)[]).forEach((k) => {
    out[k] = [out[k][0], out[k][1] + breath];
  });
  return out;
}

// ---------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------
const Figure: React.FC<{ pose: Pose; x: number; y: number; opacity?: number }> = ({
  pose,
  x,
  y,
  opacity = 1,
}) => {
  const p = (k: keyof Pose) => `${pose[k][0]},${pose[k][1]}`;
  const limb = (a: (keyof Pose)[]) => `M ${a.map(p).join(" L ")}`;
  const stroke = {
    stroke: "url(#limbGrad)",
    strokeWidth: 27,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  return (
    <g transform={`translate(${x},${y})`} opacity={opacity}>
      <path d={limb(["hip", "lKnee", "lFoot"])} {...stroke} />
      <path d={limb(["hip", "rKnee", "rFoot"])} {...stroke} />
      <path d={limb(["neck", "hip"])} {...stroke} strokeWidth={31} />
      <path d={limb(["neck", "lElbow", "lHand"])} {...stroke} />
      <path d={limb(["neck", "rElbow", "rHand"])} {...stroke} />
      <circle cx={pose.head[0]} cy={pose.head[1]} r={37} fill="url(#headGrad)" />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Plaque
// ---------------------------------------------------------------------------
const Plaque: React.FC<{
  label: string;
  cx: number;
  cy: number;
  opacity?: number;
  scale?: number;
  glow?: number;
  light?: boolean;
}> = ({ label, cx, cy, opacity = 1, scale = 1, glow = 0, light = false }) => {
  const w = label.length * 25 + 72;
  const h = 62;
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} opacity={opacity}>
      {glow > 0 && (
        <rect
          x={-w / 2 - 14}
          y={-h / 2 - 14}
          width={w + 28}
          height={h + 28}
          rx={22}
          fill={C.goldSoft}
          opacity={glow * 0.55}
          filter="url(#blur12)"
        />
      )}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={12}
        fill={light ? "#FFF8EA" : C.plaque}
        stroke={light ? C.gold : "rgba(255,240,215,0.18)"}
        strokeWidth={2}
      />
      <text
        x={0}
        y={11}
        textAnchor="middle"
        fontFamily={SANS}
        fontWeight={800}
        fontSize={30}
        letterSpacing={2.5}
        fill={light ? C.text : C.plaqueText}
      >
        {label}
      </text>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Subtitles
// ---------------------------------------------------------------------------
const CUES: { from: number; to: number; text: string }[] = [
  { from: 8, to: 78, text: "Пророк ﷺ сказал:" },
  { from: 82, to: 180, text: "«Удивительно положение верующего!" },
  { from: 184, to: 286, text: "Поистине, всё в его делах — благо для него." },
  { from: 296, to: 416, text: "Если его постигает радость — он благодарит Аллаха," },
  { from: 420, to: 486, text: "и это становится благом для него." },
  { from: 492, to: 604, text: "А если постигает горе — он проявляет терпение," },
  { from: 608, to: 700, text: "и это тоже становится благом для него»." },
];

const Subtitle: React.FC<{ frame: number }> = ({ frame }) => {
  const cue = CUES.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;
  const local = frame - cue.from;
  const dur = cue.to - cue.from;
  const op = interpolate(local, [0, 10, dur - 8, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dy = interpolate(local, [0, 14], [18, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top: 1290,
        textAlign: "center",
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: 58,
        lineHeight: 1.25,
        textWrap: "balance",
        color: C.text,
        opacity: op,
        transform: `translateY(${dy}px)`,
        textShadow: "0 2px 18px rgba(244,234,219,0.9)",
      }}
    >
      {cue.text}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------
const JOY = ["РАДОСТЬ", "УСПЕХ", "ДОСТАТОК"];
const HARD = ["БОЛЕЗНЬ", "ПОТЕРИ", "ДОЛГИ", "ТРЕВОГА"];
const HARD_DROP = [496, 524, 552, 580];

export const Hadith: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Mood: 0 = normal, 1 = hardship (dark), -1 = relief (bright)
  const dark = keyed(frame, [
    [480, 0],
    [520, 1],
    [606, 1],
    [640, 0],
  ]);
  const bright = keyed(frame, [
    [610, 0],
    [660, 1],
    [800, 1],
  ]);
  const skyTop = interpolateColors(
    dark,
    [0, 1],
    [interpolateColors(bright, [0, 1], [C.skyTop, C.skyTopLight]), C.skyTopDark],
  );
  const skyBottom = interpolateColors(
    dark,
    [0, 1],
    [interpolateColors(bright, [0, 1], [C.skyBottom, C.skyBottomLight]), C.skyBottomDark],
  );

  // Camera
  const camScale = keyed(frame, [
    [0, 1.28],
    [110, 1.0],
    [290, 1.0],
    [470, 1.06],
    [600, 1.2],
    [700, 1.0],
    [800, 0.82],
  ]);
  const camOX = FIG_X;
  const camOY = 960;

  const pose = poseAt(frame);
  const handY = (pose.lHand[1] + pose.rHand[1]) / 2;
  const handX = (pose.lHand[0] + pose.rHand[0]) / 2;

  // Sun (joy)
  const sun = keyed(frame, [
    [280, 0],
    [330, 1],
    [470, 1],
    [500, 0],
    [650, 0],
    [700, 0.7],
  ]);
  // Beam (relief)
  const beamLen = keyed(frame, [
    [600, 0],
    [622, 1],
  ]);
  const beamOp = keyed(frame, [
    [598, 0],
    [606, 1],
    [690, 1],
    [730, 0.35],
  ]);
  // Cloud (hardship)
  const cloud = dark;

  // End card
  const endOp = keyed(frame, [
    [700, 0],
    [725, 1],
  ]);

  const intro = keyed(frame, [
    [0, 0],
    [14, 1],
  ]);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(${skyTop}, ${skyBottom} 60%)` }}>
      <FontFaces />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="limbGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.figureLight} />
            <stop offset="1" stopColor={C.figure} />
          </linearGradient>
          <radialGradient id="headGrad" cx="0.38" cy="0.32" r="0.75">
            <stop offset="0" stopColor="#A07D5C" />
            <stop offset="1" stopColor={C.figure} />
          </radialGradient>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={interpolateColors(dark, [0, 1], [C.floorTop, "#B9A27E"])} />
            <stop offset="1" stopColor={interpolateColors(dark, [0, 1], [C.floorBottom, "#A88F6B"])} />
          </linearGradient>
          <radialGradient id="sunGrad">
            <stop offset="0" stopColor="#FFF3D6" stopOpacity="1" />
            <stop offset="0.35" stopColor="#F6D892" stopOpacity="0.55" />
            <stop offset="1" stopColor="#F6D892" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF8E8" stopOpacity="0.1" />
            <stop offset="0.7" stopColor="#FFF4D8" stopOpacity="0.85" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
          <filter id="blur12">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="blur40">
            <feGaussianBlur stdDeviation="40" />
          </filter>
          <filter id="blur4">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <g
          transform={`translate(${camOX},${camOY}) scale(${camScale}) translate(${-camOX},${-camOY})`}
          opacity={intro}
        >
          {/* Sun glow behind figure */}
          <circle
            cx={FIG_X}
            cy={HORIZON - 380 - sun * 120}
            r={520}
            fill="url(#sunGrad)"
            opacity={sun}
          />

          {/* Arches in the distance (mosque silhouettes) */}
          <g opacity={0.22 - dark * 0.08} fill="#B89C74">
            {[-460, -250, 250, 460].map((dx, i) => {
              const ax = FIG_X + dx;
              const aw = i % 3 === 0 ? 120 : 150;
              const ah = i % 3 === 0 ? 280 : 360;
              return (
                <path
                  key={dx}
                  d={`M ${ax - aw / 2} ${HORIZON} L ${ax - aw / 2} ${HORIZON - ah + aw / 2} Q ${ax - aw / 2} ${
                    HORIZON - ah
                  } ${ax} ${HORIZON - ah - aw * 0.35} Q ${ax + aw / 2} ${HORIZON - ah} ${ax + aw / 2} ${
                    HORIZON - ah + aw / 2
                  } L ${ax + aw / 2} ${HORIZON} Z`}
                />
              );
            })}
          </g>

          {/* Cloud */}
          <g opacity={cloud * 0.85} filter="url(#blur40)">
            <ellipse cx={FIG_X - 120} cy={360 + (1 - cloud) * -120} rx={360} ry={110} fill="#8F7A5E" />
            <ellipse cx={FIG_X + 160} cy={330 + (1 - cloud) * -120} rx={320} ry={120} fill="#8A7458" />
            <ellipse cx={FIG_X + 20} cy={420 + (1 - cloud) * -120} rx={420} ry={90} fill="#9C876A" />
          </g>

          {/* Floor */}
          <rect x={-400} y={HORIZON} width={W + 800} height={H} fill="url(#floorGrad)" />
          <rect x={-400} y={HORIZON - 1} width={W + 800} height={3} fill="#C9B08A" opacity={0.6} />

          {/* Lamps along the horizon */}
          {[-440, -330, -220, -120, 120, 220, 330, 440].map((dx, i) => {
            const fl = 0.75 + 0.25 * Math.sin(frame / 6 + i * 1.7);
            return (
              <g key={dx}>
                <circle cx={FIG_X + dx} cy={HORIZON - 8} r={22} fill={C.goldSoft} opacity={0.35 * fl} filter="url(#blur12)" />
                <circle cx={FIG_X + dx} cy={HORIZON - 8} r={5} fill="#FFE7B0" opacity={0.95} />
                <rect x={FIG_X + dx - 9} y={HORIZON - 4} width={18} height={6} rx={3} fill="#8C6A4C" />
              </g>
            );
          })}

          {/* Beam */}
          <g opacity={beamOp}>
            <rect
              x={FIG_X - 70}
              y={-200}
              width={140}
              height={(HORIZON + 200) * beamLen}
              fill="url(#beamGrad)"
              filter="url(#blur12)"
              opacity={0.55}
            />
            <rect x={FIG_X - 4} y={-200} width={8} height={(HORIZON + 200) * beamLen} fill="url(#beamGrad)" />
            <ellipse cx={FIG_X} cy={HORIZON} rx={190 * beamLen} ry={26 * beamLen} fill="#FFF6DF" filter="url(#blur12)" />
          </g>

          {/* Shadow */}
          <ellipse cx={FIG_X} cy={HORIZON + 4} rx={70} ry={10} fill="#6E5038" opacity={0.25} filter="url(#blur4)" />

          {/* Reflection */}
          <g transform={`translate(0, ${HORIZON * 2}) scale(1,-1)`} opacity={0.13}>
            <Figure pose={pose} x={FIG_X} y={HORIZON} />
          </g>

          <Figure pose={pose} x={FIG_X} y={HORIZON} />

          {/* Joy plaques: rise and float away, glowing */}
          {JOY.map((label, i) => {
            const start = 312 + i * 26;
            const t = frame - start;
            if (t < 0 || t > 170) return null;
            const s = spring({ frame: t, fps, config: { damping: 14, stiffness: 90 } });
            const rise = interpolate(t, [0, 170], [0, 300], { easing: Easing.in(Easing.quad) });
            const dx = (i - 1) * 230;
            const op = interpolate(t, [0, 8, 120, 170], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <Plaque
                key={label}
                label={label}
                light
                cx={FIG_X + dx * s}
                cy={HORIZON - 480 - i * 70 - rise}
                scale={0.6 + 0.4 * s}
                opacity={op}
                glow={1}
              />
            );
          })}

          {/* Hardship plaques: fall and stack on the hands */}
          {HARD.map((label, i) => {
            const t = frame - HARD_DROP[i];
            if (t < 0) return null;
            const land = spring({ frame: t, fps, config: { damping: 18, stiffness: 140, mass: 0.9 } });
            const targetY = HORIZON + handY - 40 - i * 66;
            const cy = interpolate(land, [0, 1], [-200, targetY]);
            const dissolve = keyed(frame, [
              [622 + i * 6, 0],
              [668 + i * 6, 1],
            ]);
            if (dissolve >= 1) return null;
            return (
              <Plaque
                key={label}
                label={label}
                cx={FIG_X + handX + Math.sin(frame / 9 + i) * 2 * (1 - dissolve)}
                cy={cy - dissolve * 160}
                opacity={1 - dissolve}
                scale={1 - dissolve * 0.25}
                glow={dissolve}
              />
            );
          })}

          {/* Dust / light particles */}
          {new Array(46).fill(0).map((_, i) => {
            const px = random(`px${i}`) * W;
            const speed = 0.4 + random(`sp${i}`) * 0.9;
            const py = ((random(`py${i}`) * H - frame * speed * 2) % H + H) % H;
            const r = 2 + random(`r${i}`) * 3.5;
            const burst = keyed(frame, [
              [620, 0],
              [650, 1],
              [720, 0.4],
            ]);
            return (
              <circle
                key={i}
                cx={px + Math.sin(frame / 40 + i) * 12}
                cy={py}
                r={r * (1 + burst * 0.6)}
                fill={C.gold}
                opacity={(0.18 + 0.25 * random(`o${i}`)) * (1 - dark * 0.6) + burst * 0.3}
              />
            );
          })}
        </g>
      </svg>

      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: 200,
          width: "100%",
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 8,
          color: C.text,
          opacity: 0.55 * intro * (1 - endOp),
        }}
      >
        ХАДИС
      </div>

      <Subtitle frame={frame} />

      {/* End card */}
      <div
        style={{
          position: "absolute",
          top: 1270,
          width: "100%",
          textAlign: "center",
          opacity: endOp,
          transform: `translateY(${(1 - endOp) * 16}px)`,
        }}
      >
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: C.text }}>
          Благодарность и терпение
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 40, color: C.text, opacity: 0.7, marginTop: 22 }}>
          Сахих Муслим, 2999
        </div>
      </div>
    </AbsoluteFill>
  );
};
