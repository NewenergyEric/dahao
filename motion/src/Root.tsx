import React from 'react';
import {Composition} from 'remotion';
import {GiftFilm} from './GiftFilm';
export const Root:React.FC=()=> <>{(['zh','en'] as const).map(lang=><Composition key={lang} id={`gift-${lang}`} component={GiftFilm} defaultProps={{lang}} durationInFrames={720} fps={30} width={1280} height={720}/>)}</>;
