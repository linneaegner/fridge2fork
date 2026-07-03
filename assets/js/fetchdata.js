import { API_KEY, BASE_URL } from "./config.js";
const RESULTS_LIMIT = 6;
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error (status ${response.status})`);
  }
  return response.json();
}
export async function getRecipes({ ingredients = [] } = {}) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: String(RESULTS_LIMIT),
    addRecipeInformation: "true",
    instructionsRequired: "true",
    offset: "0",
  });
  if (ingredients.length) {
    params.set("includeIngredients", ingredients.join(","));
  }
  const url = `${BASE_URL}/recipes/complexSearch?${params}`;
  try {
    const data = await fetchJson(url);
    return data.results || [];
  } catch {
    return [];
  }
}
export async function getRecipeDetails(id) {
  if (!id) return null;
  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;
  try {
    return await fetchJson(url);
  } catch {
    return null;
  }
}
