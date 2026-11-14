const fs=require('fs'),vm=require('vm'),assert=require('assert');
const dir=__dirname;
const src=fs.readFileSync(dir+'/youtube.response.js','utf8');
const injection='globalThis.testAPI={caption:integratedCaption,Player:ke,playerType:re,watchType:Fr};';
const code=src.replace('qr().catch(l=>{console.log(l.message),w.exit()});',injection);
let calls=0;
const ctx={console,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,$request:{url:'https://youtubei.googleapis.com/youtubei/v1/player'},$response:{body:new Uint8Array()},$argument:'{"captionLang":"zh-Hant"}',$persistentStore:{read:()=>null,write:()=>true},$done:()=>calls++};
vm.createContext(ctx);vm.runInContext(code,ctx);
const api=ctx.testAPI;
function fixture(tracks){return {playabilityStatus:{},adPlacements:[],adSlots:[],captions:{playerCaptionsTracklistRenderer:{captionTracks:tracks,audioTracks:[{captionTrackIndices:[0]}]}}};}
function track(lang){return {baseUrl:'https://www.youtube.com/api/timedtext?v=test&lang='+lang,languageCode:lang};}
// Locate actual generated protobuf caption field from reflection, avoiding guessed JSON nesting.
const field=api.playerType.fields.filter(x=>/caption/i.test(x.name));
console.log('Player caption schema:',JSON.stringify(field.map(x=>({name:x.name,no:x.no,type:x.T?.().typeName}))));
const p=fixture([track('ja'),track('en')]);api.caption(p,'zh-Hant');
let c=p.captions.playerCaptionsTracklistRenderer;assert.equal(c.captionTracks.length,3);assert(c.captionTracks[2].baseUrl.includes('lang=en'));assert(c.captionTracks[2].baseUrl.includes('tlang=zh-Hans'));assert(c.captionTracks[2].baseUrl.includes('origin_tlang=zh-Hant'));assert.equal(c.audioTracks[0].defaultCaptionTrackIndex,2);
const existing=fixture([track('en'),track('zh-Hant')]);api.caption(existing,'zh-Hant');assert.equal(existing.captions.playerCaptionsTracklistRenderer.captionTracks.length,2);
const off=fixture([track('en')]);api.caption(off,'off');assert.equal(off.captions.playerCaptionsTracklistRenderer.captionTracks.length,1);
const noCaptions={playabilityStatus:{}};api.caption(noCaptions,'zh-Hant');
(async()=>{const p=api.playerType.create({playabilityStatus:{},adPlacements:[],adSlots:[]});const obj=new api.Player();obj.message=p;await obj.pure();const bytes=obj.toBinary();const round=api.playerType.fromBinary(bytes);assert(round.playabilityStatus);console.log('PASS caption selection, existing TC, off, no captions, Aioneas Player protobuf roundtrip.');})();

function runScript(name,request,response){let out;vm.runInNewContext(fs.readFileSync(dir+'/'+name,'utf8'),{$request:{url:request},$response:response||{},$done:r=>out=r,console});return out;}
const base='https://www.youtube.com/api/timedtext?v=test&lang=en&fmt=json3';
const req=runScript('youtube.tc.request.js',base+'&tlang=zh-Hant');assert(req.url.includes('&tlang=zh-Hans&origin_tlang=zh-Hant'));assert(req.url.includes('lang=en'));
assert.deepEqual(runScript('youtube.tc.request.js',base+'&tlang=zh-Hans'),{});
assert.deepEqual(runScript('youtube.tc.request.js',base),{});
const json=JSON.stringify({events:[{tStartMs:123,dDurationMs:456,segs:[{utf8:'软件和计算机，鼠标里面的设置'}]}]});
let converted=runScript('youtube.tc.response.js',req.url,{status:200,body:json});let parsed=JSON.parse(converted.body);assert.equal(parsed.events[0].tStartMs,123);assert.equal(parsed.events[0].dDurationMs,456);assert(parsed.events[0].segs[0].utf8.includes('軟體'));assert(parsed.events[0].segs[0].utf8.includes('滑鼠'));
const xml='<timedtext><body><p t="123" d="456">软件和计算机</p></body></timedtext>';
assert(runScript('youtube.tc.response.js',req.url,{status:200,body:xml}).body.includes('軟體'));
assert.deepEqual(runScript('youtube.tc.response.js',base+'&tlang=zh-Hans',{status:200,body:json}),{});
assert.deepEqual(runScript('youtube.tc.response.js',req.url,{status:403,body:json}),{});
assert.deepEqual(runScript('youtube.tc.response.js',req.url,{status:200,body:''}),{});
assert(runScript('youtube.tc.response.js',base+'&tlang=zh-Hant',{status:200,body:json}).body.includes('軟體'));
const empty=fixture([]);api.caption(empty,'zh-Hant');assert.equal(empty.captions.playerCaptionsTracklistRenderer.captionTracks.length,0);
console.log('PASS TC request rewrite, marker, original URL fallback, JSON3, XML, timing, OpenCC twp, plain Hans/native/error/empty passthrough.');
const capsType=api.playerType.fields.find(f=>f.name==='captions').T();
console.log('Captions fields:',capsType.fields.map(f=>({name:f.name,no:f.no,type:f.T?.().typeName})));

(async()=>{
 const p=api.playerType.create({playabilityStatus:{},captions:{playerCaptionsTrackListRenderer:{captionTracks:[track('en')],audioTracks:[{captionTrackIndices:[0]}]}},adPlacements:[],adSlots:[]});
 const bytes=api.playerType.toBinary(p);const obj=new api.Player();obj.fromBinary(bytes);await obj.pure();
 const round=api.playerType.fromBinary(obj.toBinary());const c=round.captions.playerCaptionsTrackListRenderer;
 assert.equal(c.captionTracks.length,2);assert.equal(c.captionTracks[1].languageCode,'zh-Hant');assert(c.captionTracks[1].baseUrl.includes('tlang=zh-Hans&origin_tlang=zh-Hant'));assert.equal(c.audioTracks[0].defaultCaptionTrackIndex,1);
 console.log('PASS actual protobuf captions roundtrip + Player integration.');
})();

const escaped='{"events":[{"tStartMs":12,"segs":[{"utf8":"\\u8f6f\\u4ef6"}]}],"metadata":"软件"}';
const escOut=JSON.parse(runScript('youtube.tc.response.js',req.url,{status:200,body:escaped}).body);assert.equal(escOut.events[0].segs[0].utf8,'軟體');assert.equal(escOut.metadata,'软件');
console.log('PASS Unicode-escaped JSON3 and metadata preservation.');
