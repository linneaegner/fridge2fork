const API_KEY = "1663bb2ddfbf4b00891cffe70d26f9ed";
const BASE_URL = "https://api.spoonacular.com";

/**
 * Generic fetch helper for JSON responses.
 */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Fetches a list of recipes based on selected ingredients.
 */
export async function getRecipes({ ingredients = [] } = {}) {
  const query = new URLSearchParams({
    apiKey: API_KEY,
    number: "6",
    addRecipeInformation: "true",
    instructionsRequired: "true",
    offset: "0",
  });

  if (ingredients.length) {
    query.set("includeIngredients", ingredients.join(","));
  }

  const url = `${BASE_URL}/recipes/complexSearch?${query}`;

  try {
    const data = await fetchJson(url);
    return data.results || [];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

/**
 * Fetches detailed recipe information by ID.
 */
export async function getRecipeDetails(id) {
  if (!id) return null;
  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;

  try {
    return await fetchJson(url);
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    return null;
  }
}
