import { HomeIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Divider } from './divider'

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
    <div className="flex items-center justify-center h-full" data-testid="error">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Recette non trouvée</h2>
        <p className="text-gray-600">{error || "La recette demandée n'existe pas."}</p>
      </div>
    </div>
  )
}

function LoadingMessage() {
  return (
    <div className="flex items-center justify-center h-full" data-testid="loading">
      <div className="text-lg">Chargement de la recette...</div>
    </div>
  )
}

// oxlint-disable-next-line max-lines-per-function
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
    /* c8 ignore start */
    import(`../recipes/${category}/${recipe}.md`)
      .then((module: RecipeModule) => {
        // oxlint-disable-next-line max-nested-callbacks
        setRecipeComponent(() => module.ReactComponent)
        setIsLoading(false)
      })
      .catch(() => {
        setError(`La recette "${recipe}" dans la catégorie "${category}" n'existe pas.`)
        setIsLoading(false)
      })
    /* c8 ignore end */
  }, [category, recipe])

  if (!category || !recipe || error) return <ErrorMessage error={error} />

  if (isLoading) return <LoadingMessage />

  /* c8 ignore next */
  if (!RecipeComponent) return <ErrorMessage error="Composant de recette non disponible" />

  return (
    <div className="flex flex-col justify-center items-center min-h-screen" data-testid="recipe">
      <Link className="flex fixed bottom-4 w-full" to="/">
        <span className="flex mx-auto w-fit rounded-full border-2 bg-white text-primary border-primary shadow-lg items-center gap-4 px-4 py-2">
          Retour à l'accueil
          <HomeIcon />
        </span>
      </Link>
      <div className="card">
        <RecipeComponent />
        <Divider />
      </div>
    </div>
  )
}
