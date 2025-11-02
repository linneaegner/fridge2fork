import { getRecipes } from "./fetchdata.js";
import {
  cleanText,
  formatTime,
  formatServings,
  formatDietTags,
} from "./recipe-utils.js";

const recipesWidget = document.querySelector("#recipes-widget");
let allRecipes = [];
let visibleRecipes = [];
let currentDifficulty = "";
let recipeGrid;
let activeFilterText;
let matchedRecipesText;
let clearFilterButton;
let difficultyButtons;

export async function startRecipesPage() {
  if (!recipesWidget) return;
  buildRecipesWidgetHTML();
  findElements();
  setupEvents();
  const ingredients = getSavedIngredients();
  resetWidget(ingredients);
  const success = await loadRecipes(ingredients);
  if (success) filterRecipes();
}

function buildRecipesWidgetHTML() {
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

function findElements() {
  activeFilterText = recipesWidget.querySelector("#active-filters");
  matchedRecipesText = recipesWidget.querySelector("#matched-recipes");
  clearFilterButton = recipesWidget.querySelector("#clear-filters");
  difficultyButtons = recipesWidget.querySelectorAll("[data-difficulty]");
  recipeGrid = recipesWidget.querySelector("#recipes-grid");
}

function setupEvents() {
  difficultyButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      currentDifficulty = btn.dataset.difficulty === currentDifficulty ? "" : btn.dataset.difficulty;
      updateActiveButton();
      filterRecipes();
    })
  );

  clearFilterButton.addEventListener("click", () => {
    currentDifficulty = "";
    updateActiveButton();
    filterRecipes();
  });
}

function getSavedIngredients() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch {
    return [];
  }
}

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

function resetWidget(ingredients) {
  currentDifficulty = "";
  updateActiveButton();
  showSelectedIngredients(ingredients);
  updateRecipeCount(0);
  showMessage("Loading recipes...");
}

function filterRecipes() {
  visibleRecipes = allRecipes.filter((recipe) =>
    currentDifficulty === ""
      ? true
      : getDifficulty(recipe.readyInMinutes) === currentDifficulty
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
  difficultyButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.difficulty === currentDifficulty)
  );
}

function renderRecipes(recipes) {
  recipeGrid.innerHTML = recipes
    .map((r) => {
      return `
      <article class="card recipe-article">
        <div class="recipe-image-container">
          <img class="recipe-image"
            src="${r.image || "https://via.placeholder.com/640x360"}"
            alt="${r.title}"
            fetchpriority="high"
          />
        </div>
        
        <h3 class="recipe-title">${r.title}</h3>

        <p class="recipe-summary">${cleanText(r.summary, {
          maxLength: 140,
        })}</p>

        <dl class="recipe-stats">
          <div class="recipe-stat"><dd>⏱️ ${formatTime(
            r.readyInMinutes
          )}</dd></div>
          <div class="recipe-stat"><dd>👥 ${formatServings(
            r.servings
          )}</dd></div>
        </dl>
        
        <div class="recipe-tags">${formatDietTags(r.diets)}</div>

        <button class="btn btn--primary btn--view-recipe-details" type="button" data-recipe-id="${
          r.id
        }">
          View Recipe
        </button>
      </article>
    `;
    })
    .join("");
  recipeGrid.querySelectorAll(".btn--view-recipe-details").forEach((btn) => {
    btn.addEventListener("click", () => {
      const recipeId = btn.dataset.recipeId;
      if (recipeId)
        window.location.href = `recipe-details.html?recipeId=${recipeId}`;
    });
  });
}

function showMessage(text) {
  recipeGrid.innerHTML = `<p class="empty-state">${text}</p>`;
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

function getDifficulty(minutes) {
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

function formatIngredientList(list) {
  if (list.length === 0) return "no ingredients selected";
  if (list.length === 1) return list[0];
  const items = [...list];
  const last = items.pop();
  return `${items.join(", ")} and ${last}`;
}
