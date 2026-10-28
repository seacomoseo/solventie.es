// Public, text-only intake for this landing. All delivery authority stays server-side.
import { classify, POLICY_VERSION } from './antispam.mjs';
const DOMAIN='solventie.es', FORM='form-jornada-tecnica-comunidades-de-regantes';
const CONSUMER='1yQEoxReqnvQbQ5LkGnhUvu2_Aa-PhGfFztoRG1qY6iM';
const SUBJECT='Jornada Técnica ACATCOR — Comunidades de regantes';
const ROUTE='principal:'+DOMAIN+':'+FORM;
const ORIGINS=['https://solventie.es','https://www.solventie.es'];
const OP=new Set(['_headers','_subject','_domain','_id','_sheetname','_token','_submission_id','_confirmation','_confirmation_email','_language','CC','IP','User Agent','Timestamp']);
const ALLOWED=new Set([...OP,'Nombre','Empresa','Teléfono','Email','Consentimiento','Intereses','Idioma','Campaña','URL','_gotcha','utm_source','utm_medium','utm_campaign','utm_term','utm_content']);
const enc=new TextEncoder();
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
function normalize(entries,headers){
 const grouped=new Map();for(const [k,v]of entries){if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(v);}
 const names=new Set(headers.map(h=>h.name));for(const k of grouped.keys())names.add(k);
 return [...names].filter(k=>!OP.has(k)).flatMap(k=>(grouped.get(k)||['']).map(v=>[k,v]));
}
async function bounded(req){
 if(Number(req.headers.get('content-length')||0)>65536)throw Error('size');
 const reader=req.body?.getReader();if(!reader)throw Error('body');let n=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;n+=value.byteLength;if(n>65536){await reader.cancel();throw Error('size');}chunks.push(value);}
 const bytes=new Uint8Array(n);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 return new URLSearchParams(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
export default {async fetch(req,env){
 const origin=req.headers.get('origin')||'';
 const reply=(code,body)=>Response.json(body,{status:code,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff',...(ORIGINS.includes(origin)?{'access-control-allow-origin':origin,'vary':'Origin'}:{})}});
 const error=(code,name)=>reply(code,{result:'error',persisted:false,status:'error',code:name});
 try{
  const u=new URL(req.url);
  if(u.pathname!=='/v1/forms'||(u.searchParams.has('route')&&u.searchParams.get('route')!==ROUTE))return error(404,'route');
  if(!ORIGINS.includes(origin))return error(403,'origin'); // Anti-CSRF, NOT authentication.
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type','vary':'Origin','cache-control':'no-store'}});
  if(req.method!=='POST')return error(405,'method');
  if((req.headers.get('content-type')||'').split(';')[0].trim()!=='application/x-www-form-urlencoded')return error(415,'encoding');
  // Approximate per-POP admission bound; never represented as a global mail cap.
  if(!(await env.ADMISSION.limit({key:'acatcor'})).success)return error(429,'rate_limit');
  const p=await bounded(req),entries=[...p];
  if(entries.length>64||entries.some(([k,v])=>!ALLOWED.has(k)||enc.encode(v).length>4096)||new Set(entries.map(p=>p[0])).size!==entries.length)return error(400,'fields');
  const id=p.get('_submission_id');if(!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,99}$/.test(id||''))return error(400,'id');
  if(p.get('_domain')!==DOMAIN||p.get('_id')!==FORM)return error(400,'identity');
  let headers=[];try{headers=JSON.parse(p.get('_headers')||'[]');}catch{return error(400,'headers');}
  if(!Array.isArray(headers)||headers.length>64||headers.some(h=>!h||typeof h.name!=='string'||!ALLOWED.has(h.name)||h.type==='file'))return error(400,'headers');
  // Match the existing GAS normalizer, including absent columns and ordering.
  const fields=normalize(entries,headers),params=Object.fromEntries(fields);
  if(!['Nombre','Empresa'].every(k=>(params[k]||'').trim().length>=2)||!/^\+?[0-9\s().-]{9,20}$/.test(params['Teléfono']||'')||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.Email||'')||!params.Consentimiento||!['es','ca'].includes(params.Idioma)||params['Campaña']!=='ACATCOR')return error(400,'validation');
  // Connected owns atomic identity arbitration and migrated legacy tombstones.
  const c=classify({...params,_domain:DOMAIN,_id:FORM},{policyVersion:POLICY_VERSION,expectedDomain:DOMAIN,expectedFormId:FORM});
  if(c.classification==='invalid')return error(400,'validation');
  let bcc=['formularios-web@solventie.es'];
  // Temporary trusted canary, no public destination or credential selector.
  if(req.headers.has('x-solvent-test')){
   const t=env.TEST_CONFIG?JSON.parse(env.TEST_CONFIG):null;
   if(!t||t.id!==id||t.key!==req.headers.get('x-solvent-test')||t.recipient!=='achucore@gmail.com')return error(403,'test');
   bcc=[t.recipient];
  }
  const e={v:2,consumer:CONSUMER,domain:DOMAIN,form:FORM,id,sent_at:Date.now(),fields,files:[],delivery:{source:'trusted-gas',bcc},subject:SUBJECT,confirmation:{enabled:false,subject:'',fields:false,intro:'',notice:'',introHtml:'',noticeHtml:''},review_reasons:c.classification==='review'?c.reasonCodes:[]};
  const bytes=enc.encode(JSON.stringify(e));
  const key=await crypto.subtle.importKey('raw',enc.encode(env.BRIDGE_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signature=hex(await crypto.subtle.sign('HMAC',key,bytes));
  const r=await env.CONNECTED.fetch('https://connected.internal/v2/submit',{method:'POST',headers:{'content-type':'application/octet-stream','content-length':String(bytes.length),'x-sf-envelope-length':String(bytes.length),'x-sf-signature':signature},body:bytes,signal:AbortSignal.timeout(20000)});
  let data;try{data=await r.json();}catch{return error(503,'receipt_not_confirmed');}
  if(r.status===409)return error(409,'submission_conflict');
  if(!r.ok||data.result!=='success'||data.persisted!==true||data.submissionId!==id||!['accepted','review'].includes(data.status)||typeof data.receipt!=='string')return error(503,'receipt_not_confirmed');
  return reply(200,{result:'success',persisted:true,submissionId:id,receipt:data.receipt,status:data.status});
 }catch{return error(503,'receipt_not_confirmed');}
}};
export {normalize,DOMAIN,FORM,CONSUMER};
