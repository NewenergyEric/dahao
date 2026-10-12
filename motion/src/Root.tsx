import React from 'react';
import {Composition} from 'remotion';
import {DahaoFilm} from './DahaoFilm';
export const Root:React.FC=()=> <>{(['zh','en'] as const).map(lang=><Composition key={lang} id={'dahao-'+lang} component={DahaoFilm} durationInFrames={720} fps={30} width={1280} height={720} defaultProps={{lang}}/>)}</>;
