// SUSCRIPTION
const popup = document.getElementById('suscripcion')
if (popup) {
  // Popup when scroll a little from the top of the page
  // eslint-disable-next-line
  scrollShot({
    rootMargin: '20% 0% -120%',
    query: 'body',
    doStart: e => {
      // If the form has never been submitted
      if (!localStorage.submited_form_inicio_suscripcion) {
        const now = new Date().getTime()
        const oneWeek = 7 * 24 * 60 * 60 * 1000
        const moreThatOneWeek = now - new Date(localStorage.suscriptionDateClose || 0).getTime() >= oneWeek
        // If more than a week has passed since the last opening
        if (moreThatOneWeek) {
          localStorage.suscriptionDateClose = new Date().toISOString()
          location.hash = 'suscripcion'
        }
      }
    }
  })
  // When popup form is submit
  document.addEventListener('submited_form_inicio_suscripcion', e => {
    // Download the pdf
    let link = document.createElement('a')
    link.href = '/media/informe-precios-futuros-energia-industria.pdf'
    link.download = 'informe-precios-futuros-energia-industria.pdf'
    link.click()
    // Write message
    let messageSubmited = document.querySelector('.contact__form-submit--ok')
    messageSubmited.innerHTML = messageSubmited.innerHTML.replace('Formulario recibido. ¡Gracias!', 'PDF descargando y formulario recibido. ¡Gracias!')
    // Add cookie
    {{ if not (partial "functions/lang-param" (dict "parent" "config" "param" "cookies_legal")) }}
      const id = e.type
      localStorage[id] = localStorage[id] || 0
      localStorage[id]++
    {{ end }}
  })
}
