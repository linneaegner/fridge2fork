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
        <button class="btn btn--secondary filter-button" type="button" data-difficulty="Easy">Easy</button>
        <button class="btn btn--secondary filter-button" type="button" data-difficulty="Medium">Medium</button>
        <button class="btn btn--secondary filter-button" type="button" data-difficulty="Hard">Hard</button>
      </div>
    </form>

    <div class="filter-summary-container">
      <div class="filter-summary-details">
        <span id="active-filters">No active filters</span>
        <span>•</span>
        <span id="matched-recipes">Matched Recipes: 0</span>
      </div>
      <button id="clear-filters" class="btn btn--clear clear-filters-button" type="button">
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

  clearFilterButton.addEventListener("click", () => {
    currentDifficulty = "";
    updateActiveButton();
    filterRecipes();
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
    return `
      <article class="card recipe-article">
        <div class="recipe-image-container">
          <img class="recipe-image"
            src="${r.image || "https://via.placeholder.com/640x360"}"
            alt="${r.title}"
          />
        </div>
        
        <h3 class="recipe-title">${r.title}</h3>

        <p class="recipe-summary">${cleanText(r.summary)}</p>

        <dl class="recipe-stats">
          <div class="recipe-stat"><dd>⏱️ ${formatTime(r.readyInMinutes)}</dd></div>
          <div class="recipe-stat"><dd>👥 ${formatServings(r.servings)}</dd></div>
        </dl>
        
        <div class="recipe-tags">${formatDietTags(r.diets)}</div>

        <button class="btn btn--primary btn--view-recipe-details" type="button" data-recipe-id="${r.id}">
          View Recipe
        </button>
      </article>
    `;
  }).join("");

  recipeGrid.querySelectorAll(".btn--view-recipe-details").forEach(btn => {
    btn.addEventListener("click", () => {
      const recipeId = btn.dataset.recipeId;
      if (recipeId) window.location.href = `recipe-details.html?recipeId=${recipeId}`;
    });
  });
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
function cleanText(html = "") {
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

function formatIngredientList(list) {
  if (list.length === 0) return "no ingredients selected";
  if (list.length === 1) return list[0];
  const items = [...list];
  const last = items.pop();
  return `${items.join(", ")} and ${last}`;
}

function capitalize(text = "") {
  return text.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function formatDietTags(diets = []) {
  if (!diets.length) return `<span class="recipe-tag">Diet: None</span>`;
  return diets
    .slice(0, 4)
    .map(d => `<span class="recipe-tag">${capitalize(d)}</span>`)
    .join("");
}
