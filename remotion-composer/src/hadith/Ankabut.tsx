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
  DUA,
  Figure,
  FIG_X,
  FontFaces,
  H,
  HORIZON,
  Key,
  OPEN,
  Pose,
  SANS,
  SERIF,
  STAND,
  W,
  keyed,
  poseAt,
} from "./Hadith";

const ARABIC = "'Amiri', serif";

// Surah Al-Ankabut 29:56-59. Russian: E. Kuliev.
const SEGS: { ar: string; ru: string; ref: string }[] = [
  { ar: "يَا عِبَادِيَ الَّذِينَ آمَنُوا", ru: "О рабы Мои, которые уверовали!", ref: "29:56" },
  { ar: "إِنَّ أَرْضِي وَاسِعَةٌ فَإِيَّايَ فَاعْبُدُونِ", ru: "Воистину, земля Моя обширна. Поклоняйтесь же только Мне!", ref: "29:56" },
  { ar: "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ", ru: "Каждая душа вкусит смерть,", ref: "29:57" },
  { ar: "ثُمَّ إِلَيْنَا تُرْجَعُونَ", ru: "и затем вы будете возвращены к Нам.", ref: "29:57" },
  {
    ar: "وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ لَنُبَوِّئَنَّهُم مِّنَ الْجَنَّةِ غُرَفًا",
    ru: "Тех, которые уверовали и совершали праведные деяния, Мы непременно поселим в горницах Рая,",
    ref: "29:58",
  },
  { ar: "تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا", ru: "где текут реки. Они пребудут там вечно.", ref: "29:58" },
  { ar: "نِعْمَ أَجْرُ الْعَامِلِينَ", ru: "Как прекрасна награда тех, кто трудился,", ref: "29:58" },
  { ar: "الَّذِينَ صَبَرُوا وَعَلَىٰ رَبِّهِمْ يَتَوَكَّلُونَ", ru: "которые проявляли терпение и уповали на своего Господа!", ref: "29:59" },
];
const START = 75;
const STEP = 150;
const segFrom = (i: number) => START + STEP * i;
const LOGO_AT = segFrom(SEGS.length) + 5;
export const ANKABUT_DURATION = LOGO_AT + 95;

const POSES: Key<Pose>[] = [
  [0, STAND],
  [90, STAND],
  [120, DUA],
  [215, DUA],
  [245, STAND],
  [540, STAND],
  [570, DUA],
  [670, DUA],
  [700, STAND],
  [975, STAND],
  [1005, OPEN],
  [1110, OPEN],
  [1145, DUA],
  [3000, DUA],
];

const SegText: React.FC<{ frame: number }> = ({ frame }) => {
  const i = SEGS.findIndex((_, k) => frame >= segFrom(k) && frame < segFrom(k) + STEP - 4);
  if (i < 0) return null;
  const local = frame - segFrom(i);
  const dur = STEP - 4;
  const op = interpolate(local, [0, 12, dur - 10, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ruOp = interpolate(local, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dy = interpolate(local, [0, 16], [18, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const s = SEGS[i];
  const long = s.ar.length > 45;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: long ? 1225 : 1250,
        textAlign: "center",
        opacity: op,
        transform: `translateY(${dy}px)`,
        color: C.text,
        textShadow: "0 2px 18px rgba(244,234,219,0.9)",
      }}
    >
      <div
        style={{
          fontFamily: ARABIC,
          fontWeight: 700,
          fontSize: long ? 60 : 74,
          direction: "rtl",
          color: "#6A4A22",
          lineHeight: 1.6,
          textWrap: "balance",
        }}
      >
        {s.ar}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: long ? 44 : 52,
          lineHeight: 1.25,
          marginTop: 12,
          textWrap: "balance",
          opacity: ruOp,
        }}
      >
        {s.ru}
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: 3, marginTop: 20, opacity: 0.5 * ruOp }}>
        {s.ref}
      </div>
    </div>
  );
};

const ARCH_DX = [-820, -660, -460, -250, 250, 460, 660, 820];
const LAMP_DX = [-780, -640, -520, -440, -330, -220, -120, 120, 220, 330, 440, 520, 640, 780];

