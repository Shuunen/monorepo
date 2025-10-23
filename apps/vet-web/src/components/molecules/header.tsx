/* v8 ignore start -- @preserve */
import { Button } from '@monorepo/components'
import { Link } from '@tanstack/react-router'
// oxlint-disable-next-line no-restricted-imports
import { HeadsetIcon, PawPrint } from 'lucide-react'

const routes = [
  /* eslint-disable sort-keys */
  { label: 'Home', path: '/' },
  { label: 'Contact us', path: '/contact' },
  { label: 'About', path: '/about' },
  /* eslint-enable sort-keys */
]

export function Header() {
  return (
    <div className="flex gap-4 justify-between items-center">
      <Link className="flex text-primary items-center gap-2" to="/">
        <PawPrint />
        <h1 className="font-bold">Vet Web</h1>
      </Link>
      <div className="flex gap-4">
        {routes.map(route => (
          <Link className="[&.active]:font-bold" key={route.path} to={route.path}>
            {route.label}
          </Link>
        ))}
      </div>
      <Button testId="call-us" variant="outline">
        Call us <HeadsetIcon />
      </Button>
    </div>
  )
}
/* v8 ignore stop -- @preserve */
