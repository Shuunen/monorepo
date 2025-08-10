import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const navClasses = ({ isActive }: { isActive: boolean }) => `transition-colors ${isActive ? 'text-primary underline underline-offset-22' : 'text-gray-700 hover:text-primary'}`

const RECIPE_PATH_REGEX = /\.\.\/recipes\/([^/]+)\/([^/]+)\.md$/

type Recipe = {
  category: string
  name: string
  title: string
}

function formatRecipeTitle(filename: string): string {
  return filename
    .replace('.md', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

function formatCategoryTitle(category: string): string {
  const categoryMap: Record<string, string> = {
    aperitifs: 'Apéritifs',
    boissons: 'Boissons',
    desserts: 'Desserts',
    fromages: 'Fromages',
    hygiene: 'Hygiène',
    maison: 'Maison',
    pains: 'Pains',
    plats: 'Plats',
  }
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1)
}

function parseRecipesFromPaths(recipeModules: Record<string, () => Promise<unknown>>): Recipe[] {
  const recipes: Recipe[] = []

  for (const path of Object.keys(recipeModules)) {
    const match = path.match(RECIPE_PATH_REGEX)
    if (match) {
      const [, category, name] = match
      if (name === 'template') continue

      recipes.push({
        category,
        name,
        title: formatRecipeTitle(name),
      })
    }
  }

  return recipes
}

function groupRecipesByCategory(recipes: Recipe[]): Record<string, Recipe[]> {
  const grouped: Record<string, Recipe[]> = {}

  for (const recipe of recipes) {
    if (!grouped[recipe.category]) grouped[recipe.category] = []
    grouped[recipe.category].push(recipe)
  }

  for (const category of Object.keys(grouped)) grouped[category].sort((first, second) => first.title.localeCompare(second.title))

  return grouped
}

function LoadingNav() {
  return (
    <nav className="flex gap-6 text-2xl font-semibold justify-center w-full p-4 bg-white shadow-md">
      <NavLink className={navClasses} to="/">
        Accueil
      </NavLink>
      <span className="text-gray-500">Chargement des recettes...</span>
    </nav>
  )
}

export function RecipeNavigation() {
  const [recipesByCategory, setRecipesByCategory] = useState<Record<string, Recipe[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const recipeModules = import.meta.glob('../recipes/**/*.md')
    const recipes = parseRecipesFromPaths(recipeModules)
    const grouped = groupRecipesByCategory(recipes)

    setRecipesByCategory(grouped)
    setIsLoading(false)
  }, [])

  if (isLoading) return <LoadingNav />

  return (
    <nav className="flex gap-6 text-2xl font-semibold justify-center w-full p-4 bg-white shadow-md flex-wrap">
      <NavLink className={navClasses} to="/">
        Accueil
      </NavLink>
      {Object.entries(recipesByCategory).map(([category, categoryRecipes]) => (
        <div className="relative group" key={category}>
          <span className="text-gray-700 capitalize cursor-pointer">{formatCategoryTitle(category)}</span>
          <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-48">
            {categoryRecipes.map(recipe => (
              <NavLink className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors" key={`${recipe.category}/${recipe.name}`} to={`/recipes/${recipe.category}/${recipe.name}`}>
                {recipe.title}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
