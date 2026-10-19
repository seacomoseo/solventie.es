/* Parent-only validation helper. Dry-run by default; never changes production assets.
 * Use a NEW disposable browser context, on localhost, and close it after validation.
 * forward:true explicitly authorizes the actual lead POST to the existing endpoint.
 */
export async function installValidationOverride(page,{forward=false}={}) {
  const captured=[];
  await page.route(/https:\/\/[^/]*(?:google-analytics\.com|googletagmanager\.com)\//,route=>route.abort());
  await page.route('https://script.google.com/macros/s/**/exec',async route=>{
    const request=route.request();
    if(request.method()!=='POST'){await route.abort();return;}
    const body=new URLSearchParams(request.postData());
    body.set('CC','achucore@gmail.com');
    body.set('_subject','PRUEBA VALIDACIÓN ACATCOR — NO ES UN LEAD');
    body.set('Nombre','PRUEBA Persona ficticia');body.set('Empresa','PRUEBA Comunidad ficticia');
    body.set('Email','achucore@gmail.com');body.set('Teléfono','600000000');
    for(const key of ['nombre','empresa','email','telefono'])body.delete(key);
    const encoded=body.toString();
    // Keep the idempotent browser queue safe if the real request needs a retry.
    await page.evaluate(({id,encoded})=>{
      const key='sansoul.form.pending.'+id;
      const existing=JSON.parse(localStorage.getItem(key)||'null');
      if(existing){existing.body=encoded;localStorage.setItem(key,JSON.stringify(existing));}
    },{id:body.get('_submission_id'),encoded});
    captured.push({url:request.url(),body:encoded,forwarded:forward});
    if(forward)await route.continue({postData:encoded});
    else await route.fulfill({json:{result:'success',persisted:true,submissionId:body.get('_submission_id'),status:'accepted'}});
  });
  return captured;
}
