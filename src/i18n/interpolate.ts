export type MessageParams = Record<string, string | number>

/** Replaces `{name}` placeholders; unknown placeholders are left as-is so gaps are visible. */
export function interpolate(template: string, params: MessageParams = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(params, name) ? String(params[name]) : match,
  )
}
