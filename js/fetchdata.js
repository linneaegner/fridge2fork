// ---------------------------------------------------------
// 🌐 fetchdata.js – Samlar alla API-anrop mot Spoonacular
// ---------------------------------------------------------

const API_KEY = "1663bb2ddfbf4b00891cffe70d26f9ed"; // ersätt med din egen nyckel
const BASE_URL = "https://api.spoonacular.com";

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
}

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

export async function getRecipeDetails(id) {
  if (!id) throw new Error("Missing recipe ID");
  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;
  return fetchJson(url);
}
