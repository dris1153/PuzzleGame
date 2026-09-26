export type Locale = 'en' | 'vi'

export interface SettingsV1 {
  version: 1
  locale: Locale
  sound: boolean
  ghostDefault: boolean
  /** Default for the Free Play rotation toggle. */
  rotationDefault: boolean
}

export function detectLocale(language: string): Locale {
  return language.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}

export function defaultSettings(language: string): SettingsV1 {
  return { version: 1, locale: detectLocale(language), sound: true, ghostDefault: true, rotationDefault: false }
}

export function isSettingsV1(v: unknown): v is SettingsV1 {
  if (typeof v !== 'object' || v === null) return false
  const s = v as Record<string, unknown>
  return (
    s.version === 1 &&
    (s.locale === 'en' || s.locale === 'vi') &&
    typeof s.sound === 'boolean' &&
    typeof s.ghostDefault === 'boolean' &&
    typeof s.rotationDefault === 'boolean'
  )
}
