import ExcelJS from 'exceljs';
import {validateWorkbook,type Workbook} from '../../../../server/core';
export const runtime='nodejs';
export async function POST(request:Request){
 try{
  const text=await request.text();if(text.length>250000)return Response.json({error:'Workbook too large'},{status:413});
  const w=JSON.parse(text) as Workbook;validateWorkbook(w);
  const book=new ExcelJS.Workbook();book.creator='Groundwork';
  function sheet(name:string,rows:Record<string,unknown>[]){const s=book.addWorksheet(name);const keys=Object.keys(rows[0]||{note:''});s.columns=keys.map(k=>({header:k.replaceAll('_',' '),key:k,width:k==='what'||k.includes('statement')?65:30}));for(const row of rows)s.addRow(Object.fromEntries(Object.entries(row).map(([k,v])=>[k,Array.isArray(v)?v.join('; '):String(v??'')])));s.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};s.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF234C3B'}};s.views=[{state:'frozen',ySplit:1}];s.eachRow(r=>r.alignment={vertical:'top',wrapText:true});}
  sheet('Observations',w.observations);sheet('Missions',w.missions);sheet('Problems',w.problems);sheet('Hackathon Briefs',w.briefs);sheet('7-Day Plan',w.plan);
  const buffer=await book.xlsx.writeBuffer();return new Response(new Uint8Array(buffer),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="groundwork-workbook.xlsx"'}});
 }catch{return Response.json({error:'Invalid workbook. Build a fresh workbook and try again.'},{status:400});}
}
