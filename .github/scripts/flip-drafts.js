import fs from 'node:fs'
import path from 'node:path'

const MADRID_TZ = 'Europe/Madrid'
const CONTENT_DIR = path.join(process.cwd(), 'content')

function walk (dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) out.push(full)
  }
  return out
}

function parseFrontMatter (content) {
  // Ahora más robusto con el inicio del archivo
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/)
  if (!match) return null
  const data = {}
  const kvRegex = /^\s*([\w-]+)\s*:\s*(.+)$/gm
  let m
  while ((m = kvRegex.exec(match[1])) !== null) {
    let value = m[2].trim()
    value = value.replace(/^['"]|['"]$/g, '')
    data[m[1]] = value
  }
  return data
}

function getMadridTime() {
  // Obtenemos la fecha actual en Madrid de forma robusta
  const now = new Date()
  const s = now.toLocaleString('sv-SE', { timeZone: MADRID_TZ })
  return s.replace('T', ' ').substring(0, 19)
}

function shouldPublish (publishDate, nowMadrid) {
  if (!publishDate) return false
  
  // Normalizamos la fecha del post (quitando T y zonas horarias para comparar strings)
  const postDate = publishDate.replace('T', ' ').substring(0, 19)
  
  // SOLUCIÓN PROBLEMA 1: Comparación simple de strings YYYY-MM-DD HH:MM:SS
  const isTimeArrived = nowMadrid >= postDate
  
  // SOLUCIÓN PROBLEMA 2: Seguridad para borradores antiguos.
  // Solo publicamos si la fecha del post es de "hoy" o posterior (ventana de 24h de seguridad)
  const yesterday = new Date(new Date(nowMadrid.replace(' ', 'T')).getTime() - 24 * 60 * 60 * 1000)
    .toISOString().replace('T', ' ').substring(0, 10)
  
  const isRecentOrFuture = postDate.substring(0, 10) >= yesterday

  return isTimeArrived && isRecentOrFuture
}

function flipDraftFlag (rawContent) {
  // Cambia draft: true/y/yes a draft: n (solo en YAML)
  return rawContent.replace(/^draft:\s*(true|y|yes|"true"|'true'|"y"|'y'|"yes"|'yes')\s*$/mi, 'draft: n')
}

function main () {
  const nowMadrid = getMadridTime()
  console.log(`Current time (Madrid): ${nowMadrid}`)

  const files = walk(CONTENT_DIR)
  let changed = 0

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8')
    const data = parseFrontMatter(raw)
    if (!data || !data.draft) continue

    const val = String(data.draft).toLowerCase()
    const isDraft = val === 'true' || val === 'y' || val === 'yes'
    if (!isDraft) continue

    const dateStr = data.publishDate || data.date
    if (shouldPublish(dateStr, nowMadrid)) {
      const nextRaw = flipDraftFlag(raw)
      if (nextRaw !== raw) {
        fs.writeFileSync(file, nextRaw, 'utf8')
        changed++
        console.log(`Published: ${path.relative(process.cwd(), file)} (date=${dateStr})`)
      }
    }
  }

  console.log(`Done. Files changed: ${changed}`)
}

main()
