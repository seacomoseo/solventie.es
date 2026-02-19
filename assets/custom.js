// import { scrollShot } from './scroll-shot.js'

// // SUSCRIPTION
// const popup = document.getElementById('suscripcion')
// if (popup) {
//   // Popup when scroll a little from the top of the page
//   // eslint-disable-next-line
//   scrollShot({
//     rootMargin: '5% 0% -105%',
//     query: 'body',
//     doStart: e => {
//       // If the form has never been submitted
//       if (!window.localStorage['submited-form-suscripcion']) {
//         const now = new Date().getTime()
//         const oneWeek = 7 * 24 * 60 * 60 * 1000
//         const moreThatOneWeek = now - new Date(window.localStorage.suscriptionDateClose || 0).getTime() >= oneWeek
//         // If more than a week has passed since the last opening
//         if (moreThatOneWeek) {
//           window.localStorage.suscriptionDateClose = new Date().toISOString()
//           window.location.hash = 'suscripcion'
//         }
//       }
//     },
//     end: true
//   })
//   // When popup form is submit
//   document.addEventListener('submited-form-suscripcion', e => {
//     // Download the pdf
//     const link = document.createElement('a')
//     link.href = '/media/otros/informe-precios-futuros-energia-industria.pdf'
//     link.download = 'informe-precios-futuros-energia-industria.pdf'
//     link.click()
//     // Write message
//     const messageSubmited = document.querySelector('.form__submit--success')
//     messageSubmited.innerHTML = messageSubmited.innerHTML.replace('Formulario recibido. ¡Gracias!', 'PDF descargando y formulario recibido. ¡Gracias!')
//     // Add cookie
//     // if (site.Data.config['es'].cookies_legal) {
//     // {{ if not (partial "functions/lang-param" (dict "parent" "config" "param" "cookies_legal")) }}
//     //   const id = e.type
//     //   localStorage[id] = localStorage[id] || 0
//     //   localStorage[id]++
//     // {{ end }}
//   })
// }
