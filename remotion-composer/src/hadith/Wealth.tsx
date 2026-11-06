import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  interpolateColors,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  C,
  CARRY,
  DUA,
  Figure,
  FIG_X,
  FontFaces,
  H,
  HORIZON,
  Key,
  OPEN,
  Plaque,
  Pose,
  SANS,
  SERIF,
  STAND,
  STRAIN,
  W,
  keyed,
  poseAt,
} from "./Hadith";

const ARABIC = "'Amiri', serif";

const POSES: Key<Pose>[] = [
  [0, STAND],
  [240, STAND],
  [262, CARRY],
  [330, CARRY],
  [395, STRAIN],
  [440, STRAIN],
  [480, STAND],
  [515, OPEN],
  [598, OPEN],
  [630, DUA],
  [900, DUA],
];

type Cue = { from: number; to: number; text: string; arabic?: boolean };
const CUES: Cue[] = [
  { from: 8, to: 80, text: "Пророк ﷺ сказал:" },
  {
    from: 84,
    to: 236,
    arabic: true,
    text: "لَيْسَ الْغِنَى عَنْ كَثْرَةِ الْعَرَضِ،\nوَلَكِنَّ الْغِنَى غِنَى النَّفْسِ",
  },
  { from: 240, to: 420, text: "«Богатство не в обилии\nимущества," },
  { from: 424, to: 600, text: "истинное богатство —\nбогатство души»." },
];

