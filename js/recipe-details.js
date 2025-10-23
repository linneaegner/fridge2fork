// ---------------------------------------------------------
// recipe-details.js – Show details for a single recipe
// ---------------------------------------------------------

import { getRecipeDetails } from "./fetchdata.js";

// === Globala element =====================================
const widget = document.querySelector("#recipe-details-widget");
const statusLabel = document.querySelector("#recipe-details-status");

// === Start =================================================
export async function startRecipeDetailsPage() {
  if (!widget) return;

  setStatus("Loading recipe...");

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
    setStatus(`${recipe.title || "Recipe"} loaded.`);
  } catch {
    showMessage("Could not load recipe details.");
  }
}

// === Visa meddelande ======================================
function showMessage(text) {
  if (!widget) return;
  widget.innerHTML = `<p class="empty-state">${text}</p>`;
  setStatus(text);
}

function setStatus(text) {
  if (statusLabel) statusLabel.textContent = text;
}

// === Visa receptet ========================================
function renderRecipe(r) {

  widget.innerHTML = `
    <article class="recipe">
      <h1 class="recipe-title">${r.title || "Untitled recipe"}</h1>

      <div class="recipe-image-container">
        <img class="recipe-image"
          src="${r.image || "https://via.placeholder.com/640x360?text=No+image"}"
          alt="${r.title || "Recipe image"}"
        />
      </div>

      <p class="recipe-summary">${cleanText(r.summary)}</p>

      <dl class="recipe-stats">
        <div class="recipe-stat"><dd>⏱️ ${formatTime(r.readyInMinutes)}</dd></div>
        <div class="recipe-stat"><dd>👥 ${formatServings(r.servings)}</dd></div>
      </dl>

      <div class="recipe-tags">${formatDietTags(r.diets)}</div>

      <button id="view-original-btn" class="btn btn--primary btn--view-original" type="button">
        View Original Recipe
      </button>
    </article>

    <section class="recipe-content">
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
    r.extendedIngredients?.map(i => i.original),
    "No ingredients found."
  );

  renderList(
    "instructions-list",
    r.analyzedInstructions?.[0]?.steps?.map(s => s.step),
    "No instructions found."
  );

  setupSourceButton(r.sourceUrl);
}

// === Visa lista eller fallback =============================
function renderList(id, items = [], emptyMessage) {
  const list = document.querySelector(`#${id}`);
  if (!list) return;
  list.innerHTML = items.length
    ? items.map(item => `<li>${item}</li>`).join("")
    : `<li>${emptyMessage}</li>`;
}

// === "View Original Recipe"-knapp =========================
function setupSourceButton(url) {
  const button = document.querySelector("#view-original-btn");
  if (!button) return;

  if (url) {
    button.textContent = "View Original Recipe";
    button.disabled = false;
    button.onclick = () => window.open(url, "_blank", "noopener");
  } else {
    button.textContent = "Original recipe not available";
    button.disabled = true;
    setStatus("Original recipe link not available.");
  }
}

// === Hjälpfunktioner ======================================
function cleanText(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || "";
  return text.trim();
}

function formatTime(min) {
  return min ? `${min} ${min === 1 ? "min" : "mins"}` : "N/A";
}

function formatServings(s) {
  if (!s) return "N/A";
  return s === 1 ? "1 serving" : `${s} servings`;
}

function formatDietTags(diets = []) {
  if (!diets.length) return `<span class="recipe-tag">Diet: None</span>`;
  return diets
    .slice(0, 4)
    .map(d => `<span class="recipe-tag">${capitalize(d)}</span>`)
    .join("");
}

function capitalize(text = "") {
  return text
    .split(" ")
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
