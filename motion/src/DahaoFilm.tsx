import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender,interpolate,Easing} from 'remotion';

type Lang='zh'|'en';
const C={paper:'#fff6e9',pink:'#f3a7bd',pale:'#ffdbe4',rasp:'#af2456',plum:'#431c35',ink:'#3b2030',mute:'#7c4059'};
const display='Dahao Display, Dahao Text, sans-serif';
const text='Dahao Text, sans-serif';
const beats=[0,120,255,375,492,600,720];
const ease=Easing.bezier(.18,.84,.25,1);
const move=(f:number,s:number,d=24)=>interpolate(f,[s,s+d],[0,1],{easing:ease,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const pose=(f:number,values:number[])=>interpolate(f,[0,24,102,134,238,274,355,394,476,512,580,626,700,719],values,{easing:ease,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const pick=(lang:Lang,zh:string,en:string)=>lang==='zh'?zh:en;

function Fonts(){const[h]=useState(()=>delayRender('Dahao display and text fonts'));useEffect(()=>{Promise.all([
 new FontFace('Dahao Display',`url(${staticFile('fonts/dahao-display.woff2')})`,{weight:'400'}).load(),
 new FontFace('Dahao Text',`url(${staticFile('fonts/dahao-text.woff2')})`,{weight:'100 900'}).load()
]).then(async faces=>{faces.forEach(face=>document.fonts.add(face));await document.fonts.ready;console.log('FONT_AUDIT '+JSON.stringify(faces.map(face=>({family:face.family,status:face.status,loaded:document.fonts.check(`40px ${face.family}`)}))));continueRender(h)}).catch(cancelRender)},[h]);return null}

function Beat({f,index,children}:{f:number;index:number;children:React.ReactNode}){
 const begin=beats[index],end=beats[index+1];
 if(f<begin-8||f>=end+8)return null;
 const enter=index===0?1:move(f,begin-8,16),leave=index===5?0:move(f,end-8,16);
 return <AbsoluteFill style={{zIndex:4,opacity:enter*(1-leave),transform:`translateX(${(1-enter)*110-leave*95}px) rotate(${(1-enter)*1.5-leave}deg)`,transformOrigin:'55% 50%'}}>{children}</AbsoluteFill>;
}
function Display({children,style={}}:{children:React.ReactNode;style?:React.CSSProperties}){return <div data-audit="display-type" style={{fontFamily:display,fontWeight:400,lineHeight:1.05,letterSpacing:-1.4,...style}}>{children}</div>}
function KineticLine({children,f,start=0,style={}}:{children:React.ReactNode;f:number;start?:number;style?:React.CSSProperties}){
 const p=move(f,start,22);return <div style={{overflow:'hidden',padding:'7px 14px 13px 0',margin:'-7px -14px -13px 0',...style}}><div style={{transform:`translateY(${(1-p)*112}%) skewY(${(1-p)*5}deg)`}}>{children}</div></div>;
}
const note:React.CSSProperties={fontFamily:text,fontSize:24,lineHeight:1.6,color:C.mute};

export const DahaoFilm:React.FC<{lang:Lang}>=({lang})=>{
 const f=useCurrentFrame(),zh=lang==='zh';
 const chapter=Math.max(0,Math.min(5,beats.findIndex((b,i)=>i>0&&f<b)-1));
 const dark=chapter===2||chapter===5;
 const bg=dark?C.plum:chapter===1?C.pink:C.paper;
 const heroX=pose(f,[1370,605,605,914,914,891,891,974,974,910,910,643,643,643]);
 const heroY=pose(f,[115,136,136,414,414,353,353,427,427,424,424,294,294,294]);
 const heroW=pose(f,[770,710,710,340,340,365,365,290,290,340,340,591,591,591]);
 const heroR=pose(f,[18,-7,-7,5,5,-5,-5,6,6,-3,-3,-8,-8,-8]);
 const heroOpacity=chapter===3?.55:1;
 return <AbsoluteFill style={{background:bg,color:dark?C.paper:C.ink,fontFamily:text,overflow:'hidden'}}>
  <Fonts/>
  <div style={{position:'absolute',inset:0,background:dark?'radial-gradient(ellipse at 80% 62%,#702e54 0%,transparent 64%)':'radial-gradient(ellipse at 87% 55%,#f6bace88 0%,transparent 57%)'}}/>
  <div style={{position:'absolute',left:56,right:56,top:27,display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:20}}><Display style={{fontSize:32,color:dark?C.pink:C.rasp,letterSpacing:.5}}>搭好 <span style={{fontSize:23,marginLeft:10}}>dahao</span></Display><div style={{fontSize:15,letterSpacing:1,color:dark?'#efb3cb':C.mute}}>{pick(lang,'给不太会 AI 的人','AI SETUP, FOR THE REST OF US')}</div></div>
  <Img src={staticFile('illustrations/dahao-handoff.png')} style={{position:'absolute',left:heroX,top:heroY,width:heroW,height:'auto',transform:`rotate(${heroR}deg)`,opacity:heroOpacity,transformOrigin:'50% 70%',zIndex:3}}/>

  <Beat f={f} index={0}>
   <div style={{position:'absolute',left:61,top:145,width:680,zIndex:7,transform:'rotate(-3deg)'}}>
    <Display style={{fontSize:zh?89:77}}><KineticLine f={f} start={0}>{pick(lang,'不太会 AI？','New to AI?')}</KineticLine></Display>
    <Display style={{fontSize:zh?123:95,color:C.rasp,marginTop:25}}><KineticLine f={f} start={10}>{pick(lang,'先，搭好。','Start with')}</KineticLine>{!zh&&<KineticLine f={f} start={18}>dahao.</KineticLine>}</Display>
   </div>
   <div style={{...note,position:'absolute',left:68,top:zh?429:478,width:500,zIndex:8,transform:`translateY(${(1-move(f,28,22))*20}px)`,opacity:move(f,28,22)}}>{pick(lang,'帮爱人、家人或朋友，\n把用 AI 的第一步准备好。','Help someone you care about\nget ready to use AI.').split('\n').map(line=><div key={line}>{line}</div>)}</div>
   <div style={{position:'absolute',left:67,top:570,fontSize:19,fontWeight:700,color:C.rasp,opacity:move(f,43,18)}}>{pick(lang,'一个 Skill · 一张清单 · 下一步有着落','One Skill. One checklist. A clear next step.')}</div>
  </Beat>

  <Beat f={f} index={1}>
   <div style={{position:'absolute',left:61,top:133,width:1150}}>
    <Display style={{fontSize:zh?81:70,transform:'rotate(-2deg)'}}><KineticLine f={f} start={122}>{pick(lang,'安装这件事，一步步搭好。','Make setup feel manageable.')}</KineticLine></Display>
    <div style={{...note,color:C.ink,fontSize:25,marginTop:24,opacity:move(f,139,18)}}>{pick(lang,'先检查已有环境，再按选择往下走。','Check what already works. Choose what comes next.')}</div>
   </div>
   <div style={{position:'absolute',left:65,right:65,top:324,display:'flex',justifyContent:'space-between',zIndex:8}}>
    {(zh?['依赖','通路','工具','Agent','规则','Skills','验收']:['System','Access','Tools','Agent','Rules','Skills','Verify']).map((s,i)=>{
     const p=move(f,145+i*7,18);return <div key={s} style={{width:145,transform:`translateY(${(1-p)*(35+(i%2)*15)}px) rotate(${(1-p)*(i%2?5:-5)}deg)`,opacity:p}}><div style={{fontSize:16,marginBottom:18,color:C.rasp}}>0{i+1}</div><Display style={{fontSize:zh?42:35,whiteSpace:'nowrap'}}>{s}</Display><div style={{height:4,background:C.rasp,marginTop:22,width:Math.round(move(f,161+i*8,22)*118)}}/></div>
    })}
   </div>
   <div style={{position:'absolute',left:66,top:505,width:790,fontSize:23,lineHeight:1.65,opacity:move(f,211,16)}}>{pick(lang,'已有可用的就复用。选项和完成条件都在清单里。','Keep what works. The checklist shows choices and completion criteria.')}</div>
  </Beat>

  <Beat f={f} index={2}>
   <div style={{position:'absolute',left:65,top:138,width:1140}}><Display style={{fontSize:zh?88:79,color:C.pink,transform:'rotate(-2deg)'}}><KineticLine f={f} start={257}>{pick(lang,'按你的习惯来。','Your tools. Your call.')}</KineticLine></Display></div>
   <div style={{position:'absolute',left:71,top:294,width:1060}}>
    <div style={{display:'flex',alignItems:'baseline',gap:32,transform:`translateX(${(1-move(f,275,25))*-100}px)`,opacity:move(f,275,12)}}><Display style={{fontSize:zh?60:57}}>Codex / IDE</Display><span style={{fontSize:22,color:'#efb3cb'}}>{pick(lang,'选你会用的准备工具','A workspace you can use')}</span></div>
    <div style={{height:1,background:'#efb3cb66',width:mix(0,1000,move(f,289,24)),marginTop:26}}/>
    <div style={{display:'flex',alignItems:'baseline',gap:30,marginTop:29,transform:`translateX(${(1-move(f,295,27))*100}px)`,opacity:move(f,295,12)}}><Display style={{fontSize:75,color:C.pink}}>OpenClaw</Display><span style={{fontSize:23}}>{pick(lang,'默认','Default')}</span></div>
    <div style={{fontSize:26,marginTop:17,color:'#efb3cb',opacity:move(f,327,17)}}>{pick(lang,'也可选 Hermes，或已有的 Agent。','Or choose Hermes, or an Agent you already use.')}</div>
   </div>
  </Beat>

  <Beat f={f} index={3}>
   <div style={{position:'absolute',left:62,top:131,width:530,zIndex:7,transform:'rotate(-3deg)'}}><Display style={{fontSize:zh?83:66}}><KineticLine f={f} start={378}>{pick(lang,'先定规矩，','Clear rules.')}</KineticLine></Display><Display style={{fontSize:zh?94:73,color:C.rasp,marginTop:19}}><KineticLine f={f} start={386}>{pick(lang,'再加本领。','Useful Skills.')}</KineticLine></Display></div>
   <div style={{...note,position:'absolute',left:68,top:404,width:460,fontSize:24,opacity:move(f,416,20)}}>{pick(lang,'知道可以做什么，\n也知道何时该先问。','Know what it may do,\nand when it needs to ask.').split('\n').map(s=><div key={s}>{s}</div>)}</div>
   <div style={{position:'absolute',left:636,top:174,width:548,padding:'27px 29px 29px',background:'#fffcf5',borderTop:`5px solid ${C.rasp}`,boxShadow:'10px 18px 0 #f5bdd044',transform:`translateY(${(1-move(f,391,28))*70}px) rotate(${mix(8,-3,move(f,391,28))}deg)`,opacity:move(f,388,14),zIndex:8}}>
    <div style={{fontSize:19,color:C.rasp,fontWeight:700,marginBottom:27}}>AGENTS.md</div>
    {(zh?['先检查，再执行','秘密只引用','验证结果，留下下一步']:['Inspect before acting','Reference secrets, never copy them','Verify results. Leave a next step.']).map((s,i)=><div key={s} style={{padding:'15px 0',borderTop:'1px solid #dcb7c2',fontSize:zh?26:21,whiteSpace:'nowrap',position:'relative',opacity:move(f,413+i*12,18)}}><span style={{position:'absolute',left:-4,bottom:13,height:14,background:'#f3a7bd88',width:mix(0,zh?330:460,move(f,430+i*11,22))}}/><span style={{position:'relative'}}>{s}</span></div>)}
   </div>
   <div style={{position:'absolute',left:68,top:558,color:C.rasp,fontSize:21,fontWeight:700,opacity:move(f,459,14)}}>{pick(lang,'Skills：先选第一件小事需要的。','Skills: start with what the first task needs.')}</div>
  </Beat>

  <Beat f={f} index={4}>
   <div style={{position:'absolute',left:67,top:133,width:1140}}><Display style={{fontSize:zh?85:71,transform:'rotate(-2deg)'}}><KineticLine f={f} start={495}>{pick(lang,'从她想做的一件小事开始。','Start with something useful.')}</KineticLine></Display></div>
   <div style={{position:'absolute',left:72,top:262,fontSize:19,color:C.rasp,fontWeight:700}}>{pick(lang,'目标任务示意 · 尚未由真实 Agent 执行','ILLUSTRATED GOAL · NOT A LIVE AGENT RESULT')}</div>
   <Display style={{position:'absolute',left:65,top:320,width:1100,fontSize:zh?54:48,color:C.rasp}}>{pick(lang,'“周末去两天，带什么？”','“Two days away. What should I pack?”').slice(0,Math.max(0,Math.floor((f-510)/.8)))}</Display>
   <div style={{position:'absolute',left:72,top:422,width:810}}>{(zh?['随身带：手机、证件、充电器','先确认：目的地、日期、同行人数']:['Pack: phone, ID and charger','Confirm: destination, dates and group size']).map((s,i)=><div key={s} style={{fontSize:zh?29:25,padding:'15px 0',borderBottom:'1px solid #dcb7c2',opacity:move(f,544+i*12,15),transform:`translateX(${(1-move(f,544+i*12,18))*35}px)`}}>{s}</div>)}</div>
  </Beat>

  <Beat f={f} index={5}>
   <Display style={{position:'absolute',left:57,top:138,fontSize:148,color:C.pink,transform:'rotate(-4deg)',zIndex:8}}><KineticLine f={f} start={602}>搭好<span style={{fontSize:74,paddingLeft:25}}>dahao</span></KineticLine></Display>
   <div style={{position:'absolute',left:70,top:325,width:620,zIndex:8}}><Display style={{fontSize:zh?57:46}}><KineticLine f={f} start={620}>{pick(lang,'把 AI 搭好，','Get ready for AI.')}</KineticLine><KineticLine f={f} start={625}>{pick(lang,'让你用得起来。','Make the first step yours.')}</KineticLine></Display><div style={{fontSize:23,color:'#efb3cb',marginTop:25,opacity:move(f,643,18)}}>{pick(lang,'给爱人、家人、朋友，也给自己。','For your partner, family, friends. And you.')}</div></div>
   <div style={{position:'absolute',left:69,top:555,display:'flex',gap:25,alignItems:'center',zIndex:8,opacity:move(f,660,18)}}><Display style={{fontSize:42,color:C.pink}}>$dahao</Display><div style={{fontSize:22}}>{pick(lang,'从七步清单开始 →','Open the 7-step checklist →')}</div></div>
  </Beat>

  <div style={{position:'absolute',left:58,right:58,bottom:28,borderTop:`1px solid ${dark?'#efb3cb44':'#a7325833'}`,paddingTop:13,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:15,color:dark?'#efb3cb':C.mute,zIndex:30}}><span>{pick(lang,'当前：完整清单 + Windows 沙箱示例 · 真实 Agent 安装待接入','Today: checklist + Windows sandbox example · Real Agent installation is not connected')}</span><span>{String(chapter+1).padStart(2,'0')} / 06</span></div>
  <div style={{position:'absolute',left:0,bottom:0,height:4,width:(f+1)/720*1280,background:dark?C.pink:C.rasp,zIndex:40}}/>
 </AbsoluteFill>;
};
