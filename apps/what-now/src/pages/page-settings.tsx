import { FloatingMenu } from '@monorepo/components'
import { Credentials } from '../components/credentials'
import { Intro } from '../components/intro'
import { Title } from '../components/title'
import { useActions } from '../utils/pages.utils'

export function PageSettings() {
  const actions = useActions()
  return (
    <div className="flex flex-col justify-center grow gap-4 mx-auto max-w-fit" data-testid="page-settings">
      <Title subtitle="Settings" />
      <Intro />
      <Credentials />
      <FloatingMenu actions={actions} />
    </div>
  )
}
