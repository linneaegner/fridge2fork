import { getRecipeDetails } from "./fetchdata.js";
import {
  cleanText,
  formatTime,
  formatServings,
  formatDietTags,
} from "./recipe-utils.js";
const widget = document.querySelector("#recipe-details-widget");
export async function startRecipeDetailsPage() {
  if (!widget) return;
  const recipeId = new URLSearchParams(window.location.search).get("recipeId");
  if (!recipeId) {
    showMessage("No recipe selected.");
    return;
  }
  try {
    const recipe = await getRecipeDetails(recipeId);
    if (!recipe) {
      showMessage("Could not find recipe.");
      return;
    }
    renderRecipe(recipe);
  } catch {
    showMessage("Could not load recipe details.");
  }
}
function showMessage(text) {
  if (!widget) return;
  widget.innerHTML = `<p class="empty-state">${text}</p>`;
}
function renderRecipe(r) {
  widget.innerHTML = `
    <section class="recipe">
      <h1 class="recipe-title">${r.title}</h1>

      <div class="recipe-image-container">
        <img class="recipe-image"
          src="${
            r.image || "https://via.placeholder.com/640x360?text=No+image"
          }"
          alt="${r.title || "Recipe image"}"
          fetchpriority="high"
        />
      </div>

      <p class="recipe-summary">${cleanText(r.summary)}</p>

      <dl class="recipe-stats">
        <div class="recipe-stat"><dd>⏱️ ${formatTime(
          r.readyInMinutes
        )}</dd></div>
        <div class="recipe-stat"><dd>👥 ${formatServings(r.servings)}</dd></div>
      </dl>

      <div class="recipe-tags">${formatDietTags(r.diets)}</div>

      <button id="view-original-recipe-btn" class="btn btn--primary btn--view-original-recipe" type="button">
        View Original Recipe
      </button>
    </section>

    <section class="recipe-cooking">
      <div class="card">
        <h2>Ingredients</h2>
        <ul id="ingredients-list"></ul>
      </div>

      <div class="card">
        <h2>Instructions</h2>
        <ol id="instructions-list"></ol>
      </div>
    </section>
  `;
  renderList(
    "ingredients-list",
    r.extendedIngredients?.map((i) => i.original),
    "No ingredients found."
  );
  renderList(
    "instructions-list",
    r.analyzedInstructions?.[0]?.steps?.map((s) => s.step),
    "No instructions found."
  );
  setupSourceButton(r.sourceUrl);
}
function renderList(id, items = [], emptyMessage) {
  const list = document.querySelector(`#${id}`);
  if (!list) return;
  list.innerHTML = items.length
    ? items.map((item) => `<li>${item}</li>`).join("")
    : `<li>${emptyMessage}</li>`;
}
function setupSourceButton(url) {
  const button = document.querySelector("#view-original-recipe-btn");
  if (!button) return;
  if (url) {
    button.textContent = "View Original Recipe";
    button.disabled = !1;
    button.onclick = () => window.open(url, "_blank", "noopener");
  } else {
    button.textContent = "Original recipe not available";
    button.disabled = !0;
  }
}
