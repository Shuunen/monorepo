import { randomPerson } from '@shuunen/shuutils'

export function NxWelcome({ title }: { title: string }) {
  const someone = randomPerson()

  return (
    <div className="flex flex-col gap-8 m-32">
      <h1 className="text-3xl font-bold text-center">
        Hello {someone.firstName} {someone.lastName}
      </h1>
      <h2 className="text-2xl font-semibold text-center">Welcome to {title} 👋</h2>
    </div>
  )
}

export default NxWelcome
