import { getRecipeDetails } from "./fetchdata.js";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/1280x720?text=No+Image";

function getRecipeId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("recipeId");
}

function plainText(value) {
  if (!value) return "";
  const root = document.createElement("div");
  root.innerHTML = value;
  return root.textContent || "";
}

function writeRecipe(recipe) {
  const image = document.getElementById("recipe-image");
  const title = document.getElementById("recipe-title");
  const summary = document.getElementById("recipe-summary");
  const time = document.getElementById("recipe-time");
  const servings = document.getElementById("recipe-servings");
  const tags = document.getElementById("recipe-tags");
  const ingredients = document.getElementById("ingredients-list");
  const instructions = document.getElementById("instructions-list");
  const sourceButton = document.getElementById("view-original");

  if (image) {
    image.src = recipe.image || PLACEHOLDER_IMAGE;
    image.alt = recipe.title;
  }

  if (title) title.textContent = recipe.title;
  if (summary) summary.textContent = plainText(recipe.summary) || "Explore the original recipe for full details.";
  if (time) time.textContent = recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : "Time varies";
  if (servings) servings.textContent = recipe.servings ? `${recipe.servings} servings` : "Flexible servings";

  if (tags) {
    const difficulty = recipe.readyInMinutes <= 20 ? "Easy" : recipe.readyInMinutes <= 40 ? "Medium" : "Hard";
    const dietTags = (recipe.diets || []).slice(0, 3).map((diet) => `<span class="pill">${diet}</span>`).join("");
    tags.innerHTML = `<span class="pill pill--muted">${difficulty}</span>${dietTags}`;
  }

  if (ingredients) {
    const list = recipe.extendedIngredients || [];
    ingredients.innerHTML = list.length
      ? list.map((item) => `<li>${item.original}</li>`).join("")
      : "<li>No ingredients listed.</li>";
  }

  if (instructions) {
    const steps = recipe.analyzedInstructions?.[0]?.steps || [];
    instructions.innerHTML = steps.length
      ? steps.map((step) => `<li>${step.step}</li>`).join("")
      : "<li>No instructions provided.</li>";
  }

  if (sourceButton) {
    if (recipe.sourceUrl) {
      sourceButton.disabled = false;
      sourceButton.classList.remove("btn-disabled");
      sourceButton.addEventListener("click", () => window.open(recipe.sourceUrl, "_blank", "noopener"));
    } else {
      sourceButton.disabled = true;
      sourceButton.classList.add("btn-disabled");
      sourceButton.textContent = "Original recipe unavailable";
    }
  }
}

function showError(message) {
  const container = document.querySelector(".details-main");
  if (container) {
    container.innerHTML = `<p class="empty-state">${message}</p>`;
  }
}

async function init() {
  const recipeId = getRecipeId();
  if (!recipeId) {
    showError("Recipe id is missing. Try selecting a recipe again.");
    return;
  }

  try {
    const recipe = await getRecipeDetails(recipeId);
    writeRecipe(recipe);
  } catch (error) {
    console.error(error);
    showError("Unable to load recipe details right now.");
  }
}

document.addEventListener("DOMContentLoaded", init);
