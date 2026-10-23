import { randomUUID } from 'node:crypto';
import catalog from './data/problems.json';
import templates from './data/mission_templates.json';

export const problems = catalog.problems;
export const categories = ['water','wildlife','soil','weather','plants','built-environment'] as const;
export type Category = typeof categories[number];
export type Item = {type:'observation'|'task'|'idea'|'worry';text:string;category?:Category;where?:string;when?:string;confidence?:string};
export type Observation = {id:string;category:Category;what:string;where:string;when:string;measurement?:string;confidence:string};
export type Block = {start:string;end:string;title:string;kind:'task'|'break'|'mission';next_action:string};
type Mission = typeof templates[number] & {evidence_ids:string[];gap:string};
type Match = typeof problems[number] & {evidence_ids:string[];confidence:string;suggestion:string;cannot_tell:string};
type Session = {id:string;created:number;items:Item[];observations:Observation[];blocks:Block[];missions:Mission[];matches:Match[]};
const sessions = new Map<string,Session>();
export function session(id:string) {
  for(const [key,value] of sessions) if(Date.now()-value.created>6*60*60*1000) sessions.delete(key);
  let s = sessions.get(id);
  if(!s) {if(sessions.size>=500) throw new Error('Session capacity reached. Try again later.'); s={id,created:Date.now(),items:[],observations:[],blocks:[],missions:[],matches:[]};sessions.set(id,s);}
  return s;
}
export function detectCategory(text:string):Category {
  if(/culvert|drain|lamp|light pollution/i.test(text)) return 'built-environment';
  if(/bird|bee|pollinator|insect/i.test(text)) return 'wildlife';
  if(/soil|planter|moisture/i.test(text)) return 'soil';
  if(/hotter|temperature|paved|weather/i.test(text)) return 'weather';
  if(/ivy|plant|flower|canopy/i.test(text)) return 'plants';
  return 'water';
}
export function parseDump(text:string, id:string) {
  const chunks=text.match(/[^.!?]+[.!?]*/g)||[];
  const items:Item[]=[];
  for(const raw of chunks) {
    const t=raw.trim(); if(!t)continue;
    let type:Item['type']|undefined;
    if(/\b(worried|worry|anxious|afraid)\b/i.test(t))type='worry';
    else if(/\b(maybe we could|idea is|we could build|what if)\b/i.test(t))type='idea';
    else if(/\b(need to|have to|must |finish the|buy rice|book the|return the)\b/i.test(t))type='task';
    else if(/\b(cloudy|sediment|culvert|birds?|bee|soil|hotter|ivy|litter|moth|temperature|water looked|flowers|planter|rain)\b/i.test(t))type='observation';
    if(type) items.push({type,text:t,...(type==='observation'?{category:detectCategory(t),where:extractPlace(t,text),when:/morning/i.test(text)?'this morning (user reported)':'not specified',confidence:'unverified personal observation'}:{})});
  }
  const s=session(id);s.items=items;s.observations=[];s.blocks=[];s.missions=[];s.matches=[];
  return {session_id:id,items,parser:'deterministic rules',notice:'Quoted notes are unverified observations; review their categories before reuse.'};
}
function extractPlace(t:string,whole:string) {
  if(/balcony|planter/i.test(t))return /balcony/i.test(whole)?'my balcony planter':'my planter';
  if(/bus stop/i.test(t))return 'the paved bus stop';
  if(/old mill|mill fence|mill wall/i.test(t))return 'by the old mill';
  if(/creek/i.test(t)&&/old mill/i.test(whole))return 'the creek by the old mill';
  return 'not specified';
}
export function logObservation(id:string, input:Omit<Observation,'id'>) {
  const s=session(id);const existing=s.observations.find(o=>o.what===input.what);if(existing)return existing;
  if(s.observations.length>=100)throw new Error('Observation limit reached');
  const o={...input,id:`OBS-${String(s.observations.length+1).padStart(3,'0')}`};s.observations.push(o);return o;
}
function clock(n:number){return `${String(Math.floor(n/60)%24).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
export function blockSchedule(id:string,tasks:string[],start:string,energy='steady') {
  const s=session(id); const [h,m]=start.split(':').map(Number);let time=h*60+m;
  const blocks:Block[]=[]; const add=(title:string,duration:number,kind:Block['kind'],next_action:string)=>{blocks.push({start:clock(time),end:clock(time+duration),title,kind,next_action});time+=duration;};
  const ordered=[...tasks].sort((a,b)=>Number(/before|deadline|noon|closes/i.test(b))-Number(/before|deadline|noon|closes/i.test(a)));
  ordered.slice(0,12).forEach((t,i)=>{add(t,energy==='low'?15:25,'task',/call|book/i.test(t)?'Write one sentence saying what you need, then find the phone number.':`Start with two minutes: ${t.replace(/^(Anyway |And |Oh, and )/i,'')}`);add(i===1?'Lunch and a little breathing room':'Pause, stretch, and leave a buffer',i===1?30:10,'break','Step away. You do not need to earn this break.');});
  s.missions.slice(0,2).forEach(m=>{add(m.title,m.duration,'mission',m.steps[0]);add('Travel and transition buffer',10,'break','Allow time to get back without rushing.');});
  s.blocks=blocks;return {blocks,next_action:blocks[0]?.next_action||'Choose one safe observation to repeat.',notice:'Suggested blocks are editable planning estimates, not calendar appointments. Check real deadlines.'};
}
export function suggestMission(id:string) {
  const s=session(id);const present=new Set(s.observations.map(o=>o.category));
  const ranked=[...templates].sort((a,b)=>Number(present.has(b.category as Category))-Number(present.has(a.category as Category)));
  s.missions=ranked.slice(0,6).map(t=>({...t,evidence_ids:s.observations.filter(o=>o.category===t.category).map(o=>o.id),gap:present.has(t.category as Category)?'No repeat observation with consistent effort yet.':'No observations in this category yet.'}));
  return {missions:s.missions};
}
export function matchProblems(id:string) {
  const s=session(id);
  s.matches=problems.map(p=>{const evidence=s.observations.filter(o=>p.signals.some(signal=>o.what.toLowerCase().includes(signal)));return {...p,evidence_ids:evidence.map(o=>o.id),confidence:'exploratory — not a diagnosis',suggestion:`These notes suggest a question worth repeat observation about ${p.name.toLowerCase()}.`,cannot_tell:'These observations cannot establish causation, a population trend, contamination, or water/soil safety.'};}).filter(p=>p.evidence_ids.length>0);
  return {problems:s.matches};
}
export function buildWorkbook(id:string) {
  const s=session(id);if(!s.observations.length)throw new Error('Log at least one observation before building a workbook.');
  if(!s.missions.length)suggestMission(id);if(!s.matches.length)matchProblems(id);
  if(!s.blocks.length)blockSchedule(id,s.items.filter(i=>i.type==='task').map(i=>i.text),'09:00');
  const counts=Object.fromEntries(categories.map(c=>[c,s.observations.filter(o=>o.category===c).length]));
  const briefs=s.matches.slice(0,3).map(p=>({problem_id:p.id,title:p.hackathon_angle,evidence_ids:p.evidence_ids,problem_statement:`Help neighbors document ${p.name.toLowerCase()} without overstating what their observations show.`,who_it_helps:'Residents, volunteer coordinators, and local researchers reviewing community records.',data_needed:p.citizen_measures,collection:s.missions.filter(m=>m.problem_ids.includes(p.id)).map(m=>m.title),suggested_build:`Build ${p.hackathon_angle.toLowerCase()} with a repeatable observation form and evidence-linked comparison view.`,mcp_tools:['log_observation','suggest_mission','export_dataset'],team_roles:['Field-method reviewer','Interface builder','Data and MCP engineer'],scope_48h:['First 12 hours: agree on fields and safe observation instructions.','Next 24 hours: implement capture, comparison, and export using sample data.','Final 12 hours: test evidence links and run a small usability session.'],success_metric:'Every displayed comparison links to existing record IDs and states missing context; one volunteer can complete and export a record without help.'}));
  const workbook={session_id:id,generated_at:new Date().toISOString(),title:'Small observations. Useful next steps.',summary:{total:s.observations.length,counts,places:[...new Set(s.observations.map(o=>o.where))],dates:[...new Set(s.observations.map(o=>o.when))],patterns:categories.filter(c=>counts[c]).map(c=>({text:`${counts[c]} of ${s.observations.length} observations are categorized as ${c}.`,evidence_ids:s.observations.filter(o=>o.category===c).map(o=>o.id)})),data_gaps:['Repeated observations at the same place and time','Standard observation duration and equipment','Verified dates, species identifications, and measurement units',...categories.filter(c=>!counts[c]).map(c=>`No ${c} observations yet`)]},schedule:{blocks:s.blocks,next_action:s.blocks[0]?.next_action||'Repeat one safe observation.'},missions:s.missions,problems:s.matches,briefs,plan:Array.from({length:7},(_,i)=>({day:i+1,mission:s.missions[i%s.missions.length].title,follow_up:'Add one dated follow-up record from the same safe viewpoint; record uncertainty.',share:i===6?'Share a location-reviewed CSV and your limitations with a local volunteer group; ask whether these fields are useful.':'Keep notes private while you review location detail.'})),observations:s.observations,ideas:s.items.filter(i=>i.type==='idea').map(i=>i.text),worries:s.items.filter(i=>i.type==='worry').map(i=>i.text),limitations:'Personal observations are not validated scientific findings. No geocoding is performed. No safety, medical, legal, or causal conclusions are made.'};
  validateWorkbook(workbook);return workbook;
}
export type Workbook=ReturnType<typeof buildWorkbook>;
export function validateWorkbook(w:{observations:Observation[];problems:Match[];missions:Mission[];briefs:{problem_id:string;evidence_ids:string[]}[];summary:{patterns:{evidence_ids:string[]}[]}}) {
  const ids=new Set(w.observations.map(o=>o.id));const pids=new Set(problems.map(p=>p.id));
  for(const part of [...w.problems,...w.missions,...w.briefs,...w.summary.patterns])for(const id of part.evidence_ids)if(!ids.has(id))throw new Error('Invalid evidence reference');
  for(const p of w.problems)if(!pids.has(p.id))throw new Error('Unknown problem');
  for(const m of w.missions)if(!m.safety_note)throw new Error('Missing mission safety note');
  for(const b of w.briefs)if(!w.problems.some(p=>p.id===b.problem_id))throw new Error('Brief is not linked to matched problem');
}
export function exportDataset(id:string,format:'csv'|'geojson') {
  const observations=session(id).observations;
  if(format==='geojson')return {format,content:JSON.stringify({type:'FeatureCollection',features:observations.map(o=>({type:'Feature',geometry:null,properties:{...o,place_name:o.where}}))},null,2)};
  const fields=['id','category','what','where','when','measurement','confidence'] as const;
  const cell=(v:string)=>`"${(/^[=+@\-\t\r]/.test(v)?"'":'')+v.replaceAll('"','""')}"`;
  return {format,content:[fields.join(','),...observations.map(o=>fields.map(f=>cell(o[f]||'')).join(','))].join('\r\n')};
}
export function newSession(){return randomUUID();}
