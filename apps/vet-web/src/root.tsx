import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { Header } from "./components/molecules/header";
import { Toaster } from "@monorepo/components";

export const links: any = () => [
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  { rel: "stylesheet", href: "/src/styles.css" },
];

export const meta: any = () => [
  { title: "Vet Web" },
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { name: "unique-mark", content: "" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <base href="/" />
        <Meta />
        <Links />
      </head>

      <body className="flex flex-col dark:bg-stone-900 h-full bg-fixed bg-blue-50">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="w-full max-w-5xl mx-auto dark:bg-stone-800 dark:text-white bg-gradient-to-b bg-fixed from-blue-50 to-white p-12 grow">
      <div className="flex flex-col gap-4 h-full">
        <Header />
        <div className="border-stone-600 border-t mt-4 mb-2 w-1/3 mx-auto h-1" />
        <Outlet />
        <Toaster name="default" />
      </div>
    </div>
  );
}
