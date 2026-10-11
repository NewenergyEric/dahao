import React from 'react';
import {registerRoot, Still} from 'remotion';
import {DirectionKeyframe} from './DirectionKeyframe';
registerRoot(()=> <Still id="direction-zh" component={DirectionKeyframe} width={1280} height={720}/>);
