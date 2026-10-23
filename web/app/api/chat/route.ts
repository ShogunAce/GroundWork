import {pipeline} from '../../../lib/pipeline';
export const runtime='nodejs';export const maxDuration=60;
const limits=new Map<string,{count:number;until:number}>();
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin&&origin!==process.env.PUBLIC_ORIGIN)return Response.json({error:'Origin rejected'},{status:403});
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]||'local';const now=Date.now();for(const [k,v] of limits)if(v.until<now)limits.delete(k);
 const limit=limits.get(ip)||{count:0,until:now+600000};if(limit.count>=20)return Response.json({error:'Please wait a few minutes before starting another ramble.'},{status:429});limit.count++;limits.set(ip,limit);
 let body;try{body=await request.json();}catch{return Response.json({error:'Invalid JSON'},{status:400});}
 if(typeof body.text!=='string'||!body.text.trim()||body.text.length>16000)return Response.json({error:'Enter a ramble between 1 and 16,000 characters.'},{status:400});
 const encoder=new TextEncoder();const stream=new ReadableStream({async start(controller){let closed=false;const emit=(event:unknown)=>{if(!closed)try{controller.enqueue(encoder.encode(JSON.stringify(event)+'\n'));}catch{closed=true;}};try{await pipeline(body.text,emit);}catch(error){emit({type:'error',message:error instanceof Error?error.message:'The pipeline could not finish. Please try again.'});}finally{if(!closed)controller.close();}}});
 return new Response(stream,{headers:{'Content-Type':'application/x-ndjson','Cache-Control':'no-store','X-Accel-Buffering':'no'}});
}
