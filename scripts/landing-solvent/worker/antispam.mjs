// Pure, synchronous ESM. No clock, network, storage, recipients or mutable state.
export const POLICY_VERSION = 'gas-b706fec-content-v1'
export const HARD_LIMITS = Object.freeze({ maxFields: 64, maxKeyBytes: 128, maxValueBytes: 4096, maxTotalBytes: 32768 })
export const SKIP_KEYS = Object.freeze([
  '_headers', '_subject', '_id', '_domain', '_sheetname', '_gotcha', '_token',
  '_submission_id', '_original_submission_id', '_confirmation', '_confirmation_email',
  '_language', 'CC', 'URL', 'Timestamp', 'IP', 'User Agent'
])
export const SPAM_PHRASES = Object.freeze([
  'viagra', 'cialis', 'casino', 'poker', 'lottery', 'winner', 'click here', 'buy now',
  'free money', 'seo service', 'web traffic', 'backlink'
])
const encoder = new TextEncoder()
const plain = value => value !== null && typeof value === 'object' &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value))
const dataEntries = object => {
  if (!plain(object)) return null
  const keys = Reflect.ownKeys(object)
  if (keys.some(key => typeof key !== 'string')) return null
  const descriptors = Object.getOwnPropertyDescriptors(object)
  if (keys.some(key => !('value' in descriptors[key]) || !descriptors[key].enumerable)) return null
  return keys.map(key => [key, descriptors[key].value])
}
const result = (classification, reasonCodes) => ({ policyVersion: POLICY_VERSION, classification, reasonCodes })

// Only server-owned config may be supplied. Origin/trust cannot be inferred here.
export function validateConfig (config) {
  const entries = dataEntries(config)
  if (!entries || entries.some(([key]) => !['policyVersion', 'expectedDomain', 'expectedFormId', 'limits'].includes(key))) return null
  if (config.policyVersion !== POLICY_VERSION) return null
  for (const key of ['expectedDomain', 'expectedFormId']) {
    if (!Object.hasOwn(config, key) || typeof config[key] !== 'string' || !config[key].trim() || config[key].length > 128) return null
  }
  const limits = { ...HARD_LIMITS }
  if (Object.hasOwn(config, 'limits')) {
    const overrides = dataEntries(config.limits)
    if (!overrides || overrides.some(([key, value]) => !Object.hasOwn(limits, key) ||
      !Number.isSafeInteger(value) || value < 1 || value > HARD_LIMITS[key])) return null
    Object.assign(limits, config.limits)
  }
  return limits
}

export function validateInput (params, limits = HARD_LIMITS) {
  // Call only with validated limits (classify handles this automatically).
  if (!plain(params)) return 'invalid_input_type'
  const keys = Reflect.ownKeys(params)
  if (keys.length > limits.maxFields) return 'too_many_fields'
  let total = 0
  for (const key of keys) {
    if (typeof key !== 'string') return 'invalid_field_key'
    // Reject absurd strings before allocating a UTF-8 copy.
    if (key.length > limits.maxKeyBytes) return 'field_key_too_large'
    const keyBytes = encoder.encode(key).length
    if (keyBytes > limits.maxKeyBytes) return 'field_key_too_large'
    const descriptor = Object.getOwnPropertyDescriptor(params, key)
    if (!descriptor.enumerable || !('value' in descriptor) || typeof descriptor.value !== 'string') return 'invalid_field_type'
    const value = descriptor.value
    if (value.length > limits.maxValueBytes) return 'field_value_too_large'
    const valueBytes = encoder.encode(value).length
    if (valueBytes > limits.maxValueBytes) return 'field_value_too_large'
    total += keyBytes + valueBytes
    if (total > limits.maxTotalBytes) return 'input_too_large'
  }
  return null
}

function matchesPhrase (text, phrase) {
  // Exact GAS ASCII boundary semantics; phrases are a fixed server-owned list.
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i').test(text)
}

function validGasEmail (email) {
  // Linear equivalent to GAS /^[^\s@]+@[^\s@]+\.[^\s@]+$/ for string inputs.
  // No RFC validation, trimming, normalization or new policy.
  if (/\s/.test(email)) return false
  const at = email.indexOf('@')
  if (at < 1 || at !== email.lastIndexOf('@')) return false
  const domain = email.slice(at + 1)
  const dot = domain.indexOf('.', 1)
  return dot > 0 && dot < domain.length - 1
}

function contentReasons (params) {
  const reasons = []
  if (params._gotcha) reasons.push('honeypot')
  const allValues = Object.keys(params).filter(key => !SKIP_KEYS.includes(key)).map(key => params[key] || '').join(' ')
  if (allValues.trim()) {
    if ((allValues.match(/https?:\/\//gi) || []).length > 2) reasons.push('too_many_urls')
    if (/[\u0400-\u04FF\u4E00-\u9FFF]/.test(allValues)) reasons.push('unexpected_script')
    const lower = allValues.toLowerCase()
    const matched = SPAM_PHRASES.filter(word => matchesPhrase(lower, word))
    if (matched.length) reasons.push(`spam_words:${matched.join('|')}`)
  }
  const email = ['Email', 'email', 'Mail', 'mail'].map(key => params[key]).find(value => value && value.includes('@'))
  if (email && email.toLowerCase().endsWith('@sigismail.com')) reasons.push('blocked_email_domain')
  if (email && !validGasEmail(email)) reasons.push('invalid_email')
  return reasons
}

export function classify (params, trustedConfig) {
  const limits = validateConfig(trustedConfig)
  if (!limits) return result('invalid', ['invalid_trusted_config'])
  const invalid = validateInput(params, limits)
  if (invalid) return result('invalid', [invalid])
  const missing = []
  if (!params._domain) missing.push('missing_domain')
  if (!params._id) missing.push('missing_form_id')
  if (missing.length) return result('invalid', missing)
  if (params._domain !== trustedConfig.expectedDomain || params._id !== trustedConfig.expectedFormId) return result('invalid', ['route_mismatch'])
  const reasons = contentReasons(params)
  // accepted is a candidate classification only, never a durable receipt or email permission.
  return result(reasons.length ? 'review' : 'accepted', reasons)
}
