import { Landing } from "@monorepo/components";
import { readableTime } from "@monorepo/utils";
import { NavLink, Route, Routes } from "react-router-dom";

const navClasses = ({ isActive }: { isActive: boolean }) => `transition-colors ${isActive ? "text-primary underline underline-offset-22" : "text-gray-700 hover:text-primary"}`;

export function App() {
  const createdOn = readableTime(new Date("2025-07-15"));
  return (
    <div>
      <nav className="absolute flex w-full justify-center gap-6 bg-white p-4 text-2xl font-semibold shadow-md">
        <NavLink className={navClasses} to="/">
          Home
        </NavLink>
        <NavLink className={navClasses} to="/about">
          About
        </NavLink>
      </nav>
      <Routes>
        <Route element={<Landing status="I'm a starter base project" subtitle="Web application built with React and TailwindCSS" title="sample-web-app" />} path="/" />
        <Route element={<Landing subtitle={`This project exists since ${createdOn} 😎`} title="About" />} path="/about" />
      </Routes>
    </div>
  );
}
