import { Landing } from '@shuunen/components'
import { NavLink, Route, Routes } from 'react-router-dom'

const navClasses = ({ isActive }: { isActive: boolean }) => `transition-colors ${isActive ? 'text-blue-600 underline underline-offset-22' : 'text-gray-700 hover:text-blue-600'}`

export function App() {
  return (
    <div>
      <nav className="absolute flex gap-6 text-2xl font-semibold justify-center w-full p-4 bg-white shadow-md">
        <NavLink className={navClasses} to="/">
          Home
        </NavLink>
        <NavLink className={navClasses} to="/about">
          About
        </NavLink>
      </nav>
      <Routes>
        <Route element={<Landing status="Use me as a template" subtitle="Web application built with React and TailwindCSS" title="Sample Web App" />} path="/" />
        <Route element={<Landing subtitle="Lorem ipsum sit dolor in Shuunen" title="About" />} path="/about" />
      </Routes>
    </div>
  )
}
