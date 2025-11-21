import { Button, Card, Input, Switch } from '@monorepo/components'
import { clsx } from 'clsx'
// oxlint-disable-next-line no-restricted-imports
import { DeleteIcon, PlusCircleIcon } from 'lucide-react'
import type { Rule } from './types'

export function RuleLine({ rule, onChange, onRemove }: { rule: Rule; onChange: (key: keyof Rule, value: string | boolean) => void; onRemove: () => void }) {
  const inputClasses = clsx('grow', rule.enabled ? 'border-primary/50' : 'bg-muted/50 opacity-75')
  return (
    <div className="flex items-center gap-4">
      <Switch checked={rule.enabled} name={`rule-${rule.id}`} onCheckedChange={checked => onChange('enabled', checked)} />
      <Input className={inputClasses} name={`rule-${rule.id}-pattern`} onChange={event => onChange('pattern', event.target.value)} placeholder="replace in" value={rule.pattern} />
      <Input className={inputClasses} name={`rule-${rule.id}-replacement`} onChange={event => onChange('replacement', event.target.value)} placeholder="replace out" value={rule.replacement} />
      <Button className={clsx('hover:text-red-500 -ml-2', rule.enabled ? 'text-primary' : 'text-muted-foreground/50')} name="delete" onClick={onRemove} size="icon" variant="ghost">
        <DeleteIcon className="size-5" />
      </Button>
    </div>
  )
}

export function Rules({ rules, setRules }: { rules: Rule[]; setRules: (rules: Rule[]) => void }) {
  function updateRule(id: string, key: keyof Rule, value: string | boolean) {
    /* v8 ignore next -- @preserve */
    setRules(rules.map(rule => (rule.id === id ? { ...rule, [key]: value } : rule)))
  }
  function addRule() {
    setRules([...rules, { enabled: false, id: `«r${rules.length}»`, pattern: '', replacement: '' }])
  }
  function removeRule(id: string) {
    setRules(rules.filter(rule => rule.id !== id))
  }
  return (
    <div>
      <div className="flex justify-center items-center gap-2 mb-2">
        <h2 className="text-primary mt-0 mb-1.5">rules</h2>
        <Button className="rounded-full " name="add" onClick={() => addRule()} size="icon" variant="ghost">
          <PlusCircleIcon className="size-7 text-primary" />
        </Button>
      </div>
      <Card className="flex flex-col gap-2 bg-white p-6">
        {rules.map(rule => (
          <RuleLine key={rule.id} onChange={(key, value) => updateRule(rule.id, key, value)} onRemove={() => removeRule(rule.id)} rule={rule} />
        ))}
      </Card>
    </div>
  )
}
