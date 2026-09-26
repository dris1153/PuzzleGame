import { createPersistedState } from '../lib/persisted-state.svelte'
import { defaultSettings, isSettingsV1, type SettingsV1 } from './settings-schema'

const store = createPersistedState('jigsaw.settings', isSettingsV1, () =>
  defaultSettings(typeof navigator === 'undefined' ? 'en' : navigator.language),
)

export const settings = {
  get current(): SettingsV1 {
    return store.current
  },

  set<K extends Exclude<keyof SettingsV1, 'version'>>(key: K, value: SettingsV1[K]): void {
    store.update((s) => ({ ...s, [key]: value }))
  },
}
