import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';

const C={cream:'#FFF8F3',pink:'#F2BBCB',soft:'#FBE1E8',berry:'#71334E',ink:'#472E39',muted:'#805F6E',line:'#E6C4CE',white:'#FFFEFC'};
const Heart=({size=28,color=C.berry}:{size?:number,color?:string})=><svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path d="M16 27C12 23 4 18 4 11C4 4 12 3 16 9C20 3 28 4 28 11C28 18 20 23 16 27Z" fill={color}/></svg>;
const Assistant=()=> <svg width="116" height="118" viewBox="0 0 116 118" fill="none"><path d="M58 22V10" stroke={C.berry} strokeWidth="5" strokeLinecap="round"/><circle cx="58" cy="8" r="6" fill={C.pink}/><rect x="13" y="25" width="90" height="72" rx="28" fill={C.soft} stroke={C.berry} strokeWidth="3"/><circle cx="39" cy="57" r="5" fill={C.berry}/><circle cx="77" cy="57" r="5" fill={C.berry}/><path d="M46 73Q58 83 70 73" stroke={C.berry} strokeWidth="4" strokeLinecap="round"/><ellipse cx="28" cy="69" rx="8" ry="4" fill={C.pink}/><ellipse cx="88" cy="69" rx="8" ry="4" fill={C.pink}/><path d="M32 100V110M84 100V110" stroke={C.berry} strokeWidth="4" strokeLinecap="round"/></svg>;

export const DirectionKeyframe:React.FC=()=>{
 const [handle]=useState(()=>delayRender('direction-font'));
 useEffect(()=>{new FontFace('Setup Direction',`url(${staticFile('fonts/setup-sans.woff2')})`,{weight:'100 900'}).load().then(async font=>{document.fonts.add(font);await document.fonts.ready;const ok=document.fonts.check('800 64px "Setup Direction"','送她一台会帮忙的电脑');if(!ok)throw Error('font-check');console.log('FONT_AUDIT '+JSON.stringify({family:font.family,status:font.status,weight:font.weight,ok}));continueRender(handle);});},[handle]);
 return <AbsoluteFill style={{background:C.cream,color:C.ink,fontFamily:'Setup Direction',padding:48}}>
  <div style={{display:'flex',alignItems:'center',gap:14}}><div style={{width:42,height:42,borderRadius:14,background:C.soft,display:'flex',alignItems:'center',justifyContent:'center'}}><Heart size={23}/></div><span style={{fontSize:24,fontWeight:760,letterSpacing:-.5}}>Agent Gift</span><div style={{marginLeft:'auto',fontSize:18,color:C.muted}}>给爱人 · 给客户 · 给自己</div></div>
  <div style={{position:'absolute',left:50,top:155,fontSize:66,fontWeight:840,lineHeight:1.18,letterSpacing:-2}}>送她一台<br/><span style={{color:C.berry}}>会帮忙的电脑。</span></div>
  <div style={{position:'absolute',left:52,top:340,fontSize:23,lineHeight:1.65,fontWeight:430,color:C.muted}}>说出需求，让 Agent 带着你完成准备。<br/>从日常小事开始，慢慢长成她的好帮手。</div>
  <div style={{position:'absolute',left:52,top:440,display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:18,fontWeight:700,background:C.berry,color:C.white,borderRadius:100,padding:'11px 20px'}}>配置</span><span style={{fontSize:18,fontWeight:650,padding:'10px 19px',border:`1px solid ${C.line}`,borderRadius:100}}>检查</span><span style={{fontSize:18,fontWeight:650,padding:'10px 19px',border:`1px solid ${C.line}`,borderRadius:100}}>更新</span></div>
  <div style={{position:'absolute',right:54,top:138,width:535,height:370}}>
   <div style={{position:'absolute',left:5,top:23,width:516,height:293,borderRadius:34,background:C.soft,transform:'rotate(-4deg)'}}/>
   <div style={{position:'absolute',left:31,top:9,width:476,height:302,border:`2px solid ${C.berry}`,borderRadius:22,background:C.pink,padding:15,boxShadow:'0 12px 0 #EDD0D8'}}>
    <div style={{background:C.white,borderRadius:10,height:'100%',position:'relative',overflow:'hidden'}}>
     <div style={{height:36,borderBottom:`1px solid ${C.line}`,display:'flex',alignItems:'center',gap:5,paddingLeft:12}}>{[1,2,3].map(i=><span key={i} style={{height:6,width:6,borderRadius:5,background:C.pink}}/>)}<span style={{fontSize:12,marginLeft:8,color:C.muted}}>她的日常小帮手 · 目标体验</span></div>
     <div style={{position:'absolute',left:22,top:58}}><Assistant/></div>
     <div style={{position:'absolute',left:158,top:71,width:247,fontSize:23,fontWeight:750,color:C.berry}}>想先做哪件小事？</div>
     <div style={{position:'absolute',left:158,top:120,width:247,padding:'12px 14px',background:C.cream,border:`1px solid ${C.line}`,borderRadius:12,fontSize:17}}>一起整理周末旅行清单</div>
     <div style={{position:'absolute',left:158,top:173,width:247,fontSize:15,lineHeight:1.6,color:C.muted}}>保留你的习惯。<br/>下次对话，从这里接着走。</div>
     <div style={{position:'absolute',bottom:0,width:'100%',padding:'9px 14px',fontSize:12,color:C.muted,borderTop:`1px solid ${C.line}`}}>示意画面 · 真实 Agent 安装与加载尚未接入</div>
    </div>
   </div>
   <svg style={{position:'absolute',left:0,top:307}} width="535" height="45" viewBox="0 0 535 45"><path d="M30 1H506L532 28Q529 39 503 39H32Q5 39 3 28Z" fill="#EAAABC" stroke={C.berry} strokeWidth="2"/><path d="M206 2H331L321 14H216Z" fill={C.cream} stroke={C.berry} strokeWidth="1.5"/></svg>
   <div style={{position:'absolute',right:0,top:-19,width:53,height:53,background:C.cream,border:`1.5px solid ${C.line}`,borderRadius:17,transform:'rotate(10deg)',display:'flex',alignItems:'center',justifyContent:'center'}}><Heart size={28}/></div>
  </div>
  <div style={{position:'absolute',left:48,right:48,top:553,borderTop:`1px solid ${C.line}`,paddingTop:23,display:'flex',alignItems:'center',justifyContent:'space-between'}}><span style={{fontSize:14,color:C.muted}}>目标流程</span>{['了解需求','检查电脑','配置 Agent','添加 Skills','完成真实任务'].map((v,i)=><React.Fragment key={v}><span style={{fontSize:20,fontWeight:650,color:C.berry}}><span style={{fontSize:13,color:C.muted,marginRight:7}}>{`0${i+1}`}</span>{v}</span>{i<4&&<span style={{color:C.line,fontSize:22}}>→</span>}</React.Fragment>)}</div>
  <div style={{position:'absolute',bottom:38,left:50,right:50,display:'flex',justifyContent:'space-between',fontSize:16,color:C.muted}}><span><b style={{color:C.berry,fontWeight:700}}>当前已验证</b>　Windows 本地示例配置 · 更新 · 中断恢复</span><span>粉色方向稿 / 01</span></div>
 </AbsoluteFill>;
};
