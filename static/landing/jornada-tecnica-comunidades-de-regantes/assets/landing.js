/* Vanilla runtime. No lead/analytics request is made by the build. */
(() => {
  'use strict';
  const ACTION = 'https://script.google.com/macros/s/AKfycbzEd6cjH5eTjzVxDVk6x-3Q9QwUHDMWpR8V1Ij1g6IG7MYwpPM_epAGpxJUR1__ljrWMQ/exec';
  const ID = 'form-jornada-tecnica-comunidades-de-regantes';
  const PREFIX = 'sansoul.form.pending.';
  const RECEIPT = 'solvent.acatcor.receipt';
  const GA = 'G-XT4VMEX7YT';
  const CANONICAL = 'https://solventie.es/landing/jornada-tecnica-comunidades-de-regantes/';
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k,v) { localStorage.setItem(k,v); }, remove(k) { try { localStorage.removeItem(k); } catch {} } };
  const production = location.protocol === 'https:' && /^(www\.)?solventie\.es$/.test(location.hostname);
  let lang = new URLSearchParams(location.search).get('lang') || store.get('lang') || 'es';
  if (!['es','ca'].includes(lang)) lang = 'es';
  let busy = false;
  let loaded = false;
  const words = {
    es: {nombre:'Indica tu nombre y apellidos',empresa:'Indica tu comunidad o empresa',telefono:'Introduce un teléfono válido',email:'Introduce un email válido',consentimiento:'Debes aceptar la política de privacidad',error:'No se pudo enviar. Inténtalo de nuevo.',storage:'No se pudo proteger una copia local del envío. Libera espacio del navegador y vuelve a intentarlo.',sending:'Enviando…',thanks:'¡Gracias por tu interés!',thanksSub:'Hemos recibido tus datos y pronto nos pondremos en contacto contigo.'},
    ca: {nombre:'Indica el teu nom i cognoms',empresa:'Indica la teva comunitat o empresa',telefono:'Introdueix un telèfon vàlid',email:'Introdueix un correu vàlid',consentimiento:"Has d'acceptar la política de privacitat",error:"No s'ha pogut enviar. Torna-ho a provar.",storage:"No s'ha pogut protegir una còpia local. Allibera espai al navegador i torna-ho a provar.",sending:'Enviant…',thanks:'Gràcies pel teu interès!',thanksSub:'Hem rebut les teves dades i aviat ens posarem en contacte amb tu.'}
  };
  const t=()=>words[lang];
  const form=()=>document.getElementById(ID);
  function analytics() {
    if (!production || loaded) return;
    loaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('set',{page_location:CANONICAL,page_referrer:''});
    // Keep campaign identifiers, never the raw URL, referrer or form values.
    const campaign={},params=new URLSearchParams(location.search);
    for(const [utm,key] of Object.entries({utm_source:'campaign_source',utm_medium:'campaign_medium',utm_campaign:'campaign_name',utm_term:'campaign_term',utm_content:'campaign_content'})) {
      const value=params.get(utm)||'';
      // Restrict to campaign slugs: no email, URL, free text or phone numbers.
      if(/^[a-z][a-z0-9_-]{0,99}$/i.test(value) && !/\d{7}/.test(value))campaign[key]=value;
    }
    window.gtag('config',GA,{page_location:CANONICAL,page_referrer:'',page_title:'Solvent · Jornada Técnica ACATCOR',...campaign,allow_google_signals:false,allow_ad_personalization_signals:false});
    if (!document.querySelector('script[data-solvent-ga]')) {
      const s=document.createElement('script');s.async=true;s.dataset.solventGa='';s.src='https://www.googletagmanager.com/gtag/js?id='+GA;document.head.append(s);
    }
  }
  function track(data) {
    if ((!data.status || data.status==='accepted') && production) {
      analytics();
      if (typeof window.gtag==='function') window.gtag('event','contact',{id:'contacto',type:'form',label:ID,page_location:CANONICAL,page_referrer:''});
    }
  }
  function feedback(message) {
    const p=document.getElementById('form-feedback');
    if (p) {p.hidden=false;p.textContent=message;p.className='rounded-md bg-destructive/10 p-3 text-sm text-destructive';}
  }
  function showThanks() {
    const f=form();if(!f)return;
    const box=document.createElement('div');box.id='lead-success';box.role='status';box.className='rounded-xl bg-card p-8 text-center text-card-foreground shadow-xl';
    box.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto h-14 w-14 text-primary"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg><p class="mt-4 text-xl font-bold"></p><p class="mt-2 text-muted-foreground"></p>';
    box.children[1].textContent=t().thanks;box.children[2].textContent=t().thanksSub;f.replaceWith(box);
  }
  function render(l) {
    const old=form(); const values=old?new FormData(old):null;
    lang=l;document.documentElement.lang=l;
    document.getElementById('app').innerHTML=document.getElementById('lang-'+l).innerHTML;
    if(values) for(const el of form().elements) {
      if(!el.name)continue;
      if(el.type==='checkbox')el.checked=values.getAll(el.name).includes(el.value);
      else el.value=values.get(el.name)||'';
    }

    if(store.get(RECEIPT))showThanks();
    if(form()) form().addEventListener('submit',submit);
    document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{if(busy)return;try{store.set('lang',b.dataset.lang);}catch{}render(b.dataset.lang);}));
  }
  function pending() {
    const result=[];
    try { for(let i=0;i<localStorage.length;i++) {const k=localStorage.key(i);if(!k.startsWith(PREFIX))continue;try{const x=JSON.parse(store.get(k));const body=new URLSearchParams(x.body);if(x.action===ACTION && x.submissionId && body.get('_id')===ID && body.get('_submission_id')===x.submissionId)result.push(x);}catch{}} }catch{}
    return result;
  }
  function persisted(data,id) {
    if(!data || data.result!=='success')return false;
    if(typeof data.persisted==='undefined' && typeof data.submissionId==='undefined')return true;
    return data.persisted===true && Boolean(data.submissionId) && (data.submissionId===id || data.status==='review');
  }
  async function send(item) {
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
    try {
      const response=await fetch(item.action,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:item.body,signal:controller.signal});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();if(!persisted(data,item.submissionId))throw new Error('Missing durable receipt');
      // A durable receipt contains no contact information. It prevents repeated clicks/reloads.
      store.set(RECEIPT,JSON.stringify({submissionId:item.submissionId,status:data.status||'accepted',at:new Date().toISOString()}));
      store.remove(PREFIX+item.submissionId);track(data);showThanks();
      return true;
    } finally {clearTimeout(timer);}
  }
  async function guarded(work) {
    if(busy)return;busy=true;
    const button=form()?.querySelector('button[type=submit]');if(button){button.disabled=true;button.textContent=t().sending;}
    try {
      if(navigator.locks) await navigator.locks.request('solvent-acatcor-submit',work); else await work();
    } catch {feedback(t().error);} finally {busy=false;if(button){button.disabled=false;button.textContent='Enviar';}}
  }
  async function retry() {
    if(!pending().length)return;
    await guarded(async()=>{for(const item of pending()){await send(item);}});
  }
  async function submit(event) {
    event.preventDefault();if(busy || store.get(RECEIPT))return;
    const f=form(),fd=new FormData(f);f.querySelectorAll('.field-error').forEach(e=>e.remove());
    let invalid=false;
    for(const key of ['nombre','empresa','telefono','email','consentimiento']) {
      const value=String(fd.get(key)||'').trim();
      const valid=key==='consentimiento'?!!fd.get(key):key==='telefono'?/^\+?[0-9\s().-]{9,20}$/.test(value):key==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value):value.length>=2;
      const input=f.elements[key];input.setAttribute('aria-invalid',String(!valid));
      if(!valid){invalid=true;const p=document.createElement('p');p.className='field-error';p.textContent=t()[key];p.id='error-'+key;input.setAttribute('aria-describedby',p.id);input.closest('div').append(p);}
      else input.removeAttribute('aria-describedby');
    }
    if(invalid){f.querySelector('[aria-invalid=true]').focus();return;}
    if(fd.get('_gotcha'))return;
    await guarded(async()=>{
      if(store.get(RECEIPT)){showThanks();return;}
      const queued=pending()[0];if(queued){await send(queued);return;}
      const id=crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2);
      const payload=new URLSearchParams();
      const publicNames={nombre:'Nombre',empresa:'Empresa',telefono:'Teléfono',email:'Email',consentimiento:'Consentimiento'};
      for(const [k,v] of fd) if(k!=='intereses')payload.set(publicNames[k]||k,String(v).trim());
      payload.set('Intereses',fd.getAll('intereses').join(', '));payload.set('Idioma',lang);payload.set('Campaña','ACATCOR');
      payload.set('CC',atob('Zm9ybXVsYXJpb3Mtd2ViQHNvbHZlbnRpZS5lcw=='));
      payload.set('_domain','solventie.es');payload.set('_id',ID);payload.set('_subject','Jornada Técnica ACATCOR — Comunidades de regantes');
      payload.set('URL',location.href.split('#')[0]+'#'+ID);
      payload.set('Timestamp',new Date().toLocaleString('sv-SE',{timeZone:'Europe/Madrid',hour12:false}));
      payload.set('_submission_id',id);payload.set('User Agent',navigator.userAgent);payload.set('IP','');
      for(const k of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'])payload.set(k,(new URLSearchParams(location.search).get(k)||'').slice(0,200));
      payload.set('_headers',JSON.stringify(['Timestamp','CC','URL',...[...payload.keys()].filter(k=>!k.startsWith('_') && !['Timestamp','CC','URL'].includes(k))].map(name=>({name}))));
      const item={submissionId:id,action:ACTION,body:payload.toString(),createdAt:new Date().toISOString()};
      try {store.set(PREFIX+id,JSON.stringify(item));}catch{feedback(t().storage);return;}
      // IP is best effort, as in SanSoul; the protected copy precedes the request.
      try {const response=await fetch('https://api64.ipify.org?format=json',{signal:AbortSignal.timeout(200),referrerPolicy:'no-referrer'});if(response.ok){payload.set('IP',(await response.json()).ip||'');item.body=payload.toString();store.set(PREFIX+id,JSON.stringify(item));}}catch{}
      await send(item);
    });
  }
  render(lang);
  window.addEventListener('storage',()=>{analytics();if(store.get(RECEIPT))showThanks();});
  window.addEventListener('online',retry);analytics();retry();
})();
