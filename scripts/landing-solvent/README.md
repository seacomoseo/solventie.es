# Landing estática ACATCOR

Artefacto: `static/landing/jornada-tecnica-comunidades-de-regantes/index.html`.
Ruta pública: https://solventie.es/landing/jornada-tecnica-comunidades-de-regantes/.
No requiere React, TanStack o Supabase en el navegador.

## Construcción y pruebas

Desde la raíz del repositorio:

```sh
npm ci --prefix scripts/landing-solvent
npm run build --prefix scripts/landing-solvent
# Solo si el navegador aún no está instalado:
scripts/landing-solvent/node_modules/.bin/playwright install chromium
npm test --prefix scripts/landing-solvent
# Vista local (no envía analítica a producción):
python3 -m http.server 4319 --bind 127.0.0.1 --directory static
```

URL: `http://127.0.0.1:4319/landing/jornada-tecnica-comunidades-de-regantes/`.
La suite comprobó esa ruta y sus assets con HTTP 200. Para la revisión por
Tailscale/SSH, el padre puede arrancar el comando anterior en puerto **4319**
y abrir un túnel `ssh -L 4319:127.0.0.1:4319 <host-tailscale>`; no hace falta
publicar, desplegar ni enlazar el servidor a una interfaz pública. El servidor
de la suite se detiene al terminar; no se deja un proceso de preview huérfano.
**El formulario de la vista local sí apunta al backend real.** Las pruebas
Playwright interceptan todos los leads y toda la red analítica; no introducir
ni enviar datos reales en una revisión visual manual.

Las dependencias están aisladas aquí, con versiones y lockfile propios. React,
esbuild y Lucide se usan **solo durante la generación** para conservar el JSX,
los iconos SVG y las clases aprobadas. El entregable contiene HTML, Tailwind
compilado, imágenes/fuentes locales y un único JS vanilla. No se modifican
`package.json` raíz, dependencias globales ni el tema. Hugo lo publica como
contenido estático; el build Hugo final corresponde al revisor padre.

`source/` conserva los componentes, diccionario y estilos del adjunto. `build.mjs`
los adapta en construcción; `content.json` es el diccionario ES/CA extraído para
auditar los textos. El año del pie se obtiene del reloj real en construcción,
igual que el componente original. Los archivos `.render*`, `.dictionary.mjs` y
`.input.css` son temporales ignorados. Para modificar comportamiento, editar
`landing.js` y reconstruir; no editar el JS compilado en `static/`.

## Diseño y procedencia

- Una sola ejecución del diseño aprobado; mismos textos ES/CA, jerarquía,
  colores, tamaños, espacios, hero, tarjetas, iconos Lucide y selector con
  banderas. `?lang=ca`/`?lang=es` y `localStorage.lang` conservan el idioma.
- Las cuatro fotos se copiaron sin alterar desde `uploads/servicios/`:
  instalaciones-solares-flotantes, autoconsumo-fotovoltaico, bombeo-solar y
  gestion-cae. Se sirven localmente, sin depender de imágenes remotas.
- El JSON Lovable apunta a un recurso interno `/__l5e/assets-v1/...` no incluido
  en el adjunto. En su lugar se utiliza el **logo original del proyecto**
  `uploads/base/logo.svg`, sin redibujarlo, con filtro CSS blanco en hero/pie.
  No se afirma identidad de píxeles con el PNG inaccesible.
- Open Sans 400/600/700/800 procede de Google Fonts/gstatic, la misma familia
  configurada en el original. Se sirve localmente; licencia OFL incluida en
  assets. No hay carga remota de fuentes.
- Enlaces reales verificados por HTTP GET: `/privacidad/` (200) y `/legal/`
  (200; `/aviso-legal/` redirige a `/legal/`).
- No se añade aviso de cookies, configuración ni controles de analítica al diseño.

## Captación y persistencia

