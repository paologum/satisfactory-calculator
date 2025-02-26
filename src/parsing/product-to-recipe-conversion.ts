import { ProductToRecipeRaw, RecipeJsonObject, RecipeToProducts, convertProductToRecipeRawToProductToRecipe } from "@/types";
import { splitRecipes } from "./split-recipes";
import { extractItemClassForProduct } from "./util";

export async function productToRecipeAndRecipeToProductCreation() {
    const { allRecipes } = await splitRecipes();
    const productToRecipeRaw: ProductToRecipeRaw = {};
    const recipeToProducts: RecipeToProducts = {};
    for (const recipe of Object.values(allRecipes)) {
        const extraction = extractItemClassForProduct(recipe.mProduct);
        if (extraction) {
            const { products, mainProduct } = extraction;
            const byproducts = []
            for (const product of Object.keys(products)) {
                if (!productToRecipeRaw[product]) {
                    productToRecipeRaw[product] = []
                }
                productToRecipeRaw[product].push(recipe.ClassName);
                if (product !== mainProduct) {
                    byproducts.push(product);
                }
            }
            if (!mainProduct) {
                console.error("Main product not found for recipe: ", recipe.ClassName);
                continue;
            }
            if (recipeToProducts[recipe.ClassName]) {
                console.error("Duplicate recipe found: ", recipe.ClassName);
                continue;
            }
            recipeToProducts[recipe.ClassName] = {
                mainProduct,
                byproducts
            }
        }
    }
    return { productToRecipe: convertProductToRecipeRawToProductToRecipe(productToRecipeRaw), recipeToProducts };
}