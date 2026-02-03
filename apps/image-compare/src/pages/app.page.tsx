import { NavLink, Route, Routes } from "react-router-dom";
import { About } from "../tabs/about.tab";
import { Comparison } from "../tabs/comparison.tab";
import { Settings } from "../tabs/settings.tab";

const navClasses = ({ isActive }: { isActive: boolean }) =>
  `transition-colors ${isActive ? "text-primary underline underline-offset-20" : "text-primary/30 hover:text-primary"}`;

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex w-full justify-center gap-6 bg-primary/10 p-4 font-semibold shadow-md">
        <NavLink className={navClasses} to="/about">
          About
        </NavLink>
        <NavLink className={navClasses} to="/">
          Image Compare
        </NavLink>
        <NavLink className={navClasses} to="/settings">
          Settings
        </NavLink>
      </nav>
      <Routes>
        <Route element={<Comparison />} path="/" />
        <Route element={<About />} path="/about" />
        <Route element={<Settings />} path="/settings" />
      </Routes>
    </div>
  );
}
