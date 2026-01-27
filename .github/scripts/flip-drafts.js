'use strict'

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const { DateTime } = require('luxon')

const MADRID_TZ = 'Europe/Madrid'

// Ajusta esto a la estructura real de tu Hugo:
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

function parsePublishDate (data) {
  const raw = data.publishDate || data.date
  if (!raw) return null

  if (raw instanceof Date) {
    return DateTime.fromJSDate(raw, { zone: MADRID_TZ })
  }

  if (typeof raw === 'string') {
    // Si trae offset/Z, Luxon lo respeta. Si no, lo interpreta en Madrid.
    const dt = DateTime.fromISO(raw, { setZone: true })
    if (dt.isValid && (raw.includes('Z') || raw.includes('+') || raw.includes('-'))) return dt
    const dtMadrid = DateTime.fromISO(raw, { zone: MADRID_TZ })
    return dtMadrid.isValid ? dtMadrid : null
  }

  return null
}

function flipDraftFlagPreservingStyle (rawContent) {
  // Detecta YAML o TOML por delimitadores
  if (rawContent.startsWith('---')) {
    // YAML front matter
    return rawContent.replace(
      /^draft:\s*(true|"true"|'true')\s*$/m,
      'draft: false'
    )
  }
  if (rawContent.startsWith('+++')) {
    // TOML front matter
    return rawContent.replace(
      /^draft\s*=\s*true\s*$/m,
      'draft = false'
    )
  }
  return rawContent
}

function main () {
  const nowMadrid = DateTime.now().setZone(MADRID_TZ)

  const files = walk(CONTENT_DIR)
  let changed = 0

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8')

    // Sólo consideramos archivos con front matter reconocible
    if (!raw.startsWith('---') && !raw.startsWith('+++')) continue

    let parsed
    try {
      parsed = matter(raw)
    } catch (_) {
      continue
    }

    const data = parsed.data || {}
    const isDraft = data.draft === true || data.draft === 'true'
    if (!isDraft) continue

    const publishAt = parsePublishDate(data)
    if (!publishAt) continue

    if (publishAt <= nowMadrid) {
      const nextRaw = flipDraftFlagPreservingStyle(raw)
      if (nextRaw !== raw) {
        fs.writeFileSync(file, nextRaw, 'utf8')
        changed++
        console.log(`Published: ${path.relative(process.cwd(), file)} (publishAt=${publishAt.toISO()})`)
      }
    }
  }

  console.log(`Done. Files changed: ${changed}`)
}

main()
