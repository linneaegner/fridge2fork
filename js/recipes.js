const API_KEY = "32fa164a90a4441385aec42d7c8fe44d"; // Replace with your API key
const BASE_URL = "https://api.spoonacular.com/recipes/findByIngredients";

export async function getRecipesByIngredients(ingredients, number = 10) {
  const params = new URLSearchParams({
    ingredients: ingredients.join(","), // array of ingredients
    number: number,
    apiKey: API_KEY,
  });

  try {
    const response = await fetch(`${BASE_URL}?${params}`);
    if (!response.ok) throw new Error("Failed to fetch recipes");
    const data = await response.json();
    return data; // returns an array of recipes
  } catch (error) {
    console.error(error);
    return [];
  }
}

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