Se leyó `themes/sansoul/assets/js/form-send.js`, `form-change-values.js` y
`layouts/partials/blocks/form.html`. El transporte actual usa `/api/forms/acatcor` → proxy nativo Netlify →
Worker dedicado `solvent-acatcor-intake.seacomoseo.workers.dev/v1/forms` →
service binding HMAC servidor → `sansoul-forms-connected` vigente. No pasa por GAS.
El receptor antiguo responde pero no se reutiliza: conserva la ruta de efectos
legacy sin fencing de propietario y el espejo Sheets, fuera del contrato connected.
El proxy compartido `/api/forms` permanece intacto salvo una regla con query exacta
de esta landing para pestañas antiguas. Se conserva
`Content-Type: application/x-www-form-urlencoded`, destino
`formularios-web@solventie.es` (CC decodificado en el POST), `_headers` con
Timestamp/CC/URL primero, `_domain`, `_id`, `_subject`, `_gotcha`,
`_submission_id`, User Agent, IP best effort y Timestamp `Europe/Madrid`.

Los nombres del POST son `Nombre`, `Empresa`, `Teléfono`, `Email`,
`Consentimiento`, en coherencia con `data/section/contacto-formulario.yml` y
`servicio-formulario.yml`; los identificadores HTML siguen estables. Esta
normalización evita depender de que el handler reconozca `email` en minúscula.
Campaña `ACATCOR`, idioma, intereses, URL completa y los cinco UTM van al
backend de captación; GA4 solo recibe los UTM de campaña filtrados descritos abajo.
No se habilita correo de confirmación al
visitante (`_confirmation`), como en el formulario original del adjunto.

La confirmación exige siempre `result === 'success'`, `persisted === true`,
`submissionId` exactamente coincidente y `status` accepted/review. No basta
HTTP200, un recibo legacy incompleto ni un ID distinto en review. Solo accepted
emite conversión; review muestra confirmación genérica sin conversión.
Los registros pendientes con las URLs anteriores GAS o `/api/forms?route=…`
se reconcilian por el mismo ID y cuerpo contra el nuevo proxy, sin reescribir
la copia local en caso de error. Connected reconoce sus tombstones históricos;
no se vuelven a enviar correos para los IDs ya comprometidos.

Antes de enviar se protege una copia en
`sansoul.form.pending.<submissionId>`, mismo esquema del tema:
`{submissionId, action, body, createdAt}`. Un error conserva exactamente ID y
cuerpo. Recarga, evento `online` o nuevo intento reenvían esa copia, no crean un
lead nuevo. Solo se reintentan los registros de esta landing y endpoint
conocido. El bloqueo de doble clic y Web Locks cuando está disponible evita
concurrencia entre pestañas. Sin almacenamiento no se envía: no se puede
prometer recuperación durable. El recibo final
`solvent.acatcor.receipt` no contiene PII y mantiene la pantalla de gracias
tras recargar; no vuelve a emitir el evento. La cola temporal sí contiene los
datos necesarios para recuperar el envío y se elimina tras recibo durable.

## GA4 y privacidad

Configuración del proyecto: `data/config.yml`, `G-XT4VMEX7YT`.
Auditoría **read-only comunicada por el padre**, no modificación de GA4:

- property `283941354`, stream `2761479957`;
- regla única: `event_name EQUALS contact` y `type EQUALS form`;
- crea `generate_lead`, con `sourceCopyParameters: true`;
- `generate_lead` es key event `ONCE_PER_EVENT`.

El cliente emite únicamente `contact` con
`{id:'contacto', type:'form', label:'form-jornada-tecnica-comunidades-de-regantes'}`
tras recibo durable y `status === 'accepted'`. Nunca en error, `review` o
`spam`; **no emite `generate_lead`** porque duplicaría la derivación del stream.

Por aprobación final de Loren, GA4 carga inmediatamente, como en el sitio,
sin banner, controles, gate de consentimiento ni llamadas propias a consent mode.
Las preferencias antiguas `controlcookie`/`controlcookieanalytics` no se leen
ni modifican para analítica, incluso si reflejan rechazo previo. La carga de
gtag y su configuración son únicas por documento. Solo se permite en HTTPS y
hosts exactos `solventie.es`/`www.solventie.es`; localhost, IPs y previews nunca
cargan ni envían GA.

