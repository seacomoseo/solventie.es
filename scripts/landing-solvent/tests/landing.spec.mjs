import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {installValidationOverride} from '../validation-override.mjs';
const URL='/landing/jornada-tecnica-comunidades-de-regantes/';
const STATIC=new globalThis.URL('../../../static/landing/jornada-tecnica-comunidades-de-regantes/',import.meta.url);
async function setup(page,{live=false,status='accepted',persisted=true,legacy=false,fail=false}={}){
 const requests=[],external=[];let failure=fail;
 await page.route('**/*',async route=>{
  const req=route.request(),u=new globalThis.URL(req.url());
  if(u.hostname==='script.google.com' || u.pathname==='/api/forms'){
   const body=new URLSearchParams(req.postData());requests.push({body,headers:req.headers()});
   if(failure){failure=false;await route.abort();return;}
   await route.fulfill({json:legacy?{result:'success'}:{result:'success',persisted,submissionId:body.get('_submission_id'),status}});return;
  }
  if(u.hostname==='api64.ipify.org'){await route.fulfill({json:{ip:'192.0.2.1'}});return;}
  if(u.hostname==='www.googletagmanager.com'){external.push(req.url());await route.fulfill({body:'',contentType:'application/javascript'});return;}
  if(live && u.hostname==='solventie.es'){
   const name=u.pathname.split('/assets/')[1];
   if(!name || !name.includes('..')) {const file=name?'assets/'+name:'index.html';await route.fulfill({path:new globalThis.URL(file,STATIC).pathname});return;}
  }
  if(u.hostname!=='127.0.0.1'){external.push(req.url());await route.abort();return;}
  await route.continue();
 });
 return {requests,external};
}
async function fill(page,consent=true){await page.locator('#nombre').fill('Persona Prueba');await page.locator('#empresa').fill('Comunidad ficticia');await page.locator('#telefono').fill('600000000');await page.locator('#email').fill('prueba@example.invalid');if(consent)await page.locator('[name=consentimiento]').check();}
async function open(page,live=false){await page.goto((live?'https://solventie.es':'')+URL+'?utm_source=ACATCOR&utm_campaign=jornada&email=secret@example.invalid');}
const click=page=>page.locator('button[type=submit]').click();
test('apariencia, todos los textos ES/CA, fotos locales y persistencia idioma',async({page},info)=>{
 await setup(page);await open(page);await page.evaluate(()=>document.fonts.ready);
 const dict=JSON.parse(fs.readFileSync(new globalThis.URL('../content.json',import.meta.url)));
 for(const l of ['es','ca']){
  await page.getByRole('button',{name:l==='es'?'Español':'Català',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang',l);
  const text=await page.locator('#app').textContent();
  for(const [key,value] of Object.entries(dict[l])){
   if(['errors','thanks','thanksSub','sendError','heroAlt'].includes(key))continue;
   for(const part of Array.isArray(value)?value.flat():[value])expect(text).toContain(part);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  expect(await page.locator('#app img').evaluateAll(els=>els.every(e=>e.complete&&e.naturalWidth>0))).toBeTruthy();
  await page.screenshot({path:`evidence/${info.project.name}-${l}.png`,fullPage:true});
 }
 await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','ca');
});
test('invalid y falta consentimiento no envían',async({page})=>{
 const x=await setup(page);await open(page);await click(page);await expect(page.locator('.field-error')).toHaveCount(5);
 await fill(page,false);await click(page);await expect(page.locator('.field-error')).toHaveCount(1);expect(x.requests).toHaveLength(0);
});
for(const status of ['accepted','review'])test(`recibo ${status}, doble clic y GA4`,async({page})=>{
 const x=await setup(page,{live:true,status});await open(page,true);await fill(page);
 await page.evaluate(()=>{const f=document.querySelector('form');f.requestSubmit();f.requestSubmit();});await expect(page.locator('#lead-success')).toBeVisible();expect(x.requests).toHaveLength(1);
 const {body,headers}=x.requests[0];expect(headers['content-type']).toContain('application/x-www-form-urlencoded');expect(body.get('CC')).toBe('formularios-web@solventie.es');expect(body.get('Nombre')).toBe('Persona Prueba');expect(body.get('Email')).toBe('prueba@example.invalid');expect(body.get('nombre')).toBeNull();expect(body.get('Campaña')).toBe('ACATCOR');expect(body.get('IP')).toBe('192.0.2.1');expect(body.get('_domain')).toBe('solventie.es');expect(body.get('URL')).toContain('utm_source=ACATCOR');expect(body.get('Timestamp')).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);expect(JSON.parse(body.get('_headers')).some(x=>x.name==='Campaña')).toBeTruthy();expect(body.get('_gotcha')).toBe('');
 const events=await page.evaluate(()=>Array.from(window.dataLayer||[],x=>Array.from(x)));
 expect(events.filter(e=>e[0]==='event'&&e[1]==='contact')).toHaveLength(status==='accepted'?1:0);expect(JSON.stringify(events)).not.toContain('secret@');expect(events.some(e=>e[1]==='generate_lead')).toBeFalsy();
 await page.reload();await expect(page.locator('#lead-success')).toBeVisible();expect(x.requests).toHaveLength(1);
});
test('legacy queued success remains compatible',async({page})=>{const x=await setup(page,{live:true,legacy:true});await page.addInitScript(()=>{const id='legacy-pending-test';const action='https://script.google.com/macros/s/AKfycbzEd6cjH5eTjzVxDVk6x-3Q9QwUHDMWpR8V1Ij1g6IG7MYwpPM_epAGpxJUR1__ljrWMQ/exec';localStorage.setItem('sansoul.form.pending.'+id,JSON.stringify({submissionId:id,action,body:'_id=form-jornada-tecnica-comunidades-de-regantes&_submission_id='+id}));});await open(page,true);await expect(page.locator('#lead-success')).toBeVisible();expect(await page.evaluate(()=>window.dataLayer.filter(x=>x[1]==='contact').length)).toBe(1);expect(x.requests).toHaveLength(1);});
test('new endpoint rejects spam receipts',async({page})=>{const x=await setup(page,{live:true,status:'spam'});await open(page,true);await fill(page);await click(page);await expect(page.locator('#form-feedback')).toBeVisible();await expect(page.locator('#lead-success')).toHaveCount(0);expect(x.requests).toHaveLength(1);expect(await page.evaluate(()=>window.dataLayer.filter(x=>x[1]==='contact').length)).toBe(0);});
test('new endpoint rejects incomplete legacy receipts',async({page})=>{const x=await setup(page,{live:true,legacy:true});await open(page,true);await fill(page);await click(page);await expect(page.locator('#form-feedback')).toBeVisible();await expect(page.locator('#lead-success')).toHaveCount(0);expect(x.requests).toHaveLength(1);expect(await page.evaluate(()=>window.dataLayer.filter(x=>x[1]==='contact').length)).toBe(0);});
test('error y reintento idempotente al recargar',async({page})=>{
 const x=await setup(page,{fail:true});await open(page);await fill(page);await click(page);await expect(page.locator('#form-feedback')).toBeVisible();expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sansoul.form.pending.')).length)).toBe(1);
 await page.reload();await expect(page.locator('#lead-success')).toBeVisible();expect(x.requests).toHaveLength(2);expect(x.requests[0].body.toString()).toBe(x.requests[1].body.toString());expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sansoul.form.pending.')).length)).toBe(0);
});
test('no recibo durable no éxito ni evento',async({page})=>{
 await setup(page,{live:true,persisted:false});await open(page,true);await fill(page);await click(page);await expect(page.locator('#form-feedback')).toBeVisible();await expect(page.locator('#lead-success')).toHaveCount(0);expect(await page.evaluate(()=>window.dataLayer.filter(x=>x[1]==='contact').length)).toBe(0);
});
for(const preference of ['none','rejected','accepted'])test(`GA4 inmediato sin banner, carga única y privacidad (${preference})`,async({page})=>{
 const x=await setup(page,{live:true});
 await page.addInitScript(preference=>{if(preference!=='none')localStorage.setItem('controlcookie','1');if(preference==='accepted')localStorage.setItem('controlcookieanalytics','1');},preference);
 await open(page,true);await expect.poll(()=>x.external.length).toBe(1);
 expect(x.external[0]).toBe('https://www.googletagmanager.com/gtag/js?id=G-XT4VMEX7YT');
 await expect(page.locator('[id^="cookie-"]')).toHaveCount(0);
 await page.getByRole('button',{name:'Català',exact:true}).click();
 await page.evaluate(()=>{window.dispatchEvent(new Event('storage'));window.dispatchEvent(new Event('online'));});
 await fill(page);await click(page);await expect(page.locator('#lead-success')).toBeVisible();
 const events=await page.evaluate(()=>Array.from(window.dataLayer,x=>Array.from(x)));
 expect(events.filter(e=>e[0]==='js')).toHaveLength(1);expect(events.filter(e=>e[0]==='config')).toHaveLength(1);
 expect(events.filter(e=>e[0]==='consent')).toHaveLength(0);
 expect(events.filter(e=>e[0]==='event'&&e[1]==='contact')).toHaveLength(1);
 const config=events.find(e=>e[0]==='config');expect(config[1]).toBe('G-XT4VMEX7YT');
 expect(config[2]).toMatchObject({page_location:'https://solventie.es'+URL,page_referrer:'',campaign_source:'ACATCOR',campaign_name:'jornada'});
 expect(config[2]).not.toHaveProperty('campaign_medium');
 for(const pii of ['secret@','Persona Prueba','Comunidad ficticia','600000000','prueba@example.invalid'])expect(JSON.stringify(events)).not.toContain(pii);
 expect(await page.evaluate(()=>window['ga-disable-G-XT4VMEX7YT'])).not.toBe(true);
 expect(x.external).toHaveLength(1);await expect(page.locator('script[data-solvent-ga]')).toHaveCount(1);
});
test('UTM reales sin atribución fija; valores sensibles se omiten de GA4',async({page})=>{
 await setup(page,{live:true});
 await page.goto('https://solventie.es'+URL+'?utm_source=newsletter&utm_medium=email&utm_campaign=regadio-2026&utm_content=secret%40example.invalid&utm_term=600000000#persona');
 const config=await page.evaluate(()=>Array.from(window.dataLayer).find(x=>x[0]==='config')[2]);
 expect(config).toMatchObject({campaign_source:'newsletter',campaign_medium:'email',campaign_name:'regadio-2026'});
 expect(config).not.toHaveProperty('campaign_content');expect(config).not.toHaveProperty('campaign_term');
 expect(JSON.stringify(await page.evaluate(()=>window.dataLayer))).not.toMatch(/secret|600000000|#persona/);
 await page.goto('https://solventie.es'+URL);
 const plain=await page.evaluate(()=>Array.from(window.dataLayer).find(x=>x[0]==='config')[2]);
 expect(Object.keys(plain).filter(k=>k.startsWith('campaign_'))).toHaveLength(0);
});
test('localhost jamás carga analytics ni contact',async({page})=>{const x=await setup(page);await open(page);await fill(page);await click(page);await expect(page.locator('#lead-success')).toBeVisible();expect(x.external).toHaveLength(0);expect(await page.evaluate(()=>window.dataLayer)).toBeUndefined();});
test('error backend no dispara contact; retry online conserva ID',async({page})=>{
 const x=await setup(page,{live:true});let fail=true;
 await page.route('**/api/forms?*',async route=>{if(!fail){await route.fallback();return;}fail=false;x.requests.push({body:new URLSearchParams(route.request().postData())});await route.fulfill({json:{result:'error',message:'Intercepted error'}});});
 await open(page,true);await fill(page);await click(page);await expect(page.locator('#form-feedback')).toBeVisible();expect(await page.evaluate(()=>window.dataLayer.filter(x=>x[1]==='contact').length)).toBe(0);
 await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.locator('#lead-success')).toBeVisible();expect(x.requests).toHaveLength(2);expect(x.requests[0].body.get('_submission_id')).toBe(x.requests[1].body.get('_submission_id'));expect(await page.evaluate(()=>window.dataLayer.filter(x=>x[1]==='contact').length)).toBe(1);
});
test('almacenamiento bloqueado impide POST sin copia durable',async({page})=>{
 const x=await setup(page);await open(page);await fill(page);await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('QuotaExceededError');};});await click(page);await expect(page.locator('#form-feedback')).toContainText('copia local');expect(x.requests).toHaveLength(0);
});

test('override de validación solo navegador, dry-run por defecto',async({page})=>{
 const x=await setup(page);const captured=await installValidationOverride(page);await open(page);await fill(page);await click(page);await expect(page.locator('#lead-success')).toBeVisible();expect(x.requests).toHaveLength(0);expect(captured).toHaveLength(1);expect(captured[0].forwarded).toBe(false);const body=new URLSearchParams(captured[0].body);expect(body.get('CC')).toBe('achucore@gmail.com');expect(body.get('Email')).toBe('achucore@gmail.com');expect(body.get('_subject')).toContain('PRUEBA');
});
test('honeypot no envía',async({page})=>{const x=await setup(page);await open(page);await fill(page);await page.locator('[name=_gotcha]').evaluate(e=>e.value='spam');await click(page);expect(x.requests).toHaveLength(0);});
