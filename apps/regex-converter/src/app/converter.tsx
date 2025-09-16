import { Textarea } from '@monorepo/components'
import { useId, useState } from 'react'
import { sampleInput } from './constants'
import { Rules } from './rules'
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

export function Converter() {
  const [input, setInput] = useState(sampleInput)
  const [rules, setRules] = useState<Rule[]>([
    { enabled: true, id: useId(), pattern: '\\.', replacement: '🐱' },
    { enabled: true, id: useId(), pattern: 'right', replacement: '' },
    { enabled: false, id: useId(), pattern: '([A-Z])', replacement: '- $1' },
    { enabled: false, id: useId(), pattern: '', replacement: '' },
  ])
  const output = applyRules(input, rules)

  return (
    <div className="flex flex-col">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="mb-2 mt-2">input</h2>
          {/* c8 ignore next */}
          <Textarea className="w-full h-80 p-3 border rounded-xl bg-white shadow" onChange={event => setInput(event.target.value)} placeholder="Paste your text here..." value={input} />
        </div>
        <div>
          <h2 className="mb-2 mt-2 text-secondary">output</h2>
          <Textarea className="w-full h-80 p-3 border rounded-xl bg-white shadow" readOnly value={output} />
        </div>
      </div>
      <div className="col-span-2 mt-8">
        <Rules rules={rules} setRules={setRules} />
      </div>
    </div>
  )
}
