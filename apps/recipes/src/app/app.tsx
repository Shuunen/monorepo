import { Route, Routes } from 'react-router-dom'
import { RecipeMenu } from '../components/recipe-menu'
import { RecipeViewer } from '../components/recipe-viewer'

export function App() {
  return (
    <div className="flex flex-col min-h-screen prose md:prose-lg mx-auto max-w-4xl" data-component="app">
      <Routes>
        <Route element={<RecipeMenu />} path="/" />
        <Route element={<RecipeViewer />} path="/recipes/:category/:recipe" />
      </Routes>
    </div>
  )
}
