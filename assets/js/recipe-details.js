import { getRecipeDetails } from "./fetchdata.js";
import {
  cleanText,
  formatTime,
  formatServings,
  formatDietTags,
} from "./recipe-utils.js";

export async function startRecipeDetailsPage() {
  const widget = document.querySelector("#recipe-details-widget");
  if (!widget) return;

  const recipeId = new URLSearchParams(window.location.search).get("recipeId");
  if (!recipeId) {
    showMessage(widget, "No recipe selected.");
    return;
  }

  showMessage(widget, "Loading recipe...");

  try {
    const recipe = await getRecipeDetails(recipeId);
    if (!recipe) {
      showMessage(widget, "Could not find recipe.");
      return;
    }
    renderRecipe(widget, recipe);
  } catch {
    showMessage(widget, "Could not load recipe details.");
  }
}

function renderRecipe(widget, recipe) {
  widget.innerHTML = `
    <section class="recipe">
      <h1 class="recipe-title">${recipe.title}</h1>

      <div class="recipe-image-container">
        <img
          class="recipe-image"
          src="${recipe.image || "https://via.placeholder.com/640x360?text=No+image"}"
          alt="${recipe.title || "Recipe image"}"
          fetchpriority="high"
        />
      </div>

      <p class="recipe-summary">${cleanText(recipe.summary)}</p>

      <dl class="recipe-stats">
        <div class="recipe-stat"><dd>&#x23F1; ${formatTime(recipe.readyInMinutes)}</dd></div>
        <div class="recipe-stat"><dd>&#x1F465; ${formatServings(recipe.servings)}</dd></div>
      </dl>

      <div class="recipe-tags">${formatDietTags(recipe.diets)}</div>

      <button id="view-original-recipe-btn" class="btn btn--primary" type="button">
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
    widget.querySelector("#ingredients-list"),
    recipe.extendedIngredients?.map((i) => i.original),
    "No ingredients found."
  );

  renderList(
    widget.querySelector("#instructions-list"),
    recipe.analyzedInstructions?.[0]?.steps?.map((s) => s.step),
    "No instructions found."
  );

  setupSourceButton(
    widget.querySelector("#view-original-recipe-btn"),
    recipe.sourceUrl
  );
}

function renderList(list, items = [], emptyMessage) {
  if (!list) return;

  list.innerHTML = items.length
    ? items.map((item) => `<li>${item}</li>`).join("")
    : `<li>${emptyMessage}</li>`;
}

function showMessage(widget, text) {
  widget.innerHTML = `<p class="empty-state">${text}</p>`;
}

function setupSourceButton(button, url) {
  if (!button) return;

  if (url) {
    button.textContent = "View Original Recipe";
    button.disabled = false;
    button.onclick = () => window.open(url, "_blank", "noopener");
  } else {
    button.textContent = "Original recipe not available";
    button.disabled = true;
  }
}
