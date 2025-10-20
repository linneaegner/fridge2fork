// ---------------------------------------------------------
// recipes.js – visar recept och ett enkelt svårighetsfilter
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";

// === Globala variabler ===================================
const widgetContainer = document.querySelector("#recipes-widget");

let allRecipes = [];         // Alla recept vi fått från API:t
let shownRecipes = [];       // Recept som just nu visas efter filter
let selectedDifficulty = ""; // Vald svårighetsnivå (Easy / Medium / Hard)

let gridEl = null;
let activeFiltersEl = null;
let matchedRecipesEl = null;
let clearFiltersBtn = null;
let difficultyButtons = [];

// === Startpunkt (körs från main.js) ======================
export async function startRecipesPage() {
  if (!widgetContainer) return; // Avbryt om sidan saknar widget

  buildWidgetHTML();
  cacheWidgetElements();
  connectEvents();

  const ingredients = loadIngredients();
  resetWidget(ingredients);

  const loaded = await fetchRecipes(ingredients);
  if (!loaded) return;

  applyDifficultyFilter();
}

// === Bygg upp widgeten ===================================
function buildWidgetHTML() {
  widgetContainer.innerHTML = `
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

function cacheWidgetElements() {
  gridEl = widgetContainer.querySelector("#recipes-grid");
  activeFiltersEl = widgetContainer.querySelector("#active-filters");
  matchedRecipesEl = widgetContainer.querySelector("#matched-recipes");
  clearFiltersBtn = widgetContainer.querySelector("#clear-filters");
  difficultyButtons = Array.from(
    widgetContainer.querySelectorAll("#filter-difficulty-buttons [data-difficulty]")
  );
}

function connectEvents() {
  difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => handleDifficultyClick(button.dataset.difficulty));
  });

  clearFiltersBtn?.addEventListener("click", async () => {
    selectedDifficulty = "";
    updateDifficultyButtons();

    const loaded = await fetchRecipes(loadIngredients());
    if (loaded) {
      applyDifficultyFilter();
    }
  });
}

// === Datahantering ======================================
async function fetchRecipes(ingredients) {
  try {
    allRecipes = await getRecipes({ ingredients });
    shownRecipes = allRecipes.slice();

    updateMatchedRecipes(shownRecipes.length);
    updateActiveFilterLabel();

    if (!allRecipes.length) {
      renderMessage("Inga recept hittades för de valda ingredienserna.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Recipes] Kunde inte hämta recept", error);
    allRecipes = [];
    shownRecipes = [];
    renderMessage("Kunde inte hämta recept just nu.");
    return false;
  }
}

function loadIngredients() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch {
    return [];
  }
}

// === Filtrering =========================================
function handleDifficultyClick(value) {
  selectedDifficulty = selectedDifficulty === value ? "" : value;
  updateDifficultyButtons();
  applyDifficultyFilter();
}

function applyDifficultyFilter() {
  shownRecipes = allRecipes.filter((recipe) => {
    if (!selectedDifficulty) return true;
    return getDifficulty(recipe.readyInMinutes) === selectedDifficulty;
  });

  if (!shownRecipes.length) {
    renderMessage("No recipes found for these filters.");
    updateMatchedRecipes(0);
    updateActiveFilterLabel();
    return;
  }

  renderRecipes(shownRecipes);
  updateMatchedRecipes(shownRecipes.length);
  updateActiveFilterLabel();
}

function updateDifficultyButtons() {
  difficultyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === selectedDifficulty);
  });
}

// === Rendering ==========================================
function renderRecipes(recipes) {
  if (!gridEl) return;

  gridEl.innerHTML = recipes
    .map((recipe) => {
      const summary = recipe.summary ? stripHtml(recipe.summary) : "";
      const dietsMarkup = formatDiets(recipe.diets);

      return `
        <article class="recipe-card card">
          <div class="recipe-card__media">
            <img
              src="${recipe.image}"
              alt="${recipe.title}"
            />
          </div>
          <div class="recipe-card__content">
            <h3 class="recipe-card__title">${recipe.title}</h3>
            ${summary ? `<p class="recipe-card__summary">${truncateText(summary)}</p>` : ""}
            <p class="recipe-card__diets">${dietsMarkup}</p>
            <dl class="recipe-card__meta">
              <div class="recipe-card__meta-item">
                <dt class="sr-only">Time</dt>
                <dd>
                  <span class="recipe-card__icon">⏱️</span>
                  ${formatMinutes(recipe.readyInMinutes)}
                </dd>
              </div>
              <div class="recipe-card__meta-item">
                <dt class="sr-only">Servings</dt>
                <dd>
                  <span class="recipe-card__icon">👥</span>
                  ${formatServings(recipe.servings)}
                </dd>
              </div>
            </dl>
          </div>
          <footer class="recipe-card__footer">
            <a href="recipe-details.html?recipeId=${recipe.id}" class="btn-primary">View Recipe</a>
          </footer>
        </article>
      `;
    })
    .join("");

  announceStatus(`${recipes.length} recipes available.`);
}

function renderMessage(message) {
  if (!gridEl) return;
  gridEl.innerHTML = `<p class="empty-state">${message}</p>`;
  announceStatus(message);
}

function resetWidget(ingredients) {
  selectedDifficulty = "";
  updateDifficultyButtons();
  updateSelectedIngredientsLabel(ingredients);
  updateActiveFilterLabel();
  updateMatchedRecipes(0);
  renderMessage("Loading recipes...");
}

// === Uppdatera etiketter ================================
function updateSelectedIngredientsLabel(ingredients) {
  const ingredientsEl = document.querySelector("#selected-ingredients");
  if (!ingredientsEl) return;
  ingredientsEl.textContent = formatIngredientsList(ingredients);
}

function updateActiveFilterLabel() {
  if (!activeFiltersEl) return;
  activeFiltersEl.textContent = selectedDifficulty
    ? `Active Filters: ${selectedDifficulty}`
    : "No active filters";
}

function updateMatchedRecipes(count) {
  if (!matchedRecipesEl) return;
  matchedRecipesEl.textContent = `Matched Recipes: ${count}`;
}

// === Små hjälpfunktioner ================================
function getDifficulty(minutes) {
  if (!minutes) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

function formatMinutes(minutes) {
  if (!minutes || Number.isNaN(Number(minutes))) return "N/A";
  return `${minutes} mins`;
}

function formatServings(servings) {
  if (!servings || Number.isNaN(Number(servings))) return "N/A servings";
  const value = Number(servings);
  return `${value} ${value === 1 ? "serving" : "servings"}`;
}

function formatDiets(diets = []) {
  if (!Array.isArray(diets) || !diets.length) return "";
  return diets
    .slice(0, 3)
    .map((diet) => `<span class="recipe-card__diet-tag">${capitalizeWords(diet)}</span>`)
    .join("");
}

function formatIngredientsList(list) {
  if (!list.length) return "no ingredients selected";
  if (list.length === 1) return list[0];
  const last = list[list.length - 1];
  return `${list.slice(0, -1).join(", ")} and ${last}`;
}

function truncateText(text, maxLength = 120) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

function stripHtml(html = "") {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

function capitalizeWords(text = "") {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function announceStatus(message) {
  console.log(message);
}
