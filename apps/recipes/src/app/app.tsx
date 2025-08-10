import { Route, Routes } from 'react-router-dom'
import { RecipeMenu } from '../components/recipe-menu'
import { RecipeViewer } from '../components/recipe-viewer'

export function App() {
  return (
    <div className="flex flex-col min-h-screen" data-component="app">
      <Routes>
        <Route
          element={
            <div className="bg-pasta flex flex-col grow items-center justify-center h-full pt-24">
              <h1 className="whitespace-break-spaces! text-center text-5xl! mx-auto">Les recettes de Shuunen</h1>
              <RecipeMenu />
            </div>
          }
          path="/"
        />
        <Route element={<RecipeViewer />} path="/recipes/:category/:recipe" />
      </Routes>
    </div>
  )
}
