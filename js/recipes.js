// ---------------------------------------------------------
// recipes.js – Show recipes and filter by difficulty
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";

// === Global variables ===================================
const recipesWidget = document.querySelector("#recipes-widget");

// Här sparar vi recepten
let allRecipes = [];          // Alla recept från API
let visibleRecipes = [];      // De som visas just nu (efter filter)
let currentDifficulty = "";   // "Easy", "Medium", "Hard" eller tomt

// HTML-element som vi använder ofta
let recipeGrid;
let activeFilterText;
let matchedRecipesText;
let clearFilterButton;
let difficultyButtons;

// === Startpunkt =========================================
export async function startRecipesPage() {
  if (!recipesWidget) return; // Avsluta om elementet inte finns

  buildWidgetHTML();   // Skapa själva layouten (filter, grid osv)
  cacheElements();     // Hitta viktiga element i DOM:en
  setupEvents();       // Lägg till klickhändelser

  const ingredients = loadSavedIngredients(); // Ingredienser från localStorage
  resetWidget(ingredients);                   // Nollställ UI:t

  // Hämta recept och visa dem om allt gick bra
  const success = await fetchAndDisplayRecipes(ingredients);
  if (success) {
    filterRecipes();
  }
}

// === Skapa layout ========================================
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

    <div id="recipes-grid" class="recipes-grid" role="list">
      <p class="empty-state">Loading recipes...</p>
    </div>
  `;
}

// === Hämta element från DOM ==============================
function cacheElements() {
  activeFilterText = recipesWidget.querySelector("#active-filters");
  matchedRecipesText = recipesWidget.querySelector("#matched-recipes");
  clearFilterButton = recipesWidget.querySelector("#clear-filters");
  difficultyButtons = recipesWidget.querySelectorAll("[data-difficulty]");
  recipeGrid = recipesWidget.querySelector("#recipes-grid");
}

// === Händelser (Event listeners) =========================
function setupEvents() {
  // Klick på en "difficulty"-knapp
  difficultyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      toggleDifficulty(button.dataset.difficulty);
    });
  });

  // Klick på "Clear Filters"
  clearFilterButton.addEventListener("click", async function () {
    currentDifficulty = "";        // Rensa vald svårighet
    updateActiveButton();          // Uppdatera knappstilar
    const success = await fetchAndDisplayRecipes(loadSavedIngredients());
    if (success) {
      filterRecipes();
    }
  });
}

// === Hämta recept från API ===============================
async function fetchAndDisplayRecipes(ingredients) {
  try {
    allRecipes = await getRecipes({ ingredients });
    visibleRecipes = [...allRecipes];

    if (allRecipes.length === 0) {
      showMessage("No recipes found.");
      return false;
    }

    updateRecipeStatus();
    return true;
  } catch (error) {
    showMessage("Could not load recipes right now.");
    return false;
  }
}

// === Hämta ingredienser från localStorage ================
function loadSavedIngredients() {
  const saved = localStorage.getItem("ingredients");
  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

// === Hantera svårighetsfilter ============================
function toggleDifficulty(level) {
  // Om man klickar på samma nivå igen, ta bort filtret
  if (currentDifficulty === level) {
    currentDifficulty = "";
  } else {
    currentDifficulty = level;
  }

  updateActiveButton();
  filterRecipes();
}

function filterRecipes() {
  // Filtrera recepten baserat på svårighetsnivå
  visibleRecipes = allRecipes.filter(function (recipe) {
    if (currentDifficulty === "") {
      return true; // Visa alla om inget filter är valt
    }

    const difficulty = getDifficulty(recipe.readyInMinutes);
    return difficulty === currentDifficulty;
  });

  if (visibleRecipes.length === 0) {
    showMessage("No recipes found for this filter.");
    updateRecipeStatus(0);
    return;
  }

  renderRecipes(visibleRecipes);
  updateRecipeStatus(visibleRecipes.length);
}

function updateActiveButton() {
  difficultyButtons.forEach(function (button) {
    const isActive = button.dataset.difficulty === currentDifficulty;
    button.classList.toggle("active", isActive);
  });
}

// === Visa recept på sidan ================================
function renderRecipes(recipes) {
  const recipeHTML = recipes.map(function (r) {
    const summary = r.summary ? truncate(stripHTML(r.summary)) : "";
    const dietTags = formatDiets(r.diets);

    return `
      <article class="recipe-card">
        <header class="recipe-card-media">
          <img src="${r.image || "https://via.placeholder.com/640x360"}" alt="${r.title}" />
        </header>
        <div class="recipe-card-info">
          <h3 class="recipe-card-title">${r.title}</h3>
          ${summary ? `<p class="recipe-card-summary">${summary}</p>` : ""}
          <dl class="recipe-card-meta">
            <div class="recipe-card-meta-item"><dd>⏱️ ${formatTime(r.readyInMinutes)}</dd></div>
            <div class="recipe-card-meta-item"><dd>👥 ${formatServings(r.servings)}</dd></div>
          </dl>
          <p class="recipe-card-tags">${dietTags}</p>
        </div>
        <footer class="recipe-card-footer">
          <a href="recipe-details.html?recipeId=${r.id}" class="btn-primary">View Recipe</a>
        </footer>
      </article>
    `;
  });

  recipeGrid.innerHTML = recipeHTML.join("");
}

// === UI-hjälpfunktioner =================================
function showMessage(message) {
  recipeGrid.innerHTML = `<p class="empty-state">${message}</p>`;
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
  if (label) {
    label.textContent = formatIngredientList(ingredients);
  }
}

function updateRecipeStatus(count = visibleRecipes.length) {
  if (currentDifficulty) {
    activeFilterText.textContent = "Active Filters: " + currentDifficulty;
  } else {
    activeFilterText.textContent = "No active filters";
  }

  matchedRecipesText.textContent = "Matched Recipes: " + count;
}

// === Små hjälpfunktioner ================================
function getDifficulty(minutes) {
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

function formatTime(minutes) {
  if (!minutes) return "N/A";
  return minutes + " mins";
}

function formatServings(servings) {
  if (!servings) return "N/A";
  if (servings === 1) return "1 serving";
  return servings + " servings";
}

function formatDiets(diets = []) {
  const firstThree = diets.slice(0, 3);
  const tags = firstThree.map(function (diet) {
    return `<span class="recipe-card-tag">${capitalize(diet)}</span>`;
  });
  return tags.join("");
}

function formatIngredientList(list) {
  if (list.length === 0) return "no ingredients selected";
  if (list.length === 1) return list[0];

  const allButLast = list.slice(0, -1).join(", ");
  const last = list[list.length - 1];
  return allButLast + " and " + last;
}

function truncate(text) {
  if (text.length > 140) {
    return text.slice(0, 140).trim() + "...";
  }
  return text;
}

function stripHTML(html = "") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function capitalize(text = "") {
  return text
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
