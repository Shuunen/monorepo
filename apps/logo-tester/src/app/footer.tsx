import { IconOwl, Paragraph } from '@monorepo/components'

export function Footer() {
  return (
    <footer className="grid gap-6 text-sm font-light p-12 bg-linear-to-t from-stone-950 to-stone-900">
      <div className="flex gap-4 justify-center">
        <Paragraph>Licence : MIT</Paragraph>
        <div className="opacity-50">/</div>
        <Paragraph>Author : Shuunen</Paragraph>
        <div className="opacity-50">/</div>
        <a className="underline" href="https://github.com/Shuunen/monorepo/tree/master/apps/logo-tester" rel="noreferrer" target="_blank">
          Sources on GitHub
        </a>
      </div>
      <IconOwl className="size-16 opacity-10 mx-auto" />
    </footer>
  )
}
