import 'dotenv/config';
import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcp';
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'64kb'}));
app.get('/health',(_req,res)=>res.json({status:'ok',service:'groundwork-mcp',protocol:'2025-11-25',tools:7}));
app.post('/mcp',async(req,res)=>{
  if(process.env.MCP_TOKEN&&req.headers.authorization!==`Bearer ${process.env.MCP_TOKEN}`){res.status(401).json({error:'Unauthorized'});return;}
  if(req.headers.origin&&!['http://localhost:3000',process.env.PUBLIC_ORIGIN].filter(Boolean).includes(req.headers.origin)){res.status(403).json({error:'Origin rejected'});return;}
  const server=createMcpServer();const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
  try{await server.connect(transport);res.on('close',()=>{void transport.close();void server.close();});await transport.handleRequest(req,res,req.body);}
  catch{if(!res.headersSent)res.status(500).json({error:'MCP request failed'});}
});
app.all('/mcp',(_req,res)=>res.status(405).set('Allow','POST').end());
const port=Number(process.env.MCP_PORT||3001);app.listen(port,process.env.MCP_HOST||'127.0.0.1',()=>console.log(`Groundwork MCP listening on port ${port}`));
