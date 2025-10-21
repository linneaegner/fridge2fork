// ---------------------------------------------------------
// fetchdata.js – Handle all Spoonacular API requests
// ---------------------------------------------------------

const API_KEY = "1663bb2ddfbf4b00891cffe70d26f9ed";
const BASE_URL = "https://api.spoonacular.com";

// === Fetch JSON helper ===================================
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// === Get recipe list =====================================
export async function getRecipes({ ingredients = [] } = {}) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: "6",
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

// === Get single recipe details ===========================
export async function getRecipeDetails(id) {
  if (!id) return null;

  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;
  try {
    return await fetchJson(url);
  } catch {
    return null;
  }
}
