/* c8 ignore start */
import { Button, Card, Input, Switch } from '@monorepo/components'
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
        <h2 className="text-info mt-0 mb-1.5">rules</h2>
        <Button className="rounded-full " onClick={addRule} size="icon" variant="ghost">
          <PlusCircleIcon className="size-7 text-primary" />
        </Button>
      </div>
      <Card className="flex flex-col gap-2 bg-white p-6">
        {rules.map((rule, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fix me later ^^'
          <div className="flex items-center gap-4" key={index}>
            <Switch checked={rule.enabled} onCheckedChange={checked => updateRule(index, 'enabled', checked)} />
            <Input className="grow border rounded px-2" onChange={event => updateRule(index, 'pattern', event.target.value)} placeholder="replace in" value={rule.pattern} />
            <Input className="grow border rounded px-2" onChange={event => updateRule(index, 'replacement', event.target.value)} placeholder="replace out" value={rule.replacement} />
            <Button className="text-primary hover:text-red-500" onClick={() => removeRule(index)} size="icon" variant="ghost">
              <DeleteIcon className="size-5" />
            </Button>
          </div>
        ))}
      </Card>
    </div>
  )
}
