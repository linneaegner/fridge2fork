// fetchdata.js
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
