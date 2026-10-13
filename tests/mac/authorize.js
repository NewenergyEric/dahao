const assert=require('node:assert/strict');
const ui=require(process.argv[2]);
ui.setHash('a'.repeat(64));
let tests=0;
function test(label,fn){fn();tests++;console.log('ok '+label);}
function fake(buttons,responses){
 const calls=[],dialogs=[];
 return {calls,dialogs,doShellScript(c){calls.push(c);let mode=c.includes(' inspect ')?'inspect':c.includes(' grant ')?'grant':'revoke';return JSON.stringify(responses[mode]);},displayDialog(t,o){dialogs.push({t,o});let b=buttons.shift();if(b==='cancel'){let e=new Error();e.errorNumber=-128;throw e;}return {buttonReturned:b||o.defaultButton};}};
}
const info={status:'not_granted',account:'test_user',target:[192,168,99,21].join('.'),controller:[192,168,99,22].join('.')};
test('quote hostile path as one literal',()=>assert.equal(ui.quote("/synthetic/a's/$(no)"),"'/synthetic/a'\\''s/$(no)'"));
test('reject path controls',()=>assert.throws(()=>ui.quote('/a\nb')));
test('reject arbitrary mode',()=>assert.throws(()=>ui.invoke({},'/safe','shell')));
test('cancel no grant',()=>{let f=fake(['取消'],{inspect:info});ui.start(f,'/test');assert.equal(f.calls.length,1);assert(f.calls[0].includes(' inspect '));});
test('view then cancel no grant',()=>{let f=fake(['查看授权','取消'],{inspect:info});ui.start(f,'/test');assert.equal(f.calls.length,1);});
test('explicit two-stage consent only then grant',()=>{let f=fake(['查看授权','允许本次接入','完成'],{inspect:info,grant:{status:'granted',minutes:59}});ui.start(f,'/test');assert.equal(f.calls.length,2);assert(f.calls[1].includes(' grant '));assert(f.dialogs[1].t.includes('账户可以访问'));assert(f.dialogs[1].t.includes('已启动的命令可能继续'));assert.equal(f.dialogs[1].o.defaultButton,'取消');});
test('revoke never grant',()=>{let f=fake(['撤销本次接入','关闭'],{inspect:info,revoke:{status:'revoked'}});ui.start(f,'/test');assert(f.calls[1].includes(' revoke '));assert(!f.calls.some(x=>x.includes(' grant ')));});
test('blocked check cannot authorize',()=>{let f=fake(['关闭'],{inspect:{status:'blocked',code:'HOST_FINGERPRINT'}});ui.start(f,'/test');assert.equal(f.calls.length,1);assert(f.dialogs[0].t.includes('HOST_FINGERPRINT'));});
test('failed write never displays success',()=>{let f=fake(['查看授权','允许本次接入','关闭'],{inspect:info,grant:{status:'blocked',code:'WRITE'}});ui.start(f,'/test');assert(!f.dialogs.some(x=>x.t.includes('临时授权已创建')));});
test('UI identity injection rejected',()=>{let f=fake([],{inspect:{...info,account:'user\nother'}});assert.throws(()=>ui.start(f,'/test'));assert.equal(f.dialogs.length,0);});
test('private request path stays quoted',()=>{let f=fake(['取消'],{inspect:info});ui.start(f,"/synthetic/a's folder");assert(f.calls[0].includes("a'\\''s folder/authorize.pl'"));});
test('unexpected backend status not reported as granted',()=>{let f=fake(['查看授权','允许本次接入'],{inspect:info,grant:{status:'unknown'}});assert.throws(()=>ui.start(f,'/test'));});
console.log(JSON.stringify({ui_tests:tests,status:'passed'}));
