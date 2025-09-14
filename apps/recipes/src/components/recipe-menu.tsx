import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Divider } from './divider'

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
    /* c8 ignore next */
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

function Loading() {
  return (
    <nav className="flex gap-6 text-2xl font-semibold justify-center w-full p-4 bg-white shadow-md">
      <span className="text-gray-500">Chargement des recettes...</span>
    </nav>
  )
}

export function RecipeMenu() {
  const [groupedRecipes, setGroupedRecipes] = useState<Record<string, Recipe[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    /* c8 ignore next */
    const recipeModules = import.meta.glob('../recipes/**/*.md')
    const parsedRecipes = parseRecipesFromPaths(recipeModules)
    const grouped = groupRecipesByCategory(parsedRecipes)
    setGroupedRecipes(grouped)
    setIsLoading(false)
  }, [])

  if (isLoading) return <Loading />

  const categories = Object.keys(groupedRecipes).sort()

  return (
    <div className="flex flex-col grow items-center justify-center py-24">
      <div className="card">
        <h1>
          Les recettes de
          <br />
          <span className="text-amber-100">Romain</span> !
        </h1>
        {categories.map(category => (
          <section className="w-full" key={category}>
            <h2>{categoryMap[category]}</h2>
            <ol className="grid sm:grid-cols-2 pl-0!">
              {groupedRecipes[category].map((recipe, index) => (
                <li className="flex items-center" key={`${recipe.category}/${recipe.name}`}>
                  <span className="mr-2">{index + 1}.</span>
                  <NavLink to={`/recipes/${recipe.category}/${recipe.name}`}>{recipe.name}</NavLink>
                </li>
              ))}
            </ol>
          </section>
        ))}
        <Divider />
      </div>
      {/** biome-ignore lint/correctness/useUniqueElementIds: unique mark need this id */}
      <span className="text-sm text-center block w-full text-gray-500 italic -mt-4 mb-8" id="unique-mark"></span>
    </div>
  )
}
