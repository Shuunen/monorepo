import { Route, Routes } from 'react-router-dom'
import { RecipeNavigation } from '../components/recipe-navigation'
import { RecipeViewer } from '../components/recipe-viewer'

export function App() {
  return (
    <div className="flex flex-col h-full" data-component="app">
      <RecipeNavigation />
      <Routes>
        <Route
          element={
            <div>
              <h1>Les recettes de Shuunen</h1>
            </div>
          }
          path="/"
        />
        <Route element={<RecipeViewer />} path="/recipes/:category/:recipe" />
      </Routes>
    </div>
  )
}
