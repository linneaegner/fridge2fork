const API_KEY = "32fa164a90a4441385aec42d7c8fe44d";
const API_BASE = "https://api.spoonacular.com";
const DEFAULT_RESULT_COUNT = 24;

// Hjälpare som sköter själva fetch-anropet
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Kunde inte hämta data (status ${response.status})`);
  }
  return response.json();
}

// Hämtar en lista med recept baserat på ingredienser och kostfilter
export async function getRecipes({ ingredients = [], diets = [] } = {}) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: String(DEFAULT_RESULT_COUNT),
    addRecipeInformation: "true",
    instructionsRequired: "true",
  });

  if (ingredients.length) {
    params.set("includeIngredients", ingredients.join(","));
  }

  if (diets.length) {
    params.set("diet", diets.join(","));
  }

  console.log("🔎 Hämtar receptlista", { ingredients, diets });

  const url = `${API_BASE}/recipes/complexSearch?${params.toString()}`;
  const data = await fetchJson(url);
  return Array.isArray(data.results) ? data.results : [];
}

// Hämtar detaljer för ett specifikt recept-id
export async function getRecipeDetails(recipeId) {
  if (!recipeId) {
    throw new Error("Saknar recept-id");
  }

  const params = new URLSearchParams({
    apiKey: API_KEY,
    includeNutrition: "false",
  });

  console.log("📄 Hämtar receptdetalj", { recipeId });

  const url = `${API_BASE}/recipes/${recipeId}/information?${params.toString()}`;
  return fetchJson(url);
}