const Subtitle: React.FC<{ frame: number }> = ({ frame }) => {
  const cue = CUES.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;
  const local = frame - cue.from;
  const dur = cue.to - cue.from;
  const op = interpolate(local, [0, 12, dur - 8, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dy = interpolate(local, [0, 16], [18, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: cue.arabic ? 1270 : 1290,
        textAlign: "center",
        fontFamily: cue.arabic ? ARABIC : SERIF,
        fontWeight: 700,
        fontSize: cue.arabic ? 64 : 60,
        lineHeight: cue.arabic ? 1.75 : 1.25,
        direction: cue.arabic ? "rtl" : "ltr",
        whiteSpace: "pre-line",
        textWrap: "balance",
        color: cue.arabic ? "#6A4A22" : C.text,
        opacity: op,
        transform: `translateY(${dy}px)`,
        textShadow: "0 2px 18px rgba(244,234,219,0.9)",
      }}
    >
      {cue.text}
    </div>
  );
};

const THINGS = ["ДЕНЬГИ", "ДОМ", "МАШИНА", "БРЕНДЫ", "ЛАЙКИ"];
const DROPS = [256, 284, 312, 340, 368];

export const Wealth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dark = keyed(frame, [
    [250, 0],
    [310, 0.65],
    [420, 0.65],
    [470, 0],
  ]);
  const bright = keyed(frame, [
    [440, 0],
    [500, 1],
  ]);
  const skyTop = interpolateColors(dark, [0, 1], [
    interpolateColors(bright, [0, 1], [C.skyTop, C.skyTopLight]),
    C.skyTopDark,
  ]);
  const skyBottom = interpolateColors(dark, [0, 1], [
    interpolateColors(bright, [0, 1], [C.skyBottom, C.skyBottomLight]),
    C.skyBottomDark,
  ]);

  const camScale = keyed(frame, [
    [0, 1.25],
    [100, 1.0],
    [240, 1.0],
    [400, 1.15],
    [470, 1.15],
    [600, 0.95],
    [720, 0.88],
  ]);
  const camOX = FIG_X;
  const camOY = 960;

  const pose = poseAt(frame, POSES);
  const handY = (pose.lHand[1] + pose.rHand[1]) / 2;
  const handX = (pose.lHand[0] + pose.rHand[0]) / 2;
  const chestX = FIG_X + (pose.neck[0] + pose.hip[0]) / 2;
  const chestY = HORIZON + pose.neck[1] * 0.65 + pose.hip[1] * 0.35;

  const heart = keyed(frame, [
    [430, 0],
    [485, 1],
    [600, 1],
    [700, 0.75],
  ]);
  const halo = keyed(frame, [
    [0, 0.35],
    [240, 0.35],
    [300, 0],
    [470, 0],
    [520, 0.8],
  ]);

  const endOp = keyed(frame, [
    [604, 0],
    [628, 1],
  ]);
  const logoOp = keyed(frame, [
    [700, 0],
    [728, 1],
  ]);
  const logoScale = interpolate(frame, [700, 800], [1.0, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const intro = keyed(frame, [
    [0, 0],
    [14, 1],
  ]);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(${skyTop}, ${skyBottom} 60%)` }}>
      <FontFaces />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="limbGrad" gradientUnits="userSpaceOnUse" x1="-90" y1="-420" x2="90" y2="0">
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
          <radialGradient id="heartGrad">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="0.25" stopColor="#FFE9B8" stopOpacity="0.9" />
            <stop offset="1" stopColor="#F2C76E" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="coinGrad" cx="0.35" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#F7DB95" />
            <stop offset="1" stopColor="#B88327" />
          </radialGradient>
          <filter id="blur12">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="blur4">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <g
          transform={`translate(${camOX},${camOY}) scale(${camScale}) translate(${-camOX},${-camOY})`}
          opacity={intro}
        >
          {/* soft halo behind figure */}
          <circle cx={FIG_X} cy={HORIZON - 420} r={540} fill="url(#sunGrad)" opacity={halo} />

          {/* arches */}
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

          {/* floor */}
          <rect x={-400} y={HORIZON} width={W + 800} height={H} fill="url(#floorGrad)" />
          <rect x={-400} y={HORIZON - 1} width={W + 800} height={3} fill="#C9B08A" opacity={0.6} />

          {/* lamps */}
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

          {/* shadow + reflection */}
          <ellipse cx={FIG_X} cy={HORIZON + 4} rx={70} ry={10} fill="#6E5038" opacity={0.25} filter="url(#blur4)" />
          <g transform={`translate(0, ${HORIZON * 2}) scale(1,-1)`} opacity={0.13}>
            <Figure pose={pose} x={FIG_X} y={HORIZON} />
          </g>

          {/* coins piling around the feet */}
          {new Array(34).fill(0).map((_, i) => {
            const start = 250 + random(`cs${i}`) * 150;
            const t = frame - start;
            if (t < 0) return null;
            const side = random(`cx${i}`) < 0.5 ? -1 : 1;
            const cx = FIG_X + side * (55 + random(`cd${i}`) * 230);
            const restY = HORIZON - 7 - random(`cy${i}`) * 16;
            const fall = Math.min(1, (t / 22) ** 2);
            const cy = -100 + (restY + 100) * fall;
            const gone = keyed(frame, [
              [432 + random(`cg${i}`) * 20, 0],
              [478 + random(`cg${i}`) * 20, 1],
            ]);
            if (gone >= 1) return null;
            return (
              <g key={i} opacity={1 - gone} transform={`translate(${cx}, ${cy - gone * 220})`}>
                <ellipse rx={17} ry={fall >= 1 ? 6 : 17} fill="url(#coinGrad)" stroke="#9A6C1F" strokeWidth={1.5} />
              </g>
            );
          })}

          <Figure pose={pose} x={FIG_X} y={HORIZON} />

          {/* inner light: wealth of the soul */}
          <g opacity={heart}>
            <circle cx={chestX} cy={chestY} r={60 + heart * 220} fill="url(#heartGrad)" />
            {new Array(14).fill(0).map((_, i) => {
              const a = (i / 14) * Math.PI * 2 + frame / 140;
              const r0 = 70;
              const r1 = 70 + heart * (200 + 60 * Math.sin(frame / 12 + i));
              return (
                <line
                  key={i}
                  x1={chestX + Math.cos(a) * r0}
                  y1={chestY + Math.sin(a) * r0}
                  x2={chestX + Math.cos(a) * r1}
                  y2={chestY + Math.sin(a) * r1}
                  stroke="#F3D38A"
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={0.45}
                />
              );
            })}
            <circle cx={chestX} cy={chestY} r={13} fill="#FFFDF6" />
          </g>

          {/* worldly things fall and stack on the hands */}
          {THINGS.map((label, i) => {
            const t = frame - DROPS[i];
            if (t < 0) return null;
            const land = spring({ frame: t, fps, config: { damping: 18, stiffness: 140, mass: 0.9 } });
            const targetY = HORIZON + handY - 40 - i * 66;
            const cy = interpolate(land, [0, 1], [-200, targetY]);
            const dissolve = keyed(frame, [
              [430 + i * 6, 0],
              [476 + i * 6, 1],
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

          {/* dust */}
          {new Array(46).fill(0).map((_, i) => {
            const px = random(`px${i}`) * W;
            const speed = 0.4 + random(`sp${i}`) * 0.9;
            const py = ((random(`py${i}`) * H - frame * speed * 2) % H + H) % H;
            const r = 2 + random(`r${i}`) * 3.5;
            return (
              <circle
                key={i}
                cx={px + Math.sin(frame / 40 + i) * 12}
                cy={py}
                r={r * (1 + heart * 0.4)}
                fill={C.gold}
                opacity={(0.18 + 0.25 * random(`o${i}`)) * (1 - dark * 0.6) + heart * 0.2}
              />
            );
          })}
        </g>
      </svg>

      {/* top label + handle */}
      <div
        style={{
          position: "absolute",
          top: 190,
          width: "100%",
          textAlign: "center",
          opacity: intro * (1 - endOp),
          color: C.text,
        }}
      >
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 8, opacity: 0.6 }}>
          ЛУЧШЕЕ БОГАТСТВО
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, opacity: 0.45, marginTop: 10 }}>
          @its.ummanur
        </div>
      </div>

      <Subtitle frame={frame} />

      {/* source card */}
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
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 66, color: C.text }}>Лучшее богатство</div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 38,
            color: C.text,
            opacity: 0.7,
            marginTop: 22,
          }}
        >
          Сахих аль-Бухари, 6446; Муслим, 1051
        </div>
      </div>

      {/* logo outro */}
      {logoOp > 0 && (
        <AbsoluteFill style={{ opacity: logoOp, backgroundColor: "#EFE6DA" }}>
          <Img
            src={staticFile("hadith/logo_ummanur.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${logoScale})` }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
