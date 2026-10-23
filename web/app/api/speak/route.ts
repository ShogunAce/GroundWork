import {PollyClient,SynthesizeSpeechCommand} from '@aws-sdk/client-polly';
export const runtime='nodejs';
const client=new PollyClient({region:process.env.AWS_REGION||'us-east-1',maxAttempts:1});
const limits=new Map<string,{count:number;until:number}>();
/** Amazon Polly neural voice for the assistant's spoken replies. */
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin&&origin!==process.env.PUBLIC_ORIGIN)return Response.json({error:'Origin rejected'},{status:403});
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]||'local';const now=Date.now();const limit=limits.get(ip);const current=limit&&limit.until>now?limit:{count:0,until:now+600000};if(current.count>=30)return Response.json({error:'Too many voice requests'},{status:429});current.count++;limits.set(ip,current);
 let body;try{body=await request.json();}catch{return Response.json({error:'Invalid JSON'},{status:400});}
 if(typeof body.text!=='string'||!body.text.trim()||body.text.length>600)return Response.json({error:'Text must be 1 to 600 characters.'},{status:400});
 try{
  const r=await client.send(new SynthesizeSpeechCommand({Text:body.text,OutputFormat:'mp3',VoiceId:'Ruth',Engine:'neural'}),{abortSignal:AbortSignal.timeout(8000)});
  const audio=await r.AudioStream!.transformToByteArray();
  return new Response(Buffer.from(audio),{headers:{'Content-Type':'audio/mpeg','Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Voice unavailable'},{status:503});}
}
