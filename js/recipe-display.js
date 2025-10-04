//recipe-display.js

import { getRecipesByIngredients } from "./fetchdata.js";

const recipeGrid = document.getElementById("recipe-grid");

// Get ingredients from localStorage
const ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];

async function displayRecipes() {
  if (!ingredients.length) {
    recipeGrid.innerHTML = "<p>No ingredients provided.</p>";
    return;
  }

  const recipes = await getRecipesByIngredients(ingredients);

  if (!recipes.length) {
    recipeGrid.innerHTML = "<p>No recipes found for these ingredients.</p>";
    return;
  }

  recipeGrid.innerHTML = recipes
    .map(
      (recipe) => `
    <div class="recipe-card">
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>Used ingredients: ${recipe.usedIngredientCount}, Missing ingredients: ${recipe.missedIngredientCount}</p>
      <a href="https://spoonacular.com/recipes/${recipe.title.replaceAll(" ", "-")}-${recipe.id}" target="_blank">View Full Recipe</a>
    </div>
  `
    )
    .join("");
}

displayRecipes();
