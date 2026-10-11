import{createRequire}from'node:module';import path from'node:path';import{mkdir,writeFile}from'node:fs/promises';
const dep=process.env.LAUNCH_DEPENDENCIES;const req=createRequire(dep?path.join(dep,'package.json'):import.meta.url);
const{bundle}=req('@remotion/bundler'),{getCompositions,openBrowser,renderStill}=req('@remotion/renderer');
await mkdir('out',{recursive:true});const logs=[];const log=e=>{if(e.text?.includes('FONT_AUDIT')){logs.push(e.text);console.log(e.text)}};
const serveUrl=await bundle({entryPoint:path.resolve('src/direction.tsx'),publicDir:path.resolve('public'),webpackOverride:c=>dep?({...c,resolve:{...c.resolve,modules:[path.join(dep,'node_modules'),'node_modules']},resolveLoader:{...c.resolveLoader,modules:[path.join(dep,'node_modules'),'node_modules']},cache:false}):c});
const browser=await openBrowser('chrome',{browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE||undefined});
try{const compositions=await getCompositions(serveUrl,{puppeteerInstance:browser,onBrowserLog:log});await renderStill({composition:compositions.find(c=>c.id==='direction-zh'),serveUrl,frame:0,output:path.resolve('out/direction-zh.png'),puppeteerInstance:browser,imageFormat:'png',overwrite:true,onBrowserLog:log});await writeFile('out/direction-font.json',JSON.stringify(logs,null,2));console.log('Rendered direction-zh.png');}finally{await browser.close({silent:true})}
