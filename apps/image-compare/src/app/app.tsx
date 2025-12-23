import { NavLink, Route, Routes } from 'react-router-dom'
import { About } from './about'
import { Comparison } from './comparison'
import { Settings } from './settings'

const navClasses = ({ isActive }: { isActive: boolean }) => `transition-colors ${isActive ? 'text-primary underline underline-offset-20' : 'text-primary/30 hover:text-primary'}`

export function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="flex gap-6 font-semibold justify-center w-full p-4 bg-primary/10 shadow-md">
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
  )
}
