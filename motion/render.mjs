import {createRequire} from 'node:module';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const dep=process.env.LAUNCH_DEPENDENCIES;
const req=createRequire(dep?path.join(dep,'package.json'):import.meta.url);
const {bundle}=req('@remotion/bundler');
const {getCompositions,openBrowser,renderStill,renderMedia}=req('@remotion/renderer');
const mode=process.argv[2]||'qa';
if(!['qa','films'].includes(mode))throw Error('Use qa or films');
await mkdir('out/dahao-v2',{recursive:true});
const logs=[];
const onBrowserLog=e=>{if(e.text?.includes('FONT_AUDIT')){logs.push(e.text)}};
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),publicDir:path.resolve('public'),webpackOverride:c=>dep?({...c,resolve:{...c.resolve,modules:[path.join(dep,'node_modules'),'node_modules']},resolveLoader:{...c.resolveLoader,modules:[path.join(dep,'node_modules'),'node_modules']},cache:false}):c});
const browser=await openBrowser('chrome',{browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE||undefined});
try{
 for(const composition of await getCompositions(serveUrl,{puppeteerInstance:browser,onBrowserLog})){
  if(process.argv[3]&&composition.id!=='dahao-'+process.argv[3])continue;
  if(mode==='qa'){
   for(const frame of [60,218,340,466,582,699])await renderStill({composition,serveUrl,frame,output:path.resolve(`out/dahao-v2/${composition.id}-${frame}.png`),puppeteerInstance:browser,imageFormat:'png',overwrite:true,onBrowserLog});
   console.log('Keyframes ready',composition.id);
  }else{
   let last=-1;
   await renderMedia({composition,serveUrl,outputLocation:path.resolve(`out/dahao-v2/${composition.id}.mp4`),codec:'h264',crf:21,pixelFormat:'yuv420p',imageFormat:'png',concurrency:3,puppeteerInstance:browser,overwrite:true,onBrowserLog,onProgress:({progress})=>{const value=Math.floor(progress*10)*10;if(value!==last){last=value;console.log(composition.id,value+'%')}}});
   console.log('Film ready',composition.id);
  }
 }
 await writeFile(`out/dahao-v2/font-runtime-${mode}.json`,JSON.stringify(logs,null,2));
}finally{await browser.close({silent:true})}
