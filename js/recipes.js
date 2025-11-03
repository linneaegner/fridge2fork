// IMPORTS
import { getRecipes } from "./fetchdata.js";
import {
  cleanText,
  formatTime,
  formatServings,
  formatDietTags,
} from "./recipe-utils.js";

// STATE (samlar allt relaterat till sidan)
const state = {
  allRecipes: [],
  visibleRecipes: [],
  currentDifficulty: "",
  elements: {},
};

// MAIN ENTRY POINT
export async function startRecipesPage() {
  const widget = document.querySelector("#recipes-widget");
  if (!widget) return;

  renderLayout(widget);
  cacheElements(widget);
  setupEvents();

  const ingredients = loadSavedIngredients();
  renderSelectedIngredients(ingredients);
  showMessage("Loading recipes...");

  const success = await loadRecipes(ingredients);
  if (success) updateRecipesView();
}

// -------------------------------------------------------------
// BUILD & CACHE DOM
// -------------------------------------------------------------
function renderLayout(container) {
  container.innerHTML = `
    <form class="recipe-filters">
      <h2 class="filter-heading">Difficulty</h2>
      <div id="filter-difficulty-buttons" class="filter-buttons-container">
        <button class="btn btn--secondary filter-button" type="button" data-difficulty="Easy" aria-pressed="false">Easy</button>
        <button class="btn btn--secondary filter-button" type="button" data-difficulty="Medium" aria-pressed="false">Medium</button>
        <button class="btn btn--secondary filter-button" type="button" data-difficulty="Hard" aria-pressed="false">Hard</button>
      </div>
    </form>

    <div class="filter-summary-container">
      <div class="filter-summary-details">
        <span id="active-filters">No active filters</span>
        <span class="filter-summary-separator" aria-hidden="true"></span>
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

function cacheElements(container) {
  state.elements = {
    activeFilterText: container.querySelector("#active-filters"),
    matchedRecipesText: container.querySelector("#matched-recipes"),
    clearFilterButton: container.querySelector("#clear-filters"),
    difficultyButtons: container.querySelectorAll("[data-difficulty]"),
    recipeGrid: container.querySelector("#recipes-grid"),
  };
}

// -------------------------------------------------------------
// EVENTS
// -------------------------------------------------------------
function setupEvents() {
  const { difficultyButtons, clearFilterButton } = state.elements;

  difficultyButtons.forEach((btn) =>
    btn.addEventListener("click", () => handleDifficultyClick(btn))
  );

  clearFilterButton.addEventListener("click", clearFilters);
}

function handleDifficultyClick(button) {
  const { difficulty } = button.dataset;
  state.currentDifficulty =
    state.currentDifficulty === difficulty ? "" : difficulty;
  updateRecipesView();
}

function clearFilters() {
  state.currentDifficulty = "";
  updateRecipesView();
}

// -------------------------------------------------------------
// DATA FETCHING & STORAGE
// -------------------------------------------------------------
function loadSavedIngredients() {
  try {
    const ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    console.log("Loaded ingredients from localStorage:", ingredients);
    return ingredients;
  } catch (error) {
    console.error("Error loading saved ingredients:", error);
    return [];
  }
}

async function loadRecipes(ingredients) {
  try {
    state.allRecipes = await getRecipes({ ingredients });
    console.log("Fetched recipes:", state.allRecipes);
    if (!state.allRecipes.length) {
      showMessage("No recipes found.");
      console.log("No recipes found for the given ingredients.");
      return false;
    }
    return true;
  } catch (error) {
    showMessage("Could not load recipes right now.");
    console.error("Error fetching recipes:", error);
    return false;
  }
}

// -------------------------------------------------------------
// RENDERING & FILTERING
// -------------------------------------------------------------
function updateRecipesView() {
  const recipes = filterRecipes(state.allRecipes);
  renderRecipes(recipes);
  updateRecipeSummary(recipes.length);
}

function filterRecipes(recipes) {
  if (!state.currentDifficulty) return recipes;

  return recipes.filter((recipe) => getDifficulty(recipe) === state.currentDifficulty);
}

function getDifficulty(recipe) {
  if (recipe.readyInMinutes <= 30) return "Easy";
  if (recipe.readyInMinutes <= 45) return "Medium";
  return "Hard";
}

function renderRecipes(recipes) {
  const { recipeGrid, difficultyButtons } = state.elements;

  difficultyButtons.forEach((btn) => {
    const isActive = btn.dataset.difficulty === state.currentDifficulty;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  if (!recipes.length) {
    showMessage("No recipes found for this filter.");
    return;
  }

  recipeGrid.innerHTML = recipes
    .map(
      (r) => `
      <article class="card recipe-article">
        <div class="recipe-image-container">
          <img class="recipe-image"
            src="${r.image || "https://via.placeholder.com/640x360"}"
            alt="${r.title}"
            fetchpriority="high"
          />
        </div>
        <h3 class="recipe-title">${r.title}</h3>
        <p class="recipe-summary">${cleanText(r.summary, { maxLength: 140 })}</p>
        <dl class="recipe-stats">
          <div class="recipe-stat">
            <dt class="sr-only">Total time</dt>
            <dd>⏱️ ${formatTime(r.readyInMinutes)}</dd>
          </div>
          <div class="recipe-stat">
            <dt class="sr-only">Servings</dt>
            <dd>👥 ${formatServings(r.servings)}</dd>
          </div>
        </dl>
        <div class="recipe-tags">${formatDietTags(r.diets)}</div>
        <button class="btn btn--primary btn--view-recipe-details" type="button" data-recipe-id="${r.id}">
          View Recipe
        </button>
      </article>
    `
    )
    .join("");

  recipeGrid
    .querySelectorAll(".btn--view-recipe-details")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.dataset.recipeId;
        if (id) window.location.href = `recipe-details.html?recipeId=${id}`;
      })
    );
}

function showMessage(text) {
  state.elements.recipeGrid.innerHTML = `<p class="empty-state">${text}</p>`;
}

function renderSelectedIngredients(ingredients) {
  const label = document.querySelector("#selected-ingredients");
  if (label) label.textContent = formatIngredientList(ingredients);
}

function updateRecipeSummary(count) {
  const { activeFilterText, matchedRecipesText } = state.elements;

  activeFilterText.textContent = state.currentDifficulty
    ? `Active Filters: ${state.currentDifficulty}`
    : "No active filters";

  matchedRecipesText.textContent = `Matched Recipes: ${count}`;
}

function formatIngredientList(list) {
  if (list.length === 0) return "no ingredients selected";
  if (list.length === 1) return list[0];
  const last = list[list.length - 1];
  const rest = list.slice(0, -1);
  return `${rest.join(", ")} and ${last}`;
}
