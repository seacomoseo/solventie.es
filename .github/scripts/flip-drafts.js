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

/**
 * Extrae datos básicos del front matter YAML sin librerías.
 */
function parseFrontMatter (content) {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/)
  if (!match) return null
  const data = {}
  const kvRegex = /^\s*([\w-]+)\s*:\s*(.+)$/gm
  let m
  while ((m = kvRegex.exec(match[1])) !== null) {
    let value = m[2].trim()
    value = value.replace(/^['"]|['"]$/g, '') // Quitar comillas
    data[m[1]] = value
  }
  return data
}

/**
 * Compara fechas usando strings en formato ISO local de Madrid.
 */
function shouldPublish (publishDate, nowMadridStr) {
  if (!publishDate) return false
  
  // Si la fecha del post tiene zona horaria (Z o +-), la convertimos a hora de Madrid
  if (/[Z+-]\d{2}/.test(publishDate)) {
    try {
      const d = new Date(publishDate)
      const formatted = d.toLocaleString('sv-SE', { timeZone: MADRID_TZ })
      return nowMadridStr >= formatted
    } catch (e) {
      return false
    }
  }

  // Si no tiene zona, asumimos que ya es hora de Madrid (comportamiento tipo Hugo)
  const normalized = publishDate.replace('T', ' ').substring(0, 19)
  return nowMadridStr >= normalized
}

function flipDraftFlag (rawContent) {
  // Cambia draft: true/y/yes a draft: n (preservando el formato YAML)
  return rawContent.replace(/^draft:\s*(true|y|yes|"true"|'true'|"y"|'y'|"yes"|'yes')\s*$/mi, 'draft: n')
}

function main () {
  const nowMadrid = new Date().toLocaleString('sv-SE', { timeZone: MADRID_TZ })
  console.log(`Current time in Madrid: ${nowMadrid}`)

  const files = walk(CONTENT_DIR)
  let changed = 0

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8')
    const data = parseFrontMatter(raw)
    if (!data) continue

    const val = String(data.draft || '').toLowerCase()
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
