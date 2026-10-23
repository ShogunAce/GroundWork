import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {randomUUID} from 'node:crypto';
import {planWithLLM} from './llm';
import type {Item,Workbook} from '../../server/core';
export type PipelineEvent={type:string;[key:string]:unknown};
export async function pipeline(text:string,emit:(event:PipelineEvent)=>void){
 const id=randomUUID();const client=new Client({name:'groundwork-web',version:'1.0.0'});
 const transport=new StreamableHTTPClientTransport(new URL(process.env.MCP_URL||'http://127.0.0.1:3001/mcp'),{requestInit:{headers:process.env.MCP_TOKEN?{Authorization:`Bearer ${process.env.MCP_TOKEN}`}:{}}});
 const log:{name:string;duration_ms:number}[]=[];
 await client.connect(transport);
 async function call<T>(name:string,args:Record<string,unknown>={}):Promise<T>{
  const started=Date.now();emit({type:'tool_start',name});
  const r=await client.callTool({name,arguments:{session_id:id,...args}});
  if(r.isError)throw new Error(`Tool ${name} could not complete`);
  const content=r.content as {type:string;text?:string}[];const value=JSON.parse(content.find(c=>c.type==='text')?.text||'{}') as T;
  const entry={name,duration_ms:Date.now()-started};log.push(entry);emit({type:'tool_end',...entry});return value;
 }
 try{
  const parsed=await call<{items:Item[]}>('parse_dump',{text});emit({type:'parsed',items:parsed.items});
  for(const item of parsed.items.filter(i=>i.type==='observation')){const observation=await call('log_observation',{category:item.category,what:item.text,where:item.where,when:item.when,confidence:item.confidence});emit({type:'observation',observation});}
  if(!parsed.items.some(i=>i.type==='observation'))throw new Error('No field observations found. Describe something you noticed: water, plants, wildlife, soil, weather, or a drain.');
  const plan=await planWithLLM(text);emit({type:'provider',...plan});
  const missions=await call('suggest_mission');emit({type:'missions',...missions as object});
  const schedule=await call('block_schedule',{tasks:parsed.items.filter(i=>i.type==='task').map(i=>i.text),start_time:plan.start_time,energy:plan.energy});emit({type:'schedule',...schedule as object});
  await call('match_problems');const workbook=await call<Workbook>('build_workbook');
  const csv=await call<{content:string}>('export_dataset',{format:'csv'});const geojson=await call<{content:string}>('export_dataset',{format:'geojson'});
  emit({type:'complete',workbook,exports:{csv:csv.content,geojson:geojson.content},tools:log,provider:plan.provider,notice:plan.notice});
 }finally{await client.close();}
}
