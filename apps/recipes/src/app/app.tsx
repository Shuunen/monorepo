import { NavLink, Route, Routes } from 'react-router-dom'
import { ReactComponent as Chips } from '../recipes/aperitifs/chips.md'

const navClasses = ({ isActive }: { isActive: boolean }) => `transition-colors ${isActive ? 'text-primary underline underline-offset-22' : 'text-gray-700 hover:text-primary'}`

export function App() {
  return (
    <div className="flex flex-col h-full bg-pasta">
      <nav className="flex gap-6 text-2xl font-semibold justify-center w-full p-4 bg-white shadow-md">
        <NavLink className={navClasses} to="/">
          Accueil
        </NavLink>
        <NavLink className={navClasses} to="/recipes/aperitifs/chips">
          Chips
        </NavLink>
      </nav>
      <Routes>
        <Route
          element={
            <div>
              <h1>Les recettes de Shuunen</h1>
            </div>
          }
          path="/"
        />
        <Route element={<Chips />} path="/recipes/aperitifs/chips" />
      </Routes>
    </div>
  )
}
