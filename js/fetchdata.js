// ---------------------------------------------------------
// 🍳 fetchdata.js – Fetches data from the Spoonacular API
// ---------------------------------------------------------

// Your API key (replace with your own if needed)
const API_KEY = "1663bb2ddfbf4b00891cffe70d26f9ed";
const BASE_URL = "https://api.spoonacular.com";

// ---------------------------------------------------------
// 📦 Helper – Fetch JSON data from a URL
// ---------------------------------------------------------
async function fetchJson(url) {
  console.log("🌐 Fetching data from:", url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // If the server responds with a non 200–299 status
      throw new Error(`Could not fetch data. Status code: ${response.status}`);
    }

    // Return the JSON payload when everything succeeds
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error when fetching data:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}

// ---------------------------------------------------------
// 🥕 Fetch a recipe list filtered by ingredients and diet
// ---------------------------------------------------------
export async function getRecipes({ ingredients = [], diets = [] } = {}) {
  console.log("📋 Fetching recipes from the API...", { ingredients, diets });

  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: "24", // how many recipes to request
    addRecipeInformation: "true",
    instructionsRequired: "true",
  });

  // Include selected ingredients
  if (ingredients.length > 0) {
    params.set("includeIngredients", ingredients.join(","));
  }

  // Include selected diets (e.g. vegan, gluten free)
  if (diets.length > 0) {
    params.set("diet", diets.join(","));
  }

  const url = `${BASE_URL}/recipes/complexSearch?${params.toString()}`;

  try {
    const data = await fetchJson(url);
    console.log(`✅ Found ${data.results?.length || 0} recipes`);
    return data.results || [];
  } catch (error) {
    console.error("⚠️ Could not fetch the recipe list:", error);
    return []; // Return an empty list instead of crashing
  }
}

// ---------------------------------------------------------
// 📖 Fetch recipe details for a specific recipe
// ---------------------------------------------------------
export async function getRecipeDetails(id) {
  if (!id) {
    console.warn("⚠️ Missing recipe ID when fetching details.");
    return null;
  }

  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;

  try {
    const data = await fetchJson(url);
    console.log("📄 Retrieved recipe details for:", data.title);
    return data;
  } catch (error) {
    console.error("❌ Could not fetch recipe details:", error);
    return null;
  }
}
