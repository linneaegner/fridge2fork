// ---------------------------------------------------------
// recipes.js – Show recipes and filter by difficulty
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";

// === Globala variabler ==================================
const recipesWidget = document.querySelector("#recipes-widget");
let allRecipes = [];
let visibleRecipes = [];
let currentDifficulty = "";

let recipeGrid;
let activeFilterText;
let matchedRecipesText;
let clearFilterButton;
let difficultyButtons;

// === Startpunkt =========================================
export async function startRecipesPage() {
  if (!recipesWidget) return;

  buildWidgetHTML();
  cacheElements();
  setupEvents();

  const ingredients = getSavedIngredients();
  resetWidget(ingredients);

  const success = await loadRecipes(ingredients);
  if (success) filterRecipes();
}

// === Bygg layout =========================================
function buildWidgetHTML() {
  recipesWidget.innerHTML = `
    <form class="recipe-filters">
      <h2 class="filter-heading">Difficulty</h2>
      <div id="filter-difficulty-buttons" class="filter-buttons-container">
        <button class="btn-secondary filter-button" type="button" data-difficulty="Easy">Easy</button>
        <button class="btn-secondary filter-button" type="button" data-difficulty="Medium">Medium</button>
        <button class="btn-secondary filter-button" type="button" data-difficulty="Hard">Hard</button>
      </div>
    </form>

    <div class="filter-summary-container">
      <div class="filter-summary-details">
        <span id="active-filters">No active filters</span>
        <span>•</span>
        <span id="matched-recipes">Matched Recipes: 0</span>
      </div>
      <button id="clear-filters" class="btn-secondary clear-filters-button" type="button">
        Clear Filters
      </button>
    </div>

    <div id="recipes-grid" class="recipes-grid">
      <p class="empty-state">Loading recipes...</p>
    </div>
  `;
}

// === Hämta element =======================================
function cacheElements() {
  activeFilterText = recipesWidget.querySelector("#active-filters");
  matchedRecipesText = recipesWidget.querySelector("#matched-recipes");
  clearFilterButton = recipesWidget.querySelector("#clear-filters");
  difficultyButtons = recipesWidget.querySelectorAll("[data-difficulty]");
  recipeGrid = recipesWidget.querySelector("#recipes-grid");
}

// === Händelser ===========================================
function setupEvents() {
  difficultyButtons.forEach(btn =>
    btn.addEventListener("click", () => toggleDifficulty(btn.dataset.difficulty))
  );

  clearFilterButton.addEventListener("click", async () => {
    currentDifficulty = "";
    updateActiveButton();
    const success = await loadRecipes(getSavedIngredients());
    if (success) filterRecipes();
  });
}

// === Ladda recept från API ===============================
async function loadRecipes(ingredients) {
  try {
    allRecipes = await getRecipes({ ingredients });
    visibleRecipes = [...allRecipes];

    if (!allRecipes.length) {
      showMessage("No recipes found.");
      return false;
    }

    updateRecipeCount();
    return true;
  } catch {
    showMessage("Could not load recipes right now.");
    return false;
  }
}

// === Hämta sparade ingredienser ==========================
function getSavedIngredients() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch {
    return [];
  }
}

// === Filtrering ==========================================
function toggleDifficulty(level) {
  currentDifficulty = currentDifficulty === level ? "" : level;
  updateActiveButton();
  filterRecipes();
}

function filterRecipes() {
  visibleRecipes = allRecipes.filter(recipe =>
    currentDifficulty === "" ? true : getDifficulty(recipe.readyInMinutes) === currentDifficulty
  );

  if (!visibleRecipes.length) {
    showMessage("No recipes found for this filter.");
    updateRecipeCount(0);
    return;
  }

  renderRecipes(visibleRecipes);
  updateRecipeCount(visibleRecipes.length);
}

function updateActiveButton() {
  difficultyButtons.forEach(btn =>
    btn.classList.toggle("active", btn.dataset.difficulty === currentDifficulty)
  );
}

// === Visa recept =========================================
function renderRecipes(recipes) {
  recipeGrid.innerHTML = recipes.map(r => {
    const summary = r.summary ? cleanSummary(r.summary) : "";
    const diets = formatDiets(r.diets);

    return `
      <article class="recipe-card">
        <header class="recipe-card-head">
          <img src="${r.image || "https://via.placeholder.com/640x360"}" alt="${r.title}" />
        </header>
        <div class="recipe-card-body">
          <h3 class="recipe-card-title">${r.title}</h3>
          ${summary ? `<p class="recipe-card-summary">${summary}</p>` : ""}
          <dl class="recipe-card-stats">
            <div class="recipe-card-stat"><dd>⏱️ ${formatTime(r.readyInMinutes)}</dd></div>
            <div class="recipe-card-stat"><dd>👥 ${formatServings(r.servings)}</dd></div>
          </dl>
          <p class="recipe-card-badges">${diets}</p>
        </div>
        <footer class="recipe-card-footer">
          <a href="recipe-details.html?recipeId=${r.id}" class="btn-primary">View Recipe</a>
        </footer>
      </article>
    `;
  }).join("");
}

// === UI-hjälp ============================================
function showMessage(text) {
  recipeGrid.innerHTML = `<p class="empty-state">${text}</p>`;
}

function resetWidget(ingredients) {
  currentDifficulty = "";
  updateActiveButton();
  showSelectedIngredients(ingredients);
  updateRecipeCount(0);
  showMessage("Loading recipes...");
}

function showSelectedIngredients(ingredients) {
  const label = document.querySelector("#selected-ingredients");
  if (label) label.textContent = formatIngredientList(ingredients);
}

function updateRecipeCount(count = visibleRecipes.length) {
  activeFilterText.textContent = currentDifficulty
    ? `Active Filters: ${currentDifficulty}`
    : "No active filters";
  matchedRecipesText.textContent = `Matched Recipes: ${count}`;
}

// === Hjälpfunktioner =====================================
function getDifficulty(minutes) {
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

// Gör texten kort och tar bort HTML-taggar
function cleanSummary(html = "") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const text = doc.body.textContent || "";
  return text.length > 140 ? text.slice(0, 140).trim() + "..." : text;
}

function formatTime(min) {
  return min ? `${min} mins` : "N/A";
}

function formatServings(servings) {
  if (!servings) return "N/A";
  return servings === 1 ? "1 serving" : `${servings} servings`;
}

function formatDiets(diets = []) {
  return diets.slice(0, 3)
    .map(d => `<span class="recipe-card-badge">${capitalize(d)}</span>`)
    .join("");
}

function formatIngredientList(list) {
  if (list.length === 0) return "no ingredients selected";
  if (list.length === 1) return list[0];
  const last = list.pop();
  return `${list.join(", ")} and ${last}`;
}

function capitalize(text = "") {
  return text.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}
