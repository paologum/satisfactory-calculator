import { readFile, writeFile } from "fs/promises";

function parseProducedIn(mProducedIn: string): string[] {
  let trimmed = mProducedIn.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    trimmed = trimmed.slice(1, -1);
  }
  const parts = trimmed.split(',');
  return parts.map(part => {
    const cleaned = part.trim().replace(/^"|"$/g, '');
    const segments = cleaned.split('.');
    return segments[segments.length - 1];
  });
}

export async function GET(req: Request) {
  const allRecipes = JSON.parse(await readFile("all-recipes.json", "utf-8"));
  const altRecipes = JSON.parse(await readFile("alt-recipes.json", "utf-8"));

  const finalRecipes: Record<string, any> = {};

  for (const recipe of allRecipes) {
    if (!recipe.ClassName.endsWith("_C")) console.log("Not a recipe: ", recipe.ClassName);
    const className = recipe.ClassName;
    const ingredientsString = recipe.mIngredients;
    const ingredients = [];
    const regex = /ItemClass="[^"]*\/Desc_([^\."]+)[^"]*",Amount=([0-9]+)/g;
    const producedIn = recipe.mProducedIn ? parseProducedIn(recipe.mProducedIn)[0] : "";
    let match;
    while ((match = regex.exec(ingredientsString)) !== null) {
      const itemName = `Recipe_${match[1]}_C`;
      ingredients.push({ item: itemName, amount: parseInt(match[2]) });
    }
    finalRecipes[className] = {
      displayName: recipe.mDisplayName,
      ingredients,
      producedIn
    };
  }
  for (const key in altRecipes) {
    const recipe = altRecipes[key];
    if (!recipe.ClassName.endsWith("_C")) console.log("Not a recipe: ", recipe.ClassName);
    const className = recipe.ClassName;
    const ingredientsString = recipe.mIngredients;
    const ingredients = [];
    const regex = /ItemClass="[^"]*\/Desc_([^\."]+)[^"]*",Amount=([0-9]+)/g;
    const producedIn = recipe.mProducedIn ? parseProducedIn(recipe.mProducedIn)[0] : "";
    let match;
    while ((match = regex.exec(ingredientsString)) !== null) {
      const itemName = `Recipe_${match[1]}_C`;
      ingredients.push({ item: itemName, amount: parseInt(match[2]) });
    }
    finalRecipes[className] = {
      displayName: recipe.mDisplayName,
      ingredients,
      producedIn
    };
  }
  await writeFile("recipes-to-ingredients.json", JSON.stringify(finalRecipes, null, 2));
  return Response.json(finalRecipes);
}
