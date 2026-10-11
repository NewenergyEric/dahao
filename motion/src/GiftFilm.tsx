import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';

type Lang='zh'|'en';
const C={paper:'#fff8f3',pink:'#f2bbcb',berry:'#71334e',ink:'#472e39',muted:'#805f6e',line:'#e6c4ce'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const v=clamp(x);return v*v*(3-2*v)};
const show=(f:number,start:number)=>ease((f-start)/14);
function Fonts(){const[h]=useState(()=>delayRender('Gift font'));useEffect(()=>{let live=true;const face=new FontFace('Gift Sans',`url(${staticFile('fonts/gift-sans.woff2')})`,{weight:'100 900'});face.load().then(async font=>{document.fonts.add(font);await document.fonts.ready;if(live){console.log('FONT_AUDIT '+JSON.stringify({family:font.family,status:font.status,loaded:document.fonts.check('700 64px "Gift Sans"')}));continueRender(h)}}).catch(cancelRender);return()=>{live=false}},[h]);return null}
const steps={zh:['依赖环境','网络通路','Codex / IDE','日常 Agent','行为约束','Skills','验收接续'],en:['Dependencies','Network access','Codex / IDE','Daily Agent','Work rules','Skills','Verify & continue']};
const chapter={zh:['一份用得上的心意','先把准备排清楚','工具，由你来选','先定边界，再加本领','从一件日常小事开始','下一次，从这里接着走'],en:['A useful, thoughtful gift','A clear path to getting ready','Your tools. Your choice.','Set boundaries. Add abilities.','Start with one everyday task','Pick up where you left off']};
const Row:React.FC<{children:React.ReactNode;index:number;f:number;mark?:string}>=({children,index,f,mark})=><div style={{display:'flex',alignItems:'center',gap:17,padding:'13px 0',borderBottom:`1px solid ${C.line}`,opacity:show(f,12+index*9),transform:`translateY(${(1-show(f,12+index*9))*12}px)`}}><span style={{fontSize:16,color:C.berry,fontWeight:700,minWidth:26}}>{mark||String(index+1).padStart(2,'0')}</span>{children}</div>;
const Tag:React.FC<{children:React.ReactNode}>=({children})=><span style={{fontSize:17,color:C.berry,padding:'7px 14px',border:`1px solid ${C.line}`,borderRadius:30,background:'#fff8f3e8'}}>{children}</span>;
const sheet:React.CSSProperties={position:'absolute',left:64,top:184,width:716,background:'#fffcf8f5',padding:'22px 32px',boxShadow:'0 18px 46px #71334e18',border:'1px solid #f4dfe5',borderRadius:6};

