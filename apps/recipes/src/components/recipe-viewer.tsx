import { Button } from "@monorepo/components";
// oxlint-disable-next-line no-restricted-imports
import { HomeIcon, MoveLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Divider } from "./divider";

type RecipeParams = {
  category: string;
  recipe: string;
};

type RecipeModule = {
  // biome-ignore lint/style/useNamingConvention: can't change that
  ReactComponent: React.ComponentType;
};

function ErrorMessage({ error }: { error?: string }) {
  return (
    <div className="flex h-full items-center justify-center" data-testid="error">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Recette non trouvée</h2>
        <p className="text-gray-600">{error || "La recette demandée n'existe pas."}</p>
      </div>
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="flex h-full items-center justify-center" data-testid="loading">
      <div className="text-lg">Chargement de la recette...</div>
    </div>
  );
}

/* v8 ignore next -- @preserve */
// oxlint-disable-next-line max-lines-per-function
export function RecipeViewer() {
  const { category, recipe } = useParams<RecipeParams>();
  const [RecipeComponent, setRecipeComponent] = useState<React.ComponentType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!category || !recipe) {
      setError("Paramètres manquants");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);
    setRecipeComponent(undefined);

    // Dynamically import the recipe markdown file
    import(`../recipes/${category}/${recipe}.md`)
      .then((module: RecipeModule) => {
        // oxlint-disable-next-line max-nested-callbacks
        setRecipeComponent(() => module.ReactComponent);
        setIsLoading(false);
      })
      .catch(() => {
        setError(`La recette "${recipe}" dans la catégorie "${category}" n'existe pas.`);
        setIsLoading(false);
      });
  }, [category, recipe]);

  if (!category || !recipe || error) return <ErrorMessage error={error} />;

  if (isLoading) return <LoadingMessage />;

  /* v8 ignore next -- @preserve */
  if (!RecipeComponent) return <ErrorMessage error="Composant de recette non disponible" />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center" data-testid="recipe">
      <Button asChild className="fixed bottom-4 z-10 flex rounded-xl border-2 border-orange-800" name="back-home" variant="outline">
        <Link to="/">
          <MoveLeftIcon />
          Retour à l'accueil
          <HomeIcon />
        </Link>
      </Button>
      <div className="card">
        <RecipeComponent />
        <Divider />
      </div>
    </div>
  );
}
