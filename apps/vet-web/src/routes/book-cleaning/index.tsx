import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, SourceCode } from '@monorepo/components'
import { createFileRoute, Outlet } from '@tanstack/react-router'

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-primary my-4 text-center" data-testid="title">
        Book a cleaning session with Mr Clean
      </h1>
      <div className="flex mt-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Hooo nice</CardTitle>
            <CardDescription>Get ready for a sparkling clean!</CardDescription>
          </CardHeader>
          <CardContent>
            <Outlet />
          </CardContent>
          <CardFooter />
        </Card>
      </div>
      <SourceCode className="mt-4" code={{}} />
    </div>
  )
}

export const Route = createFileRoute('/book-cleaning/')({
  component: RouteComponent,
})
