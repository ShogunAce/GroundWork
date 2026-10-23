import 'dotenv/config';
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const url=process.env.MCP_URL||'http://127.0.0.1:3001/mcp';
const headers:Record<string,string>={'Content-Type':'application/json',Accept:'application/json, text/event-stream'};if(process.env.MCP_TOKEN)headers.Authorization=`Bearer ${process.env.MCP_TOKEN}`;
const r=await fetch(url,{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'groundwork-compliance',version:'1.0.0'}}})});assert.equal(r.status,200);const init=await r.json();assert.ok(init.result.protocolVersion>='2025-11-25');
const client=new Client({name:'groundwork-verify',version:'1.0.0'});await client.connect(new StreamableHTTPClientTransport(new URL(url),{requestInit:{headers}}));const list=await client.listTools();assert.deepEqual(list.tools.map(t=>t.name).sort(),['parse_dump','log_observation','block_schedule','suggest_mission','match_problems','build_workbook','export_dataset'].sort());await client.close();console.log(`PASS: Streamable HTTP; negotiated ${init.result.protocolVersion}; all 7 tools listed.`);
