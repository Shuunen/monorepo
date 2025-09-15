/* c8 ignore start */
import { useState } from 'react'
import { sampleInput } from './constants'
import { Rules } from './rules'

export function applyRules(text: string, rules: { enabled: boolean; pattern: string; replacement: string }[]) {
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
  const [rules, setRules] = useState([
    { enabled: true, pattern: '\\.', replacement: '🐱' },
    { enabled: true, pattern: 'right', replacement: '' },
    { enabled: false, pattern: '([A-Z])', replacement: '-$1' },
  ])
  const output = applyRules(input, rules)

  return (
    <div className="flex flex-col">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="mb-2 text-blue-700">input</h2>
          <textarea className="w-full h-80 p-3 border rounded bg-white shadow" onChange={event => setInput(event.target.value)} placeholder="Paste your text here..." value={input} />
        </div>
        <div>
          <h2 className="mb-2 text-purple-700">output</h2>
          <textarea className="w-full h-80 p-3 border rounded bg-white shadow" readOnly value={output} />
        </div>
      </div>
      <div className="col-span-2 mt-8">
        <Rules rules={rules} setRules={setRules} />
      </div>
    </div>
  )
}
