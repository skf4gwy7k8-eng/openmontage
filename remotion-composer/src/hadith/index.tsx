import React from "react";
import { Composition, registerRoot } from "remotion";
import { Hadith } from "./Hadith";

const HadithRoot: React.FC = () => (
  <Composition id="Hadith" component={Hadith} durationInFrames={800} fps={30} width={1080} height={1920} />
);

registerRoot(HadithRoot);
