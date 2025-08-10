import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const navClasses = ({ isActive }: { isActive: boolean }) => `transition-colors ${isActive ? 'text-primary underline underline-offset-22' : 'text-gray-700 hover:text-primary'}`

const RECIPE_PATH_REGEX = /\.\.\/recipes\/([^/]+)\/([^/]+)\.md$/

const categoryMap: Record<string, string> = {
  aperitif: 'Apéritifs 🍹',
  boisson: 'Boissons 🥤',
  dessert: 'Desserts 🍰',
  fromage: 'Fromages 🧀',
  hygiene: 'Hygiène 👕',
  maison: 'Maison 🏠',
  pain: 'Pains 🍞',
  plat: 'Plats 🍕',
}

type Recipe = {
  category: string
  name: string
}

function parseRecipesFromPaths(recipeModules: Record<string, () => Promise<unknown>>): Recipe[] {
  const recipes: Recipe[] = []
  for (const path of Object.keys(recipeModules)) {
    const match = path.match(RECIPE_PATH_REGEX)
    if (!match) continue
    const [, category, name] = match
    if (name === 'template') continue
    recipes.push({ category, name })
  }
  return recipes
}

function groupRecipesByCategory(recipes: Recipe[]): Record<string, Recipe[]> {
  const grouped: Record<string, Recipe[]> = {}
  for (const recipe of recipes) {
    if (!grouped[recipe.category]) grouped[recipe.category] = []
    grouped[recipe.category].push(recipe)
  }
  for (const category of Object.keys(grouped)) grouped[category].sort((first, second) => first.name.localeCompare(second.name))
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

export function RecipeMenu() {
  const [groupedRecipes, setGroupedRecipes] = useState<Record<string, Recipe[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const recipeModules = import.meta.glob('../recipes/**/*.md')
    const parsedRecipes = parseRecipesFromPaths(recipeModules)
    const grouped = groupRecipesByCategory(parsedRecipes)
    setGroupedRecipes(grouped)
    setIsLoading(false)
  }, [])

  if (isLoading) return <LoadingNav />

  const categories = Object.keys(groupedRecipes).sort()

  return (
    <div className="-mt-12 mb-8 pt-8">
      {categories.map(category => (
        <section className="mb-8" key={category}>
          <h2 className="text-2xl font-bold text-gray-800">{categoryMap[category] || 'missing-mapping'}</h2>
          <ol className="gap-x-6 gap-y-2 grid sm:grid-cols-2 md:grid-cols-3 md:max-w-fit!">
            {groupedRecipes[category].map((recipe, index) => (
              <li className="flex items-center" key={`${recipe.category}/${recipe.name}`}>
                <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                <NavLink className="text-yellow-700! hover:underline transition-colors" to={`/recipes/${recipe.category}/${recipe.name}`}>
                  {recipe.name}
                </NavLink>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
