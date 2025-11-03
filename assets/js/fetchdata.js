// -------------------------------------------------------------
// API CONFIGURATION
// -------------------------------------------------------------
const API_KEY = "1663bb2ddfbf4b00891cffe70d26f9ed";
const BASE_URL = "https://api.spoonacular.com";

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
    number: "6", // hur många recept som ska hämtas
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
