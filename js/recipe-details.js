import { getRecipeDetails } from "./fetchdata.js";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/960x540?text=No+image";

// Startar detaljsidan när innehållet är redo
document.addEventListener("DOMContentLoaded", loadRecipeDetails);

async function loadRecipeDetails() {
  const recipeId = new URLSearchParams(window.location.search).get("recipeId");
  if (!recipeId) {
    showError("We could not find a recipe. Please try again from the results page.");
    return;
  }

  try {
    const recipe = await getRecipeDetails(recipeId);
    console.log("📄 Visar receptdetalj", recipeId);
    renderRecipe(recipe);
  } catch (error) {
    console.error("❌ Kunde inte ladda receptdetalj", error);
    showError("We could not load this recipe right now.");
  }
}

function renderRecipe(recipe) {
  updateImage(recipe.image, recipe.title);
  updateText("recipe-title", recipe.title || "Unknown recipe");
  updateText(
    "recipe-summary",
    plainText(recipe.summary) || "Open the original recipe for more details."
  );
  updateText("recipe-time", recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Not available");
  updateText(
    "recipe-servings",
    recipe.servings ? `${recipe.servings} servings` : "Flexible servings"
  );
  updateTags(recipe.diets, recipe.readyInMinutes);
  renderList(
    "ingredients-list",
    recipe.extendedIngredients?.map((item) => item.original) || [],
    "No ingredients available."
  );
  renderList(
    "instructions-list",
    recipe.analyzedInstructions?.[0]?.steps?.map((step) => step.step) || [],
    "No instructions available."
  );
  configureSourceButton(recipe.sourceUrl);
}

function updateImage(url, title) {
  const image = document.getElementById("recipe-image");
  if (!image) return;
  image.src = url || PLACEHOLDER_IMAGE;
  image.alt = title ? `Photo of ${title}` : "Recipe photo";
}

function updateText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function updateTags(diets = [], minutes) {
  const target = document.getElementById("recipe-tags");
  if (!target) return;

  const difficulty = difficultyLabel(minutes);
  const dietInfo = diets.length ? `Diet: ${diets.slice(0, 3).join(", ")}` : "Diet: n/a";
  target.textContent = `${difficulty} • ${dietInfo}`;
}

function renderList(id, items, emptyMessage) {
  const list = document.getElementById(id);
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `<li>${emptyMessage}</li>`;
    return;
  }

  list.innerHTML = items.map((text) => `<li>${text}</li>`).join("");
}

function configureSourceButton(url) {
  const button = document.getElementById("view-original");
  if (!button) return;

  if (url) {
    button.disabled = false;
    button.addEventListener("click", () => {
      console.log("🔗 Öppnar originalrecept", url);
      window.open(url, "_blank", "noopener");
    });
  } else {
    button.disabled = true;
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
  const container = document.querySelector("main.container");
  if (container) {
    container.innerHTML = `<p class="empty-state">${message}</p>`;
  }
}
