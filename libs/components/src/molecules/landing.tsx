import { CircleQuestionMarkIcon } from 'lucide-react'
import { Alert, AlertDescription } from '../shadcn/alert'

type LandingProps = {
  title: string
  subtitle: string
  status?: string
}

export function Landing({ title, subtitle, status }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-6xl md:text-7xl font-light text-primary tracking-tight">{title}</h1>
          <div className="w-24 h-0.5 mt-8 bg-slate-300 mx-auto"></div>
          <p className="text-xl md:text-2xl font-light leading-relaxed">{subtitle}</p>
        </div>
        <div>
          {status && (
            <Alert className="w-fit mx-auto border-info/50 bg-info/5">
              <CircleQuestionMarkIcon />
              <AlertDescription>
                <p className="text-foreground">{status}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <footer className="absolute w-full bottom-5 font-thin text-gray-500 text-xs text-center mt-4">__unique-mark__</footer>
    </div>
  )
}
