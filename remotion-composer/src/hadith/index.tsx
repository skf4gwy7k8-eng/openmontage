import React from "react";
import { Composition, registerRoot } from "remotion";
import { Hadith } from "./Hadith";
import { Wealth } from "./Wealth";
import { Sharh, SHARH_DURATION } from "./Sharh";

const HadithRoot: React.FC = () => (
  <>
    <Composition id="Hadith" component={Hadith} durationInFrames={800} fps={30} width={1080} height={1920} />
    <Composition id="Wealth" component={Wealth} durationInFrames={800} fps={30} width={1080} height={1920} />
    <Composition id="Sharh" component={Sharh} durationInFrames={SHARH_DURATION} fps={30} width={1080} height={1920} />
  </>
);

registerRoot(HadithRoot);
