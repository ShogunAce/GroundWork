import {readFile} from 'node:fs/promises';
import path from 'node:path';
export async function GET(){const text=await readFile(path.join(process.cwd(),'../server/data/sample_ramble.txt'),'utf8');return Response.json({text});}
