import { flatten } from '@monorepo/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../atoms/table'

type Props = {
  data: Record<string, unknown>
  rootPath?: string
}

export function FormSummary(props: Props) {
  const flatData = flatten(props.data, props.rootPath ?? 'data')
  const entries = Object.entries(flatData)
  return (
    <div className="border rounded-lg" data-testid="form-summary">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Key</TableHead>
            <TableHead className="w-1/2">Value</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableBody>
            {entries.map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="w-1/2 font-mono text-xs">{key}</TableCell>
                <TableCell className="w-1/2">{String(value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
