// ---------------------------------------------------------
// recipes.js – show recipes and filter by difficulty
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";

const recipesWidget = document.querySelector("#recipes-widget");

let allRecipes = [];
let visibleRecipes = [];
let currentDifficulty = "";

// Cached elements
let recipeGrid, activeFilterText, matchedRecipesText, clearFilterButton, difficultyButtons;

export async function startRecipesPage() {
  if (!recipesWidget) return;

  buildWidgetHTML();
  cacheElements();
  setupEvents();

  const ingredients = loadSavedIngredients();
  resetWidget(ingredients);

  if (await fetchAndDisplayRecipes(ingredients)) filterRecipes();
}

// === DOM setup ==========================================
function buildWidgetHTML() {
  recipesWidget.innerHTML = `
    <form class="recipe-filters">
      <h2 class="filter-heading">Difficulty</h2>
      <div id="filter-difficulty-buttons" class="filter-buttons-container">
        ${["Easy", "Medium", "Hard"].map(
    (level) => `<button class="btn-secondary filter-button" type="button" data-difficulty="${level}">${level}</button>`
  ).join("")}
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

    <div id="recipes-grid" class="recipes-grid" role="list">
      <p class="empty-state">Loading recipes...</p>
    </div>
  `;
}

function cacheElements() {
  activeFilterText = recipesWidget.querySelector("#active-filters");
  matchedRecipesText = recipesWidget.querySelector("#matched-recipes");
  clearFilterButton = recipesWidget.querySelector("#clear-filters");
  difficultyButtons = recipesWidget.querySelectorAll("[data-difficulty]");
  recipeGrid = recipesWidget.querySelector("#recipes-grid");
}

function setupEvents() {
  difficultyButtons.forEach((btn) =>
    btn.addEventListener("click", () => toggleDifficulty(btn.dataset.difficulty))
  );

  clearFilterButton.addEventListener("click", async () => {
    currentDifficulty = "";
    updateActiveButton();
    if (await fetchAndDisplayRecipes(loadSavedIngredients())) filterRecipes();
  });
}

// === Data fetching ======================================
async function fetchAndDisplayRecipes(ingredients) {
  try {
    allRecipes = await getRecipes({ ingredients });
    visibleRecipes = [...allRecipes];

    if (!allRecipes.length) return showMessage("No recipes found."), false;

    updateRecipeStatus();
    return true;
  } catch {
    showMessage("Could not load recipes.");
    return false;
  }
}

const loadSavedIngredients = () =>
  JSON.parse(localStorage.getItem("ingredients") || "[]");

// === Filtering logic ====================================
function toggleDifficulty(level) {
  currentDifficulty = currentDifficulty === level ? "" : level;
  updateActiveButton();
  filterRecipes();
}

function filterRecipes() {
  visibleRecipes = allRecipes.filter(
    (r) => !currentDifficulty || getDifficulty(r.readyInMinutes) === currentDifficulty
  );

  if (!visibleRecipes.length) return showMessage("No recipes found for this filter."), updateRecipeStatus(0);

  renderRecipes(visibleRecipes);
  updateRecipeStatus(visibleRecipes.length);
}

function updateActiveButton() {
  difficultyButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.difficulty === currentDifficulty)
  );
}

// === Rendering ==========================================
function renderRecipes(recipes) {
  recipeGrid.innerHTML = recipes.map((r) => `
    <article class="recipe-card">
      <header class="recipe-card-media">
        <img src="${r.image || "https://via.placeholder.com/640x360"}" alt="${r.title}" />
      </header>
      <div class="recipe-card-info">
        <h3 class="recipe-card-title">${r.title}</h3>
        ${r.summary ? `<p class="recipe-card-summary">${truncate(stripHTML(r.summary))}</p>` : ""}
        <dl class="recipe-card-meta">
          <div class="recipe-card-meta-item"><dd>⏱️ ${formatTime(r.readyInMinutes)}</dd></div>
          <div class="recipe-card-meta-item"><dd>👥 ${formatServings(r.servings)}</dd></div>
        </dl>
        <p class="recipe-card-tags">${formatDiets(r.diets)}</p>
      </div>
      <footer class="recipe-card-footer">
        <a href="recipe-details.html?recipeId=${r.id}" class="btn-primary">View Recipe</a>
      </footer>
    </article>
  `).join("");
}

// === UI helpers =========================================
function showMessage(msg) {
  recipeGrid.innerHTML = `<p class="empty-state">${msg}</p>`;
}

function resetWidget(ingredients) {
  currentDifficulty = "";
  updateActiveButton();
  showIngredients(ingredients);
  updateRecipeStatus(0);
  showMessage("Loading recipes...");
}

function showIngredients(ingredients) {
  const label = document.querySelector("#selected-ingredients");
  if (label) label.textContent = formatIngredientList(ingredients);
}

function updateRecipeStatus(count = visibleRecipes.length) {
  activeFilterText.textContent = currentDifficulty
    ? `Active Filters: ${currentDifficulty}`
    : "No active filters";
  matchedRecipesText.textContent = `Matched Recipes: ${count}`;
}

// === Small helpers ======================================
const getDifficulty = (min) =>
  min <= 30 ? "Easy" : min <= 45 ? "Medium" : "Hard";

const formatTime = (min) => (min ? `${min} mins` : "N/A");

const formatServings = (s) => (s ? `${s} ${s === 1 ? "serving" : "servings"}` : "N/A");

const formatDiets = (d = []) =>
  d.slice(0, 3).map((t) => `<span class="recipe-card-tag">${capitalize(t)}</span>`).join("");

const formatIngredientList = (arr) =>
  !arr.length ? "no ingredients selected" :
    arr.length === 1 ? arr[0] : `${arr.slice(0, -1).join(", ")} and ${arr.at(-1)}`;

const truncate = (t) => t.length > 140 ? `${t.slice(0, 140).trim()}...` : t;

const stripHTML = (h = "") => new DOMParser().parseFromString(h, "text/html").body.textContent || "";

const capitalize = (txt = "") =>
  txt.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
