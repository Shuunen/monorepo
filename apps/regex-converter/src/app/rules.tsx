/* c8 ignore start */
import { Button } from '@monorepo/components'
import { DeleteIcon, PlusCircleIcon } from 'lucide-react'

export function Rules({ rules, setRules }: { rules: { enabled: boolean; pattern: string; replacement: string }[]; setRules: (rules: { enabled: boolean; pattern: string; replacement: string }[]) => void }) {
  function updateRule(index: number, key: string, value: unknown) {
    setRules(rules.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, [key]: value } : rule)))
  }
  function addRule() {
    setRules([...rules, { enabled: false, pattern: '', replacement: '' }])
  }
  function removeRule(index: number) {
    // oxlint-disable-next-line id-length
    setRules(rules.filter((_, ruleIndex) => ruleIndex !== index))
  }
  return (
    <div>
      <div className="flex justify-center items-center gap-2 mb-2">
        <h2 className="text-green-800 mt-0 mb-1.5">rules</h2>
        <Button className="rounded-full " onClick={addRule} size="icon" variant="ghost">
          <PlusCircleIcon className="size-7 text-green-600" />
        </Button>
      </div>
      <div className="flex flex-col gap-2 bg-white p-8">
        {rules.map((rule, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fix me later ^^'
          <div className="flex gap-2" key={index}>
            <input checked={rule.enabled} onChange={event => updateRule(index, 'enabled', event.target.checked)} type="checkbox" />
            <input className="grow border rounded px-2" onChange={event => updateRule(index, 'pattern', event.target.value)} placeholder="replace in" value={rule.pattern} />
            <input className="grow border rounded px-2" onChange={event => updateRule(index, 'replacement', event.target.value)} placeholder="replace out" value={rule.replacement} />
            <Button onClick={() => removeRule(index)} size="icon" variant="ghost">
              <DeleteIcon className="size-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
