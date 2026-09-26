import { expect, it } from 'vitest'
import { defaultSettings, detectLocale, isSettingsV1 } from './settings-schema'

it('picks Vietnamese for vi* browser languages in any case, English otherwise', () => {
  expect(detectLocale('vi')).toBe('vi')
  expect(detectLocale('vi-VN')).toBe('vi')
  expect(detectLocale('VI')).toBe('vi')
  expect(detectLocale('en-US')).toBe('en')
  expect(detectLocale('fr')).toBe('en')
  expect(detectLocale('')).toBe('en')
})

it('validates stored settings', () => {
  const valid = defaultSettings('vi-VN')
  expect(valid).toEqual({ version: 1, locale: 'vi', sound: true, ghostDefault: true, rotationDefault: false })
  expect(isSettingsV1(valid)).toBe(true)
  expect(isSettingsV1({ ...valid, version: 2 })).toBe(false)
  expect(isSettingsV1({ ...valid, locale: 'de' })).toBe(false)
  expect(isSettingsV1({ ...valid, sound: 'yes' })).toBe(false)
  expect(isSettingsV1({ ...valid, rotationDefault: 0 })).toBe(false)
  expect(isSettingsV1({ version: 1, locale: 'en' })).toBe(false)
  expect(isSettingsV1(null)).toBe(false)
})
