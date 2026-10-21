import RecipeCalculator from "@/components/RecipeCalculator/RecipeCalculator";

/**
 * Main route: recipe calculator. The visible page title (the recipe name) and
 * the document `<h1>` are rendered by {@link RecipeCalculator} via the unified
 * `PageHeader`.
 */
function HomeView() {
  return <RecipeCalculator />;
}

export default HomeView;
