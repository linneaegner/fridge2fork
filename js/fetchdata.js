const API_KEY = "32fa164a90a4441385aec42d7c8fe44d";
const API_ROOT = "https://api.spoonacular.com";
const SEARCH_ENDPOINT = `${API_ROOT}/recipes/complexSearch`;
const RECIPE_ENDPOINT = `${API_ROOT}/recipes`;
const DEFAULT_RESULT_COUNT = 24;

async function request(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const message = `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return response.json();
}

export async function searchRecipes(options = {}) {
  const {
    ingredients = [],
    diets = [],
    number = DEFAULT_RESULT_COUNT,
    sort,
    sortDirection,
    maxReadyTime,
  } = options;

  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: String(number),
    addRecipeInformation: "true",
    instructionsRequired: "true",
  });

  if (ingredients.length) {
    params.set("includeIngredients", ingredients.join(","));
  }

  if (diets.length) {
    params.set("diet", diets.join(","));
  }

  if (typeof maxReadyTime === "number") {
    params.set("maxReadyTime", String(maxReadyTime));
  }

  if (sort) {
    params.set("sort", sort);
    if (sortDirection) {
      params.set("sortDirection", sortDirection);
    }
  }

  const url = `${SEARCH_ENDPOINT}?${params.toString()}`;
  const data = await request(url);
  return Array.isArray(data.results) ? data.results : [];
}

export async function getRecipeDetails(recipeId) {
  if (!recipeId) {
    throw new Error("A recipe id is required");
  }

  const params = new URLSearchParams({
    apiKey: API_KEY,
    includeNutrition: "false",
  });

  const url = `${RECIPE_ENDPOINT}/${recipeId}/information?${params.toString()}`;
  return request(url);
}
