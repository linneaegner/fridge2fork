// ---------------------------
// 🌐 FETCH DATA MODULE
// Handles all communication with Spoonacular API
// ---------------------------

const API_KEY = "YOUR_API_KEY_HERE"; // replace with your key
const BASE_URL = "https://api.spoonacular.com";

// Simple helper to fetch JSON safely
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
}

// Get a list of recipes based on ingredients
export async function getRecipes({ ingredients = [], diets = [] } = {}) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: "24",
    addRecipeInformation: "true",
    instructionsRequired: "true",
  });

  if (ingredients.length) params.set("includeIngredients", ingredients.join(","));
  if (diets.length) params.set("diet", diets.join(","));

  const url = `${BASE_URL}/recipes/complexSearch?${params.toString()}`;
  const data = await fetchJson(url);
  return data.results || [];
}

// Get details for a single recipe
export async function getRecipeDetails(id) {
  if (!id) throw new Error("Missing recipe ID");
  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;
  return fetchJson(url);
}
