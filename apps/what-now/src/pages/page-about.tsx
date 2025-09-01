import { FloatingMenu } from '@monorepo/components'
import { Intro } from '../components/intro'
import { Title } from '../components/title'
import { useActions } from '../utils/pages.utils'

export function PageAbout() {
  const actions = useActions()
  return (
    <div className="flex flex-col grow text-center justify-center items-center gap-4 mx-auto max-w-fit" data-testid="page-about">
      <Title subtitle="What is it ?" />
      <Intro />
      <p>__unique-mark__</p>
      <FloatingMenu actions={actions} />
    </div>
  )
}
