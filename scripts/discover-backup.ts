import 'dotenv/config';
const r=await fetch('https://api.anthropic.com/v1/organizations/workspaces?include_default=true',{headers:{'x-api-key':process.env.ANTHROPIC_API_KEY||'','anthropic-version':'2023-06-01'},signal:AbortSignal.timeout(15000)});
const body=await r.json();console.log(JSON.stringify({status:r.status,workspaces:body.data?.map((w:{id:string;name:string})=>({id:w.id,name:w.name})),error:body.error?.message}));
