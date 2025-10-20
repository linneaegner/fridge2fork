// ---------------------------------------------------------
// recipes.js – show recipes and filter by difficulty
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";

// === HTML elements ======================================
const recipesWidget = document.querySelector("#recipes-widget");

let allRecipes = [];           // All recipes from API
let visibleRecipes = [];       // Recipes shown after filters
let currentDifficulty = "";    // "Easy", "Medium", or "Hard"

// Cached elements inside the widget
let recipeGrid;
let activeFilterText;
let matchedRecipesText;
let clearFilterButton;
let difficultyButtons;

// === Main function ======================================
export async function startRecipesPage() {
  if (!recipesWidget) return;

  createWidgetHTML();
  findElements();
  addEventListeners();

  const savedIngredients = getSavedIngredients();
  resetWidget(savedIngredients);

  const success = await loadRecipes(savedIngredients);
  if (success) filterByDifficulty();
}

// === Build the widget layout ============================
function createWidgetHTML() {
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

    <div id="recipes-grid" class="recipes-grid" role="list">
      <p class="empty-state">Loading recipes...</p>
    </div>
  `;
}

// === Cache DOM elements for quick access ================
function findElements() {
  activeFilterText = recipesWidget.querySelector("#active-filters");
  matchedRecipesText = recipesWidget.querySelector("#matched-recipes");
  clearFilterButton = recipesWidget.querySelector("#clear-filters");
  difficultyButtons = recipesWidget.querySelectorAll("#filter-difficulty-buttons [data-difficulty]");
  recipeGrid = recipesWidget.querySelector("#recipes-grid");
}

// === Set up click events ================================
function addEventListeners() {
  // When a difficulty button is clicked
  difficultyButtons.forEach((button) =>
    button.addEventListener("click", () =>
      handleDifficultyClick(button.dataset.difficulty)
    )
  );

  // When "Clear Filters" button is clicked
  clearFilterButton.addEventListener("click", async () => {
    currentDifficulty = "";
    updateDifficultyButtons();
    const success = await loadRecipes(getSavedIngredients());
    if (success) filterByDifficulty();
  });
}

// === Fetch data from API ================================
async function loadRecipes(ingredients) {
  try {
    allRecipes = await getRecipes({ ingredients });
    visibleRecipes = [...allRecipes];

    if (!allRecipes.length) {
      showMessage("No recipes found for these ingredients.");
      return false;
    }

    updateRecipeStatus();
    return true;
  } catch {
    showMessage("Could not load recipes right now.");
    allRecipes = [];
    return false;
  }
}

function getSavedIngredients() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch {
    return [];
  }
}

// === Filtering logic ====================================
function handleDifficultyClick(selectedLevel) {
  currentDifficulty = currentDifficulty === selectedLevel ? "" : selectedLevel;
  updateDifficultyButtons();
  filterByDifficulty();
}

function filterByDifficulty() {
  visibleRecipes = allRecipes.filter((recipe) =>
    currentDifficulty
      ? getRecipeDifficulty(recipe.readyInMinutes) === currentDifficulty
      : true
  );

  if (!visibleRecipes.length) {
    showMessage("No recipes found for this filter.");
    updateRecipeStatus(0);
    return;
  }

  renderRecipeCards(visibleRecipes);
  updateRecipeStatus(visibleRecipes.length);
}

function updateDifficultyButtons() {
  difficultyButtons.forEach((button) => {
    const isActive = button.dataset.difficulty === currentDifficulty;
    button.classList.toggle("active", isActive);
  });
}

// === Render recipes to the page =========================
function renderRecipeCards(recipes) {
  recipeGrid.innerHTML = recipes
    .map((recipe) => {
      const summary = recipe.summary ? shortenText(removeHTML(recipe.summary)) : "";
      const dietTags = formatDietList(recipe.diets);

      return `
        <article class="recipe-card">
          <header class="recipe-card-media">
            <img
              src="${recipe.image || "https://via.placeholder.com/640x360"}"
              alt="${recipe.title}"
            />
          </header>

          <div class="recipe-card-info">
            <h3 class="recipe-card-title">${recipe.title}</h3>
            ${summary ? `<p class="recipe-card-summary">${summary}</p>` : ""}

            <dl class="recipe-card-meta">
              <div class="recipe-card-meta-item">
                <dd>⏱️ ${formatMinutes(recipe.readyInMinutes)}</dd>
              </div>
              <div class="recipe-card-meta-item">
                <dd>👥 ${formatServings(recipe.servings)}</dd>
              </div>
            </dl>

            <p class="recipe-card-tags">${dietTags}</p>
          </div>

          <footer class="recipe-card-footer">
            <a href="recipe-details.html?recipeId=${recipe.id}" class="btn-primary">
              View Recipe
            </a>
          </footer>
        </article>
      `;
    })
    .join("");
}

// === Show info messages (loading, no results) ============
function showMessage(message) {
  recipeGrid.innerHTML = `<p class="empty-state">${message}</p>`;
}

// === Reset UI before fetching data =======================
function resetWidget(ingredients) {
  currentDifficulty = "";
  updateDifficultyButtons();
  showSelectedIngredients(ingredients);
  updateRecipeStatus(0);
  showMessage("Loading recipes...");
}

// === Update labels and status text ======================
function showSelectedIngredients(ingredients) {
  const ingredientsLabel = document.querySelector("#selected-ingredients");
  if (ingredientsLabel)
    ingredientsLabel.textContent = formatIngredientList(ingredients);
}

function updateRecipeStatus(count = visibleRecipes.length) {
  activeFilterText.textContent = currentDifficulty
    ? `Active Filters: ${currentDifficulty}`
    : "No active filters";

  matchedRecipesText.textContent = `Matched Recipes: ${count}`;
}

// === Helper functions ===================================
function getRecipeDifficulty(minutes) {
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

function formatMinutes(minutes) {
  return minutes ? `${minutes} mins` : "N/A";
}

function formatServings(servings) {
  return servings
    ? `${servings} ${servings === 1 ? "serving" : "servings"}`
    : "N/A";
}

function formatDietList(diets = []) {
  return diets
    .slice(0, 3)
    .map((diet) => `<span class="recipe-card-tag">${capitalizeText(diet)}</span>`)
    .join("");
}

function formatIngredientList(list) {
  if (!list.length) return "no ingredients selected";
  if (list.length === 1) return list[0];
  const last = list.pop();
  return `${list.join(", ")} and ${last}`;
}

function shortenText(text) {
  return text.length > 140 ? text.slice(0, 140).trim() + "..." : text;
}

function removeHTML(html = "") {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || "";
}

function capitalizeText(text = "") {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