export const Ankabut: React.FC = () => {
  const frame = useCurrentFrame();

  const dark = keyed(frame, [
    [375, 0],
    [440, 0.9],
    [525, 0.9],
    [600, 0.2],
    [675, 0],
  ]);
  const bright = keyed(frame, [
    [660, 0],
    [740, 1],
  ]);
  const skyTop = interpolateColors(dark, [0, 1], [
    interpolateColors(bright, [0, 1], [C.skyTop, C.skyTopLight]),
    "#9E8D74",
  ]);
  const skyBottom = interpolateColors(dark, [0, 1], [
    interpolateColors(bright, [0, 1], [C.skyBottom, C.skyBottomLight]),
    "#8E7C62",
  ]);

  const camScale = keyed(frame, [
    [0, 1.2],
    [75, 1.05],
    [215, 1.0],
    [235, 1.0],
    [330, 0.62],
    [370, 0.62],
    [430, 1.0],
    [675, 1.0],
    [770, 0.86],
    [1100, 0.92],
    [1275, 0.85],
  ]);
  const camOX = FIG_X;
  const camOY = 960;

  const pose = poseAt(frame, POSES);
  const chestX = FIG_X + (pose.neck[0] + pose.hip[0]) / 2;
  const chestY = HORIZON + pose.neck[1] * 0.65 + pose.hip[1] * 0.35;

  const heart = keyed(frame, [
    [75, 0],
    [140, 0.55],
    [375, 0.55],
    [440, 0.2],
    [525, 0.2],
    [560, 0.9],
    [660, 0.55],
    [975, 0.55],
    [1010, 1],
  ]);
  const beamLen = keyed(frame, [
    [528, 0],
    [556, 1],
  ]);
  const beamOp = keyed(frame, [
    [526, 0],
    [534, 1],
    [660, 1],
    [720, 0],
  ]);
  const orbT = keyed(frame, [
    [565, 0],
    [665, 1],
  ]);
  const paradise = keyed(frame, [
    [680, 0],
    [750, 1],
  ]);
  const river = keyed(frame, [
    [828, 0],
    [880, 1],
  ]);
  const moon = keyed(frame, [
    [1130, 0],
    [1180, 1],
  ]);
  const burst = keyed(frame, [
    [975, 0],
    [1010, 1],
    [1110, 0.4],
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
  const logoScale = interpolate(frame, [LOGO_AT, ANKABUT_DURATION], [1.0, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const intro = keyed(frame, [
    [0, 0],
    [14, 1],
  ]);

  const archFill = interpolateColors(paradise, [0, 1], ["#B89C74", "#FFF6E2"]);
  const archOp = 0.22 - dark * 0.1 + paradise * 0.6;

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
            <stop offset="0" stopColor={interpolateColors(dark, [0, 1], [C.floorTop, "#8F7B5E"])} />
            <stop offset="1" stopColor={interpolateColors(dark, [0, 1], [C.floorBottom, "#7F6B50"])} />
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
          <mask id="moonMaskA">
            <rect x={-1000} y={-1000} width={4000} height={4000} fill="white" />
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
          {/* warm glow (paradise) */}
          <circle cx={FIG_X} cy={HORIZON - 520} r={700} fill="url(#sunGrad)" opacity={paradise * 0.9} />

          {/* crescent */}
          <g opacity={moon}>
            <circle cx={FIG_X} cy={HORIZON - 760} r={150} fill={C.goldSoft} opacity={0.35} filter="url(#blur40)" />
            <circle cx={FIG_X} cy={HORIZON - 760} r={70} fill="#E9C47A" mask="url(#moonMaskA)" />
          </g>

          {/* arches -> rooms of Paradise */}
          <g opacity={archOp}>
            {ARCH_DX.map((dx, i) => {
              const ax = FIG_X + dx;
              const big = i % 2 === 1;
              const aw = big ? 150 : 120;
              const ah = (big ? 360 : 280) + paradise * (big ? 80 : 50);
              const lift = paradise * (8 + 6 * Math.sin(frame / 25 + i));
              const base = HORIZON - lift;
              return (
                <path
                  key={dx}
                  d={`M ${ax - aw / 2} ${base} L ${ax - aw / 2} ${base - ah + aw / 2} Q ${ax - aw / 2} ${base - ah} ${ax} ${
                    base - ah - aw * 0.35
                  } Q ${ax + aw / 2} ${base - ah} ${ax + aw / 2} ${base - ah + aw / 2} L ${ax + aw / 2} ${base} Z`}
                  fill={archFill}
                  stroke={C.gold}
                  strokeWidth={paradise * 3}
                  strokeOpacity={0.7}
                />
              );
            })}
          </g>

          {/* floor */}
          <rect x={-600} y={HORIZON} width={W + 1200} height={H} fill="url(#floorGrad)" />
          <rect x={-600} y={HORIZON - 1} width={W + 1200} height={3} fill="#C9B08A" opacity={0.6} />

          {/* rivers */}
          <g opacity={river}>
            {[0, 1, 2].map((k) => {
              const y0 = HORIZON + 16 + k * 22;
              const amp = 3 + k * 2;
              const phase = frame / (14 - k * 2);
              let d = "";
              for (let x = -600; x <= W + 600; x += 30) {
                const y = y0 + Math.sin(x / (120 + k * 30) + phase) * amp;
                d += `${x === -600 ? "M" : "L"} ${x} ${y} `;
              }
              return (
                <g key={k}>
                  <path d={d} stroke="#CFE2DA" strokeWidth={12 - k * 2} fill="none" opacity={0.6} strokeLinecap="round" />
                  <path
                    d={d}
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    fill="none"
                    opacity={0.7}
                    strokeDasharray="40 70"
                    strokeDashoffset={-frame * (3 + k)}
                  />
                </g>
              );
            })}
          </g>

          {/* lamps: go out (29:57), relight */}
          {LAMP_DX.map((dx, i) => {
            const fl = 0.75 + 0.25 * Math.sin(frame / 6 + i * 1.7);
            const dist = 1 - Math.abs(dx) / 800;
            const off = keyed(frame, [
              [385 + dist * 60, 0],
              [400 + dist * 60, 1],
              [600 + (1 - dist) * 50, 1],
              [620 + (1 - dist) * 50, 0],
            ]);
            const on = 1 - off;
            return (
              <g key={dx}>
                <circle cx={FIG_X + dx} cy={HORIZON - 8} r={22 + paradise * 8} fill={C.goldSoft} opacity={0.35 * fl * on} filter="url(#blur12)" />
                <circle cx={FIG_X + dx} cy={HORIZON - 8} r={5} fill={interpolateColors(on, [0, 1], ["#6E5A44", "#FFE7B0"])} />
                <rect x={FIG_X + dx - 9} y={HORIZON - 4} width={18} height={6} rx={3} fill="#8C6A4C" />
              </g>
            );
          })}

          {/* beam + returning light */}
          <g opacity={beamOp}>
            <rect
              x={FIG_X - 70}
              y={-900}
              width={140}
              height={(HORIZON + 900) * beamLen}
              fill="url(#beamGrad)"
              filter="url(#blur12)"
              opacity={0.55}
            />
            <rect x={FIG_X - 4} y={-900} width={8} height={(HORIZON + 900) * beamLen} fill="url(#beamGrad)" />
            <ellipse cx={FIG_X} cy={HORIZON} rx={190 * beamLen} ry={26 * beamLen} fill="#FFF6DF" filter="url(#blur12)" />
          </g>
          {orbT > 0 && orbT < 1 && (
            <g opacity={Math.sin(orbT * Math.PI)}>
              <circle cx={chestX} cy={chestY - orbT * 1300} r={60} fill="url(#heartGrad)" />
              <circle cx={chestX} cy={chestY - orbT * 1300} r={10} fill="#FFFFFF" />
            </g>
          )}

          {/* shadow + reflection */}
          <ellipse cx={FIG_X} cy={HORIZON + 4} rx={70} ry={10} fill="#6E5038" opacity={0.25} filter="url(#blur4)" />
          <g transform={`translate(0, ${HORIZON * 2}) scale(1,-1)`} opacity={0.13}>
            <Figure pose={pose} x={FIG_X} y={HORIZON} />
          </g>

          <Figure pose={pose} x={FIG_X} y={HORIZON} />

          {/* light in the chest */}
          <g opacity={heart}>
            <circle cx={chestX} cy={chestY} r={40 + heart * 150} fill="url(#heartGrad)" />
            <circle cx={chestX} cy={chestY} r={11} fill="#FFFDF6" />
          </g>

          {/* dust */}
          {new Array(60).fill(0).map((_, i) => {
            const px = random(`px${i}`) * (W + 800) - 400;
            const speed = 0.4 + random(`sp${i}`) * 0.9;
            const py = ((random(`py${i}`) * H - frame * speed * 2) % H + H) % H;
            const r = 2 + random(`r${i}`) * 3.5;
            return (
              <circle
                key={i}
                cx={px + Math.sin(frame / 40 + i) * 12}
                cy={py}
                r={r * (1 + burst * 0.5)}
                fill={C.gold}
                opacity={(0.18 + 0.25 * random(`o${i}`)) * (1 - dark * 0.7) + burst * 0.25 + paradise * 0.08}
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
          opacity: intro,
          color: interpolateColors(dark, [0, 1], [C.text, "#F1E6D4"]),
        }}
      >
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 8, opacity: 0.6 }}>
          СУРА АЛЬ-АНКАБУТ
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, opacity: 0.45, marginTop: 10 }}>
          @its.ummanur
        </div>
      </div>

      {/* intro title */}
      <div style={{ position: "absolute", top: 1280, width: "100%", textAlign: "center", opacity: titleOp, color: C.text }}>
        <div style={{ fontFamily: ARABIC, fontWeight: 700, fontSize: 84, color: "#6A4A22" }}>سُورَةُ الْعَنْكَبُوت</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, marginTop: 6 }}>Сура «Паук», 56–59</div>
      </div>

      <SegText frame={frame} />

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
