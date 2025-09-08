import { FloatingMenu } from '@monorepo/components'
import { useActions } from '../utils/pages.utils'

export function PageAbout() {
  const actions = useActions()
  return (
    <div className="flex flex-col grow text-center justify-center gap-4" data-testid="page-about">
      <h1>About</h1>
      <p>
        This webapp has been deployed from this open-source code{' '}
        <a className="border-b" href="https://github.com/Shuunen/monorepo/tree/master/apps/what-now" rel="noopener noreferrer" target="_blank">
          on Github
        </a>
        .
        <br />
        <br />
        Please check the above link to be introduced to this app : what is it and how to use it.
      </p>
      <p>__unique-mark__</p>
      <FloatingMenu actions={actions} />
    </div>
  )
}
