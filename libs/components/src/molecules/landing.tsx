import { Alert } from "../atoms/alert";

type LandingProps = {
  children?: React.ReactNode;
  title: string;
  subtitle: string;
  status?: string;
};

export function Landing({ children, title, subtitle, status }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center p-8" data-component="landing">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-6xl md:text-7xl font-light text-primary tracking-tight">{title}</h1>
          <div className="w-24 h-0.5 mt-8 bg-slate-300 mx-auto"></div>
          <p className="text-xl md:text-2xl font-light leading-relaxed">{subtitle}</p>
        </div>
        <div>{status && <Alert type="info">{status}</Alert>}</div>
        {children}
      </div>
    </div>
  );
}
