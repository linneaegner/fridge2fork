const API_KEY = "1663bb2ddfbf4b00891cffe70d26f9ed";
const BASE_URL = "https://api.spoonacular.com";

/**
 * Generic fetch helper for JSON responses.
 */
async function fetchJson(url) {
  const res = await fetch(url);
  console.log("Fetched response from API:", res);

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const jsonData = await res.json();
  console.log("Fetched jsonData from API:", jsonData);
  return jsonData;
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
    console.log("Fetching recipes with ingredients:", ingredients);
  }

  const url = `${BASE_URL}/recipes/complexSearch?${query}`;

  try {
    const data = await fetchJson(url);
    console.log("Fetched recipes:", data.results || []);
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
    const data = await fetchJson(url);
    return data;
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    return null;
  }
}
