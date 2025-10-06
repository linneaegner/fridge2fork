// ---------------------------
// 🥘 RECIPE DETAILS PAGE
// Shows one recipe's full information
// ---------------------------

import { getRecipeDetails } from "./fetchdata.js";

document.addEventListener("DOMContentLoaded", loadRecipe);

async function loadRecipe() {
  const recipeId = new URLSearchParams(window.location.search).get("recipeId");
  if (!recipeId) {
    showMessage("No recipe found. Please go back and try again.");
    return;
  }

  try {
    const recipe = await getRecipeDetails(recipeId);
    renderRecipe(recipe);
  } catch {
    showMessage("Couldn't load recipe. Please try later.");
  }
}

function renderRecipe(recipe) {
  document.getElementById("recipe-image").src =
    recipe.image || "https://via.placeholder.com/640x360?text=No+image";
  document.getElementById("recipe-title").textContent = recipe.title || "Untitled";
  document.getElementById("recipe-summary").textContent =
    plainText(recipe.summary) || "No description available.";
  document.getElementById("recipe-time").textContent =
    recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Unknown";
  document.getElementById("recipe-servings").textContent =
    recipe.servings ? `${recipe.servings} servings` : "Flexible servings";
  document.getElementById("recipe-tags").textContent =
    `${getDifficulty(recipe.readyInMinutes)} • ${recipe.diets?.join(", ") || "n/a"}`;

  renderList("ingredients-list", recipe.extendedIngredients?.map((i) => i.original));
  renderList(
    "instructions-list",
    recipe.analyzedInstructions?.[0]?.steps?.map((s) => s.step)
  );

  const btn = document.getElementById("view-original-btn");
  if (recipe.sourceUrl) {
    btn.addEventListener("click", () => window.open(recipe.sourceUrl, "_blank"));
  } else {
    btn.disabled = true;
    btn.textContent = "Original recipe unavailable";
  }
}

// --- Helpers ---
function renderList(id, items = []) {
  const list = document.getElementById(id);
  if (!list) return;
  list.innerHTML = items.length
    ? items.map((text) => `<li>${text}</li>`).join("")
    : "<li>Not available.</li>";
}

function plainText(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || "";
}

function getDifficulty(mins) {
  if (!mins) return "Easy";
  if (mins <= 30) return "Easy";
  if (mins <= 45) return "Medium";
  return "Hard";
}

function showMessage(msg) {
  const main = document.querySelector("main");
  main.innerHTML = `<p class="empty-state">${msg}</p>`;
}
