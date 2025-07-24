type LandingProps = {
  title: string
  subtitle: string
  status: string
}

export function Landing({ title, subtitle, status }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-light text-slate-800 tracking-tight">{title}</h1>
          <div className="w-24 h-0.5 mt-8 bg-slate-300 mx-auto"></div>
          <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed">{subtitle}</p>
        </div>

        <div className="pt-8">
          <div className="inline-flex items-center space-x-2 text-slate-400 text-sm">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>{status}</span>
          </div>
        </div>
      </div>

      <footer className="absolute w-full bottom-5 font-thin text-gray-500 text-xs text-center mt-4">__unique-mark__</footer>
    </div>
  )
}
