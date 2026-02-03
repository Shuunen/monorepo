import { Alert } from "../atoms/alert";

type LandingProps = {
  children?: React.ReactNode;
  title: string;
  subtitle: string;
  status?: string;
};

export function Landing({ children, title, subtitle, status }: LandingProps) {
  return (
    <div
      className="flex min-h-screen items-center bg-gradient-to-br from-slate-50 to-slate-100 p-8"
      data-component="landing"
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-6xl font-light tracking-tight text-primary md:text-7xl">{title}</h1>
          <div className="mx-auto mt-8 h-0.5 w-24 bg-slate-300"></div>
          <p className="text-xl leading-relaxed font-light md:text-2xl">{subtitle}</p>
        </div>
        <div>{status && <Alert type="info">{status}</Alert>}</div>
        {children}
      </div>
    </div>
  );
}
