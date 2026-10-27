// Temporary opt-in site adapter; shared theme and legacy handlers remain intact.
// No credentials and no personal form data in storage, logs or analytics.
export function installSansoulForms ({ routes, formValid, changeValues, copy }) {
  const pending = new WeakMap()
  const value = (form, name) => form.elements.namedItem(name)?.value || ''
  const show = (form, message, kind) => {
    form.querySelectorAll('.form__error, .form__submit').forEach(node => node.remove())
    const box = document.createElement('div')
    box.className = 'form__submit' + (kind ? ' form__submit--' + kind : '')
    box.setAttribute('role', kind === 'error' ? 'alert' : 'status')
    box.setAttribute('aria-live', 'polite')
    box.textContent = message
    form.append(box)
    return box
  }
  document.addEventListener('submit', async event => {
    const form = event.target
    if (!(form instanceof HTMLFormElement) || !form.matches('.form')) return
    const route = routes[value(form, '_domain') + ':' + value(form, '_id')]
    if (!route) return
    event.preventDefault()
    event.stopImmediatePropagation()
    if (form.dataset.sending === 'true') return
    const { valid, message } = formValid(form)
    if (!valid) {
      const box = show(form, '', 'error'); box.append(message); return
    }
    const buttons = [...form.querySelectorAll('button[type="submit"],input[type="submit"]')]
    form.dataset.sending = 'true'
    const previousDisabled = buttons.map(button => button.disabled)
    buttons.forEach(button => { button.disabled = true })
    const previous = pending.get(form)
    const now = previous?.now || new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid', hour12: false })
    let changed = false
    let timer
    try {
      show(form, copy.formSubmitSending + '…', '')
      changeValues({ form, now, prev: true }); changed = true
      const timestamp = form.querySelector('.form-timestamp')
      if (timestamp) timestamp.value = now
      const original = new FormData(form)
      changeValues({ form, now, prev: false }); changed = false
      const body = new FormData()
      const declared = JSON.parse(String(original.get('_headers') || '[]'))
      const fileFields = new Set(declared.filter(h => h.type === 'file').map(h => h.name))
      for (const [key, raw] of original) {
        if (key === '_submission_id') continue
        if (fileFields.has(key) && typeof raw === 'string' && raw.startsWith('data:')) {
          const match = raw.match(/^data:([^;,]+);base64,([a-zA-Z0-9+/=\r\n]+)\|([\s\S]*)$/)
          if (!match) throw Error('invalid_file')
          const bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0))
          body.append(key, new Blob([bytes], { type: match[1] }), match[3] || 'attachment')
        } else if (typeof raw !== 'string' && !raw.size) {
          // The preview holds the actual file; ignore its empty original input.
        } else body.append(key, raw)
      }
      const fingerprintFields = []
      let total = 0
      for (const [key, item] of body) {
        if (['Timestamp', 'IP', 'User Agent', '_token', '_headers', '_subject', 'CC'].includes(key)) continue
        if (typeof item === 'string') fingerprintFields.push([key, item])
        else {
          total += item.size
          const digest = await crypto.subtle.digest('SHA-256', await item.arrayBuffer())
          fingerprintFields.push([key, item.type, item.name, [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')])
        }
      }
      if (total > 8 * 1024 * 1024) throw Error('file_limit')
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(fingerprintFields)))
      const fingerprint = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
      const id = previous?.fingerprint === fingerprint ? previous.id : crypto.randomUUID()
      pending.set(form, { id, fingerprint, now })
      body.set('_submission_id', id)
      const controller = new AbortController()
      timer = setTimeout(() => controller.abort(), 45000)
      const response = await fetch('/api/forms?route=' + encodeURIComponent(route), { method: 'POST', body, signal: controller.signal, credentials: 'omit' })
      if (!response.ok) throw Error('response_not_confirmed')
      const receipt = await response.json()
      if (receipt.result !== 'success' || receipt.persisted !== true || receipt.submissionId !== id || !['accepted', 'review'].includes(receipt.status)) throw Error('receipt_not_confirmed')
      show(form, copy.formSubmitOk, 'success')
      pending.delete(form)
      form.reset()
      form.querySelectorAll('.form__preview').forEach(node => { node.replaceChildren() })
      form.querySelectorAll('input, select, textarea').forEach(input => input.dispatchEvent(new Event('change', { bubbles: true })))
      if (receipt.status === 'accepted') {
        document.dispatchEvent(new CustomEvent('submited-' + form.id))
        if (typeof window.gtag === 'function') window.gtag('event', 'contact', { id: form.parentElement.closest('[id]')?.id || form.id, type: 'form', label: form.id })
        if (form.dataset.to) location.href = atob(form.dataset.to)
      }
    } catch (_) {
      show(form, copy.formSubmitWrong, 'error')
    } finally {
      clearTimeout(timer)
      if (changed) { try { changeValues({ form, now, prev: false }) } catch (_) {} }
      buttons.forEach((button, i) => { button.disabled = previousDisabled[i] })
      form.dataset.sending = 'false'
    }
  }, true)
}
