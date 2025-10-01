import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@monorepo/components'
import { createFileRoute, Link } from '@tanstack/react-router'
import { FileInputIcon } from 'lucide-react'
import { FormContact } from '../components/molecules/form-contact'

function Contact() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <FileInputIcon className="mr-2 h-6 w-6" />
            Contact Us
          </CardTitle>
          <CardDescription>We are here to assist you!</CardDescription>
        </CardHeader>
        <CardContent>
          <FormContact />
        </CardContent>
        <CardFooter>
          <Link className="mb-6" to="/">
            <Button testId="go-home" variant="destructive">
              Go to home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/contact')({
  component: Contact,
})
