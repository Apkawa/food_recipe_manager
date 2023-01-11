import {Ingredient, Recipe} from '../types/recipe';

export function parseTextRecipe(raw_text: string): Recipe {
  const recipe: Recipe = {
    name: '',
    description: '',
    ingredient_groups: [],
  };
  return recipe;
}

export function parseRecipeLine(raw_line: string): Ingredient {
  const ingredient: Ingredient = {
    name: '',
  };
  return ingredient;
}
