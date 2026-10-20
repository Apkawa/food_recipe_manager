import RecipeCalculator from "@/components/RecipeCalculator/RecipeCalculator";

/**
 * Main route: recipe calculator.
 */
function HomeView() {
  return (
    <main>
      <h1 className="page-title">Калькулятор</h1>
      <RecipeCalculator />
    </main>
  );
}

export default HomeView;
