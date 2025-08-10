import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

type RecipeParams = {
  category: string
  recipe: string
}

type RecipeModule = {
  // biome-ignore lint/style/useNamingConvention: can't change that
  ReactComponent: React.ComponentType
}

function ErrorMessage({ error }: { error?: string }) {
  return (
    <div className="flex items-center justify-center h-full" data-component="error">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Recette non trouvée</h2>
        <p className="text-gray-600">{error || "La recette demandée n'existe pas."}</p>
      </div>
    </div>
  )
}

function LoadingMessage() {
  return (
    <div className="flex items-center justify-center h-full" data-component="loading">
      <div className="text-lg">Chargement de la recette...</div>
    </div>
  )
}

export function RecipeViewer() {
  const { category, recipe } = useParams<RecipeParams>()
  const [RecipeComponent, setRecipeComponent] = useState<React.ComponentType | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!category || !recipe) {
      setError('Paramètres manquants')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(undefined)
    setRecipeComponent(undefined)

    // Dynamically import the recipe markdown file
    import(`../recipes/${category}/${recipe}.md`)
      .then((module: RecipeModule) => {
        setRecipeComponent(() => module.ReactComponent)
        setIsLoading(false)
      })
      .catch(() => {
        setError(`La recette "${recipe}" dans la catégorie "${category}" n'existe pas.`)
        setIsLoading(false)
      })
  }, [category, recipe])

  if (!category || !recipe || error) return <ErrorMessage error={error} />

  if (isLoading) return <LoadingMessage />

  if (!RecipeComponent) return <ErrorMessage error="Composant de recette non disponible" />

  return <RecipeComponent data-component="recipe" />
}
