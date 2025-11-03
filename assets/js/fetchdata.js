// -------------------------------------------------------------
// API CONFIGURATION
// -------------------------------------------------------------
import { API_KEY, BASE_URL } from "./config.js";

const RESULTS_LIMIT = 6;

// -------------------------------------------------------------
// HELPER FUNCTION
// -------------------------------------------------------------
// Hämtar JSON-data från en URL och kastar fel om något går snett.
async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error (status ${response.status})`);
  }

  return response.json();
}

// -------------------------------------------------------------
// MAIN FUNCTIONS
// -------------------------------------------------------------
// Hämtar en lista av recept baserat på valda ingredienser.
// Returnerar alltid en tom lista om något går fel.
export async function getRecipes({ ingredients = [] } = {}) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: String(RESULTS_LIMIT), // hur många recept som ska hämtas
    addRecipeInformation: "true",
    instructionsRequired: "true",
    offset: "0",
  });

  // Om användaren valt ingredienser, lägg till dem i sökparametrarna.
  if (ingredients.length) {
    params.set("includeIngredients", ingredients.join(","));
  }

  const url = `${BASE_URL}/recipes/complexSearch?${params}`;

  try {
    const data = await fetchJson(url);
    return data.results || [];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

// Hämtar detaljerad information för ett enskilt recept.
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
