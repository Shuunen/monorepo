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
        <Route
          element={
            <div>
              This is the generated root route. <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
          path="/"
        />
        <Route
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
          path="/page-2"
        />
      </Routes>
      {/* END: routes */}
    </div>
  )
}