export const GiftFilm:React.FC<{lang:Lang}>=({lang})=>{
 const f=useCurrentFrame(),zh=lang==='zh',phase=Math.min(5,Math.floor(f/120)),local=f-phase*120;
 const enter=phase===0?1:show(local,0),leave=f>=700?1:1-ease((local-112)/8),opacity=enter*leave;
 const travel=phase===4;
 return <AbsoluteFill style={{background:C.paper,color:C.ink,fontFamily:'Gift Sans, sans-serif'}}>
  <Fonts/>
  <Img src={staticFile(travel?'illustrations/weekend-scene.png':'illustrations/gift-scene.png')} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
  <AbsoluteFill style={{background:phase===0||phase===5?'linear-gradient(90deg,#fff8f3ed 0%,#fff8f3d9 30%,#fff8f370 47%,transparent 67%)':'linear-gradient(90deg,#fff8f3f5 0%,#fff8f3e6 39%,#fff8f369 67%,#fff8f325 100%)'}}/>
  <header style={{position:'absolute',top:34,left:64,right:64,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:25,fontWeight:750,letterSpacing:-.6}}>Agent Gift<span style={{color:C.berry,paddingLeft:12}}>·</span></span><span style={{fontSize:17,color:C.berry}}>{zh?'给爱人 · 给客户 · 给自己':'For someone you care about. For you.'}</span></header>
  <div style={{position:'absolute',inset:0,opacity}}>
   {phase===0&&<>
    <div style={{position:'absolute',left:64,top:144,color:C.berry,fontSize:18,letterSpacing:3}}>{zh?'一份用得上的心意':'A THOUGHTFUL START'}</div>
    <h1 style={{position:'absolute',left:60,top:187,margin:0,fontSize:zh?64:61,fontWeight:800,letterSpacing:-2,lineHeight:1.23,width:620}}>{zh?<>给在乎的人，<br/>一个用得上的<br/><span style={{color:C.berry}}>小助手。</span></>:<>An assistant<br/>for someone<br/><span style={{color:C.berry}}>you care about.</span></>}</h1>
    <div style={{position:'absolute',left:64,top:456,fontSize:24,lineHeight:1.6,color:C.muted,opacity:show(local,15)}}>{zh?<>从选择工具，到完成一件小事。<br/>把准备的麻烦，交给一张清单。</>:<>From choosing tools to a useful first task.<br/>Make the preparation feel manageable.</>}</div>
    <div style={{position:'absolute',left:64,top:561,display:'flex',gap:12,opacity:show(local,25)}}><Tag>{zh?'七步准备清单':'7-step checklist'}</Tag><Tag>{zh?'默认 OpenClaw · 可选 Hermes':'OpenClaw by default · Hermes optional'}</Tag></div>
   </>}
   {phase>0&&phase<5&&<>
    <div style={{position:'absolute',left:64,top:110,color:C.berry,fontSize:16,letterSpacing:2}}>0{phase+1} / {zh?'准备好，再开始':'A LITTLE MORE READY'}</div>
    <h2 style={{position:'absolute',left:62,top:143,margin:0,fontWeight:780,fontSize:zh?43:39,lineHeight:1.25,letterSpacing:-1}}>{chapter[lang][phase]}</h2>
   </>}
   {phase===1&&<div style={{...sheet,top:222,width:734,padding:'16px 30px'}}>
    <div style={{fontSize:19,color:C.muted,marginBottom:8}}>{zh?'已有工具直接复用，每一步都有完成条件。':'Reuse what already works. Know when each step is done.'}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',columnGap:32}}>{steps[lang].map((s,i)=><Row key={s} index={i} f={local}><span style={{fontSize:24,fontWeight:600}}>{s}</span></Row>)}</div>
    <div style={{fontSize:18,color:C.berry,marginTop:21,paddingTop:12,borderTop:`1px solid ${C.line}`}}>{zh?'勾选记录人工进度，不会自动运行安装。':'Checks record your progress. They do not run an installer.'}</div>
   </div>}
   {phase===2&&<div style={{...sheet,top:222,width:730}}>
    <div style={{fontSize:17,color:C.muted,marginBottom:18}}>{zh?'示例方案 / Windows · 就在这台':'EXAMPLE PLAN / Windows · This computer'}</div>
    <Row index={0} f={local}><div style={{width:158,color:C.muted,fontSize:20}}>{zh?'网络通路':'Network'}</div><span style={{fontSize:24,fontWeight:650}}>{zh?'复用现有通路':'Reuse existing access'}</span></Row>
    <Row index={1} f={local}><div style={{width:158,color:C.muted,fontSize:20}}>{zh?'准备工具':'Workspace'}</div><span style={{fontSize:24,fontWeight:650}}>Codex / IDE</span></Row>
    <Row index={2} f={local}><div style={{width:158,color:C.muted,fontSize:20}}>{zh?'日常 Agent':'Daily Agent'}</div><span style={{fontSize:24,fontWeight:750,color:C.berry}}>OpenClaw</span><Tag>{zh?'默认':'Default'}</Tag></Row>
    <div style={{marginTop:20,color:C.muted,fontSize:20,opacity:show(local,53)}}>{zh?'也可选 Hermes，或你已经在用的工具。':'Choose Hermes, or a tool you already use.'}</div>
   </div>}
   {phase===3&&<div style={{...sheet,top:222,width:744}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:13,borderBottom:`1px solid ${C.line}`}}><span style={{fontSize:24,fontWeight:750}}>AGENTS.md</span><Tag>{zh?'通用工作规则':'Working rules'}</Tag></div>
    {(zh?['先检查现状，再执行已授权的工作','清楚约束工具、权限和敏感信息','实际验证结果，留好下一步']:['Check the target before taking action','Define tools, permissions and private-data rules','Verify the result and leave a next step']).map((s,i)=><Row key={s} index={i} f={local}><span style={{fontSize:zh?23:21,fontWeight:550}}>{s}</span></Row>)}
    <div style={{fontSize:21,color:C.berry,marginTop:21,opacity:show(local,50)}}>{zh?'再安装第一件任务需要的 Skills。':'Then add the Skills needed for the first task.'}</div>
    <div style={{fontSize:17,color:C.muted,marginTop:12}}>{zh?'不带入 SOUL、USER 或私人资料；真实加载待验证。':'No SOUL, USER or private profiles. Runtime loading is unverified.'}</div>
   </div>}
   {phase===4&&<div style={{position:'absolute',left:64,top:220,width:576,background:'#fffcf8f2',padding:'24px 28px',border:'1px solid #f0d7df',boxShadow:'0 16px 44px #71334e16',borderRadius:5}}>
    <div style={{fontSize:18,color:C.berry,marginBottom:12}}>{zh?'原创任务示意 / 周末两天旅行':'ORIGINAL TASK ILLUSTRATION / A weekend away'}</div>
    <div style={{fontSize:24,fontWeight:720,lineHeight:1.4,marginBottom:18}}>{zh?'“轻装出发，帮我分清带什么、确认什么。”':'“Help me pack light and see what I still need to check.”'}</div>
    {(zh?['随身带：手机、证件、充电器','出发前：核对天气与出行安排','待确认：目的地、日期、同行人数']:['Pack: phone, ID and charger','Before leaving: weather and travel plans','Confirm: destination, dates and group size']).map((s,i)=><Row key={s} index={i} f={local} mark={i===2?'?':'—'}><span style={{fontSize:zh?21:19}}>{s}</span></Row>)}
    <div style={{fontSize:16,color:C.muted,lineHeight:1.5,marginTop:18}}>{zh?'目标成果示意；尚未由真实 Agent 执行。':'An example of the intended outcome; not executed by a live Agent.'}</div>
   </div>}
   {phase===5&&<>
    <div style={{position:'absolute',left:64,top:145,color:C.berry,fontSize:18,letterSpacing:2}}>{zh?'把第一件小事，做得有头有尾':'START SMALL. KNOW WHAT COMES NEXT.'}</div>
    <h2 style={{position:'absolute',left:60,top:196,margin:0,fontSize:zh?62:55,fontWeight:800,lineHeight:1.25,letterSpacing:-2}}>{zh?<>今天准备好，<br/><span style={{color:C.berry}}>下次接着用。</span></>:<>Prepare it today.<br/><span style={{color:C.berry}}>Keep going tomorrow.</span></>}</h2>
    <div style={{position:'absolute',left:64,top:390,fontSize:25,lineHeight:1.8,color:C.muted}}>{zh?<>配置 · 检查 · 更新<br/>保留选择，逐项验证，留下下一步。</>:<>Configure · Check · Update<br/>Keep your choices. Verify. Continue.</>}</div>
    <div style={{position:'absolute',left:64,top:522,background:C.berry,color:C.paper,padding:'15px 25px',borderRadius:32,fontSize:25,fontWeight:650,opacity:show(local,20)}}>{zh?'从七步清单开始 →':'Open the 7-step checklist →'}</div>
   </>}
  </div>
  <footer style={{position:'absolute',bottom:33,left:64,right:64,display:'flex',justifyContent:'space-between',fontSize:16,color:C.berry,borderTop:'1px solid #71334e33',paddingTop:15,background:'linear-gradient(90deg,#fff8f3aa,transparent)'}}><span>{zh?'当前：清单 + Windows 沙箱示例；真实 Agent 安装未接入':'Current: checklist + Windows sandbox demo; real Agent installation is not connected.'}</span><span>{String(phase+1).padStart(2,'0')} / 06</span></footer>
  <div style={{position:'absolute',bottom:0,height:4,left:0,width:(f+1)/720*1280,background:C.berry}}/>
 </AbsoluteFill>;
};
