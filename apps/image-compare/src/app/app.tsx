import { Landing } from '@monorepo/components'
import { randomPerson } from '@monorepo/utils'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Comparison } from './comparison'

const navClasses = ({ isActive }: { isActive: boolean }) => `transition-colors ${isActive ? 'text-primary underline underline-offset-22' : 'text-gray-700 hover:text-primary'}`

export function App() {
  const person = randomPerson()
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
        <Route element={<Comparison />} path="/" />
        <Route element={<Landing subtitle={`This project is the great work of ${person.firstName} ${person.lastName} 😎`} title="About" />} path="/about" />
      </Routes>
    </div>
  )
}
