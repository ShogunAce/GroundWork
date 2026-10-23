import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY,maxRetries:0,timeout:15000});
try{const r=await client.messages.create({model:process.env.ANTHROPIC_MODEL||'claude-sonnet-5-5',max_tokens:10,messages:[{role:'user',content:'Reply READY only.'}]});console.log(JSON.stringify({provider:'anthropic',ok:true,model:r.model}));}catch(e){const error=e as {status?:number;name?:string;message?:string};const message=(error.message||'').replace(/sk-[A-Za-z0-9_-]+/g,'[redacted]');console.log(JSON.stringify({provider:'anthropic',ok:false,status:error.status,name:error.name,message}));process.exitCode=1;}
