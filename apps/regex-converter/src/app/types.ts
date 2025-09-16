export type Rule = {
  /** unique identifier */
  id: string
  /** true if the rule is active */
  enabled: boolean
  /** the regex pattern to match */
  pattern: string
  /** the replacement string */
  replacement: string
}
