import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  interpolateColors,
  random,
  staticFile,
  useCurrentFrame,
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

// Surah Ash-Sharh (94). Russian: E. Kuliev.
const AYAHS: { ar: string; ru: string }[] = [
  { ar: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ", ru: "Разве Мы не раскрыли для тебя твою грудь" },
  { ar: "وَوَضَعْنَا عَنكَ وِزْرَكَ", ru: "и не сняли с тебя бремя," },
  { ar: "الَّذِي أَنقَضَ ظَهْرَكَ", ru: "которое тяготило твою спину?" },
  { ar: "وَرَفَعْنَا لَكَ ذِكْرَكَ", ru: "Разве Мы не возвысили для тебя твоё поминание?" },
  { ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", ru: "Воистину, за каждой тягостью наступает облегчение." },
  { ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", ru: "Воистину, за каждой тягостью наступает облегчение." },
  { ar: "فَإِذَا فَرَغْتَ فَانصَبْ", ru: "Посему, когда освободишься, усердствуй" },
  { ar: "وَإِلَىٰ رَبِّكَ فَارْغَب", ru: "и обращайся с желанием к своему Господу." },
];
const START = 75;
const STEP = 130;
const ayahFrom = (i: number) => START + STEP * i;
export const SHARH_DURATION = ayahFrom(8) + 95;
const LOGO_AT = ayahFrom(8) + 5;

const POSES: Key<Pose>[] = [
  [0, STRAIN],
  [215, STRAIN],
  [280, CARRY],
  [350, STAND],
  [470, STAND],
  [505, OPEN],
  [580, OPEN],
  [612, STAND],
  [860, STAND],
  [890, DUA],
  [985, DUA],
  [1020, OPEN],
  [2000, OPEN],
];

const BURDEN = ["БРЕМЯ", "ТРЕВОГИ", "ГРУЗ"];

const AyahText: React.FC<{ frame: number }> = ({ frame }) => {
  const i = AYAHS.findIndex((_, k) => frame >= ayahFrom(k) && frame < ayahFrom(k) + STEP - 4);
  if (i < 0) return null;
  const local = frame - ayahFrom(i);
  const dur = STEP - 4;
  const op = interpolate(local, [0, 12, dur - 10, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ruOp = interpolate(local, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dy = interpolate(local, [0, 16], [18, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const a = AYAHS[i];
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: 1250,
        textAlign: "center",
        opacity: op,
        transform: `translateY(${dy}px)`,
        color: C.text,
        textShadow: "0 2px 18px rgba(244,234,219,0.9)",
      }}
    >
      <div style={{ fontFamily: ARABIC, fontWeight: 700, fontSize: 76, direction: "rtl", color: "#6A4A22", lineHeight: 1.6 }}>
        {a.ar}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 52,
          lineHeight: 1.25,
          marginTop: 14,
          textWrap: "balance",
          opacity: ruOp,
        }}
      >
        {a.ru}
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: 3, marginTop: 22, opacity: 0.5 * ruOp }}>
        94:{i + 1}
      </div>
    </div>
  );
};

export const Sharh: React.FC = () => {
  const frame = useCurrentFrame();

  const dark = keyed(frame, [
    [0, 0.35],
    [90, 0.35],
    [300, 0],
    [598, 0],
    [640, 0.8],
    [680, 0.8],
    [722, 0],
  ]);
  const bright = keyed(frame, [
    [690, 0],
    [760, 1],
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
    [0, 1.22],
    [75, 1.08],
    [350, 1.0],
    [470, 1.0],
    [560, 0.92],
    [700, 1.1],
    [850, 1.0],
    [1110, 0.88],
  ]);
  const camOX = FIG_X;
  const camOY = 960;

  const pose = poseAt(frame, POSES);
  const handY = (pose.lHand[1] + pose.rHand[1]) / 2;
  const handX = (pose.lHand[0] + pose.rHand[0]) / 2;
  const chestX = FIG_X + (pose.neck[0] + pose.hip[0]) / 2;
  const chestY = HORIZON + pose.neck[1] * 0.65 + pose.hip[1] * 0.35;

  // 94:1 chest opens with light
  const heart = keyed(frame, [
    [95, 0],
    [160, 1],
    [598, 1],
    [640, 0.45],
    [740, 1],
  ]);
  // 94:4 raised remembrance: halo rising above
  const halo = keyed(frame, [
    [470, 0],
    [560, 1],
    [598, 1],
    [640, 0.3],
    [740, 0.9],
  ]);
  // 94:5-6 beam through the cloud
  const beamLen = keyed(frame, [
    [662, 0],
    [690, 1],
  ]);
  const beamOp = keyed(frame, [
    [660, 0],
    [668, 1],
    [850, 1],
    [900, 0.3],
  ]);
  const beamW = keyed(frame, [
    [725, 1],
    [790, 2.2],
  ]);
  // 94:8 crescent
  const moon = keyed(frame, [
    [990, 0],
    [1040, 1],
  ]);

  const titleOp = keyed(frame, [
    [6, 0],
    [20, 1],
    [58, 1],
    [72, 0],
  ]);
  const logoOp = keyed(frame, [
    [LOGO_AT, 0],
    [LOGO_AT + 25, 1],
  ]);
  const logoScale = interpolate(frame, [LOGO_AT, SHARH_DURATION], [1.0, 1.07], {
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
          <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF8E8" stopOpacity="0.1" />
            <stop offset="0.7" stopColor="#FFF4D8" stopOpacity="0.85" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
          <mask id="moonMask">
            <rect x={0} y={0} width={W} height={H} fill="white" />
            <circle cx={FIG_X + 34} cy={HORIZON - 760} r={62} fill="black" />
          </mask>
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
          {/* halo of remembrance */}
          <circle cx={FIG_X} cy={HORIZON - 420 - halo * 160} r={560} fill="url(#sunGrad)" opacity={halo} />

          {/* crescent */}
          <g opacity={moon}>
            <circle cx={FIG_X} cy={HORIZON - 760} r={150} fill={C.goldSoft} opacity={0.35} filter="url(#blur40)" />
            <circle cx={FIG_X} cy={HORIZON - 760} r={70} fill="#E9C47A" mask="url(#moonMask)" />
          </g>

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

          {/* cloud (hardship) */}
          <g opacity={keyed(frame, [[598, 0], [640, 0.85], [690, 0.85], [740, 0]])} filter="url(#blur40)">
            <ellipse cx={FIG_X - 120} cy={360} rx={360} ry={110} fill="#8F7A5E" />
            <ellipse cx={FIG_X + 160} cy={330} rx={320} ry={120} fill="#8A7458" />
            <ellipse cx={FIG_X + 20} cy={420} rx={420} ry={90} fill="#9C876A" />
          </g>

          {/* floor */}
          <rect x={-400} y={HORIZON} width={W + 800} height={H} fill="url(#floorGrad)" />
          <rect x={-400} y={HORIZON - 1} width={W + 800} height={3} fill="#C9B08A" opacity={0.6} />

          {/* lamps: light up one by one with ease (94:6) */}
          {[-440, -330, -220, -120, 120, 220, 330, 440].map((dx, i) => {
            const fl = 0.75 + 0.25 * Math.sin(frame / 6 + i * 1.7);
            const on = 0.45 + 0.55 * keyed(frame, [[730 + Math.abs(dx) / 4, 0], [760 + Math.abs(dx) / 4, 1]]);
            return (
              <g key={dx}>
                <circle cx={FIG_X + dx} cy={HORIZON - 8} r={22 + on * 10} fill={C.goldSoft} opacity={0.35 * fl * on} filter="url(#blur12)" />
                <circle cx={FIG_X + dx} cy={HORIZON - 8} r={5} fill="#FFE7B0" opacity={0.95} />
                <rect x={FIG_X + dx - 9} y={HORIZON - 4} width={18} height={6} rx={3} fill="#8C6A4C" />
              </g>
            );
          })}

          {/* beam */}
          <g opacity={beamOp}>
            <rect
              x={FIG_X - 70 * beamW}
              y={-200}
              width={140 * beamW}
              height={(HORIZON + 200) * beamLen}
              fill="url(#beamGrad)"
              filter="url(#blur12)"
              opacity={0.55}
            />
            <rect x={FIG_X - 4} y={-200} width={8} height={(HORIZON + 200) * beamLen} fill="url(#beamGrad)" />
            <ellipse cx={FIG_X} cy={HORIZON} rx={190 * beamLen * beamW} ry={26 * beamLen} fill="#FFF6DF" filter="url(#blur12)" />
          </g>

          {/* shadow + reflection */}
          <ellipse cx={FIG_X} cy={HORIZON + 4} rx={70} ry={10} fill="#6E5038" opacity={0.25} filter="url(#blur4)" />
          <g transform={`translate(0, ${HORIZON * 2}) scale(1,-1)`} opacity={0.13}>
            <Figure pose={pose} x={FIG_X} y={HORIZON} />
          </g>

          <Figure pose={pose} x={FIG_X} y={HORIZON} />

          {/* light in the chest */}
          <g opacity={heart}>
            <circle cx={chestX} cy={chestY} r={50 + heart * 170} fill="url(#heartGrad)" />
            {new Array(12).fill(0).map((_, i) => {
              const a = (i / 12) * Math.PI * 2 + frame / 150;
              const r1 = 64 + heart * (140 + 40 * Math.sin(frame / 12 + i));
              return (
                <line
                  key={i}
                  x1={chestX + Math.cos(a) * 64}
                  y1={chestY + Math.sin(a) * 64}
                  x2={chestX + Math.cos(a) * r1}
                  y2={chestY + Math.sin(a) * r1}
                  stroke="#F3D38A"
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={0.4}
                />
              );
            })}
            <circle cx={chestX} cy={chestY} r={12} fill="#FFFDF6" />
          </g>

          {/* burden: lifted away (94:2-3) */}
          {BURDEN.map((label, i) => {
            const lift = keyed(frame, [
              [212 + i * 10, 0],
              [330 + i * 10, 1],
            ]);
            if (lift >= 1) return null;
            const baseY = HORIZON + handY - 40 - i * 66;
            const lifted = HORIZON - 380 - 40 - i * 66 - lift * 760;
            const cy = lift > 0 ? Math.min(baseY, lifted + (baseY - lifted) * (1 - lift) ** 3) : baseY;
            return (
              <Plaque
                key={label}
                label={label}
                cx={FIG_X + handX + (lift > 0 ? (i - 1) * 90 * lift : Math.sin(frame / 9 + i) * 2)}
                cy={cy}
                opacity={1 - lift * lift}
                scale={1 - lift * 0.3}
                glow={lift}
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
                r={r}
                fill={C.gold}
                opacity={(0.18 + 0.25 * random(`o${i}`)) * (1 - dark * 0.6) + bright * 0.12}
              />
            );
          })}
        </g>
      </svg>

      {/* top label + handle */}
      <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", opacity: intro, color: C.text }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 8, opacity: 0.6 }}>
          СУРА АШ-ШАРХ
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, opacity: 0.45, marginTop: 10 }}>
          @its.ummanur
        </div>
      </div>

      {/* intro title */}
      <div style={{ position: "absolute", top: 1280, width: "100%", textAlign: "center", opacity: titleOp, color: C.text }}>
        <div style={{ fontFamily: ARABIC, fontWeight: 700, fontSize: 84, color: "#6A4A22" }}>سُورَةُ الشَّرْح</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, marginTop: 6 }}>Сура «Раскрытие»</div>
      </div>

      <AyahText frame={frame} />

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