GA recibe URL canónica **sin query/hash**, referrer vacío y título constante;
no recibe datos del formulario. No hay atribución fija que sobrescriba UTM:
`utm_source/medium/campaign/term/content` se trasladan a los campos de campaña
GA4 únicamente si son identificadores de 1–100 caracteres, empiezan por letra
y contienen solo letras ASCII, números, guion o guion bajo, sin secuencias de
siete dígitos. Correos, URLs, texto libre y teléfonos quedan fuera. Los enlaces
de campaña deben usar identificadores no personales: este filtro no puede
reconocer un nombre personal disfrazado de slug. Sin UTM no se fijan campos de
campaña. El destino HTML del formulario también es una
URL canónica sin query. Los tests simulan el host de producción pero satisfacen
localmente **todas** sus peticiones; el script real GA no se ejecuta en tests.
La equivalencia de la regla remota se basa en la auditoría read-only del padre,
no en un evento real emitido desde esta implementación.

## Evidencia y validación real separada

- `evidence/results.json` y `evidence/test-run.log`: resultados ejecutados.
- `evidence/desktop-es.png`, `desktop-ca.png`, `mobile-es.png`, `mobile-ca.png`:
  capturas completas de la misma landing, no variantes de diseño.
- Casos: textos completos ES/CA, fotos, ancho móvil/escritorio, idioma durable,
  inválidos, falta de consentimiento del formulario, accepted/legacy,
  review/spam, doble clic, fallo y retry con mismo ID/cuerpo, ausencia de
  recibo durable, GA inmediato incluso con rechazo previo, ausencia de banner,
  carga única, UTM sin atribución fija, protección PII, localhost y
  honeypot. Se interceptan leads, ipify, GA y el resto de red externa.

El subagente no hizo POST real. **El padre completó una prueba autorizada** con
CC exclusivamente de validación, datos ficticios y asunto PRUEBA: HTTP 200,
`result: success`, `persisted: true`, `status: accepted`, UI gracias y recibo;
cero peticiones GA. Evidencia independiente:
`/home/achu/workspace/solvent-live-form-test.json` y `.png`.
El padre además comunicó recepción verificada por Gmail API. Esa prueba ocurrió
antes de normalizar los nombres públicos del payload; la normalización final
está cubierta por pruebas interceptadas y no se ha repetido el envío real.

`validation-override.mjs` es exclusivamente dry-run; rechaza `forward:true`.
Cambiar CC en un navegador NO cambia el destinatario del nuevo receptor.
Una prueba real requiere configuración temporal de confianza en el servidor,
ligada a un único ID y secreto, con destino exclusivamente `achucore@gmail.com`;
se retira tras verificar recibo/cola/correo. Nunca usar el destinatario comercial
para pruebas, ni asumir aislamiento a partir de un parámetro público.

## Operación del adaptador

Fuentes y contrato de despliegue: `worker/worker.mjs`, `worker/antispam.mjs`,
`worker/wrangler.toml`. Sin Functions/Edge Netlify, D1/colas nuevas ni claves de
proveedores. BRIDGE_KEY solo se instala como secreto servidor desde la custodia
protegida existente. Identidad, asunto y destinatario son fijos; campos repetidos,
selectores desconocidos y archivos se rechazan. El límite de admisión es aproximado,
40/minuto por POP, no un cupo global de correo. Origin es anti-CSRF, no autenticación.

Pruebas: `node --test scripts/landing-solvent/worker/worker.test.mjs`.
Para preservar evidencia previa: `SOLVENT_TEST_EVIDENCE=/ruta/externa npm test
--prefix scripts/landing-solvent`. El informe operativo verificable del corte
está en `/home/achu/workspace/sansoul-forms-migration/solvent-direct/REPORT.md`.
No se certifica cero errores, cold-start, carga arbitraria ni entrega al buzón
comercial; la canary autorizada usa solo el buzón operacional.
