// Spoonacular API Key
const API_KEY = "32fa164a90a4441385aec42d7c8fe44d";
const API_URL = "https://api.spoonacular.com/recipes/findByIngredients";

// Function to fetch recipes based on ingredients
async function fetchRecipes(ingredients) {
  try {
    const response = await fetch(
      `${API_URL}?ingredients=${encodeURIComponent(ingredients)}&number=10&apiKey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recipes. Please try again later.");
    }

    const recipes = await response.json();
    return recipes; // Return recipes to be handled by the script.js file
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error for handling in script.js
  }
}

export { fetchRecipes };