import type { Rule } from './types'

export function applyRules(text: string, rules: Rule[]) {
  let result = text
  for (const rule of rules) {
    if (!rule.enabled) continue
    try {
      result = result.replace(new RegExp(rule.pattern, 'g'), rule.replacement)
    } catch {
      // ignore invalid regex
    }
  }
  return result
}
