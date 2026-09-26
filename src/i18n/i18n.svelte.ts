import { settings } from '../stores/settings-store.svelte'
import { interpolate, type MessageParams } from './interpolate'
import { en, type MessageKey } from './locales/en'
import { vi } from './locales/vi'

const messages = { en, vi }

/** Reactive: templates calling `t()` re-render when the locale setting changes. */
export function t(key: MessageKey, params?: MessageParams): string {
  return interpolate(messages[settings.current.locale][key], params)
}
