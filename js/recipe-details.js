import { getRecipeDetails } from "./fetchdata.js";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/1280x720?text=No+image";

// Startar detaljsidan när DOM:en är redo
document.addEventListener("DOMContentLoaded", initDetailsPage);

async function initDetailsPage() {
  const recipeId = readRecipeId();
  if (!recipeId) {
    showError("We could not find a recipe. Please try again from the results page.");
    return;
  }

  try {
    const recipe = await getRecipeDetails(recipeId);
    console.log("📄 Visar recept", recipe.title);
    populateRecipe(recipe);
  } catch (error) {
    console.error("❌ Gick inte att hämta receptdetalj", error);
    showError("Unable to load this recipe right now.");
  }
}

function readRecipeId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("recipeId");
}

function populateRecipe(recipe) {
  setHeroImage(recipe);
  setTitleAndSummary(recipe);
  setMetaInfo(recipe);
  setDietTags(recipe);
  setIngredientList(recipe);
  setInstructionList(recipe);
  bindSourceButton(recipe);
}

function setHeroImage(recipe) {
  const image = document.getElementById("recipe-image");
  if (image) {
    image.src = recipe.image || PLACEHOLDER_IMAGE;
    image.alt = recipe.title || "Recipe image";
  }
}

function setTitleAndSummary(recipe) {
  const title = document.getElementById("recipe-title");
  const summary = document.getElementById("recipe-summary");
  const text = plainText(recipe.summary) || "Open the original recipe for more details.";

  if (title) title.textContent = recipe.title || "Unknown recipe";
  if (summary) summary.textContent = text;
}

function setMetaInfo(recipe) {
  const time = document.getElementById("recipe-time");
  const servings = document.getElementById("recipe-servings");

  if (time) time.textContent = recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Unknown";
  if (servings) servings.textContent = recipe.servings ? `${recipe.servings} servings` : "Flexible";
}

function setDietTags(recipe) {
  const target = document.getElementById("recipe-tags");
  if (!target) return;

  const level = difficultyLabel(recipe.readyInMinutes);
  const diets = (recipe.diets || []).slice(0, 3).map((diet) => `<span class="pill">${diet}</span>`).join("");

  target.innerHTML = `<span class="pill pill--muted">${level}</span>${diets}`;
}

function setIngredientList(recipe) {
  const list = document.getElementById("ingredients-list");
  if (!list) return;

  const items = recipe.extendedIngredients || [];
  if (!items.length) {
    list.innerHTML = "<li>No ingredients available.</li>";
    return;
  }

  list.innerHTML = items.map((item) => `<li>${item.original}</li>`).join("");
}

function setInstructionList(recipe) {
  const list = document.getElementById("instructions-list");
  if (!list) return;

  const steps = recipe.analyzedInstructions?.[0]?.steps || [];
  if (!steps.length) {
    list.innerHTML = "<li>No instructions available.</li>";
    return;
  }

  list.innerHTML = steps.map((step) => `<li>${step.step}</li>`).join("");
}

function bindSourceButton(recipe) {
  const button = document.getElementById("view-original");
  if (!button) return;

  if (recipe.sourceUrl) {
    button.disabled = false;
    button.classList.remove("btn-disabled");
    button.textContent = "View original recipe";
    button.addEventListener("click", () => window.open(recipe.sourceUrl, "_blank", "noopener"));
  } else {
    button.disabled = true;
    button.classList.add("btn-disabled");
    button.textContent = "Original recipe unavailable";
  }
}

function difficultyLabel(minutes) {
  if (!minutes || Number.isNaN(minutes)) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

function plainText(html) {
  if (!html) return "";
  const container = document.createElement("div");
  container.innerHTML = html;
  return container.textContent || "";
}

function showError(message) {
  const container = document.querySelector(".details-main");
  if (container) {
    container.innerHTML = `<p class="empty-state">${message}</p>`;
  }
}
