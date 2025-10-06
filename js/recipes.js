import { getRecipes } from "./fetchdata.js";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x280?text=No+image";
const DETAILS_PAGE = "recipe-details.html";
const WIDGET_ID = "recipe-widget";
const DIET_FILTERS = [
  "gluten free",
  "ketogenic",
  "vegetarian",
  "vegan",
  "pescatarian",
  "paleo",
  "primal",
  "low fodmap",
  "dairy free",
  "whole30",
];

let widgetRoot = null;
let allRecipes = [];
let selectedDiets = [];
let selectedDifficulty = "";
let ingredientList = [];

document.addEventListener("DOMContentLoaded", initRecipePage);

async function initRecipePage() {
  widgetRoot = document.getElementById(WIDGET_ID);
  if (!widgetRoot) {
    console.warn("Hittade inte widget-roten – avbryter initiering");
    return;
  }

  renderLayout();
  ingredientList = readIngredients();
  updateIngredientLabel();
  buildDietButtons();
  bindDifficultyButtons();
  updateActiveFilterText();
  await loadRecipes();
}

function renderLayout() {
  widgetRoot.innerHTML = `
    <a class="back-link" href="../index.html">
      <span aria-hidden="true">&larr;</span>
      Back to search
    </a>

    <section class="hero">
      <p class="hero__eyebrow">Based on your ingredients</p>
      <h1 class="hero__title">
        Recipe <span class="highlight highlight--accent">Suggestions</span>
      </h1>
      <p class="hero__subtitle">
        Ingredients:
        <span id="selected-ingredients" class="hero__ingredients">your ingredients</span>
      </p>
    </section>

    <section class="filter-board card">
      <div class="filter-board__head">
        <h2 class="filter-board__title">Filter recipes</h2>
        <button id="clear-filters" class="filter-clear" type="button">
          Clear all
        </button>
      </div>
      <div class="filter-board__content">
        <div class="filter-group">
          <h3 class="filter-group__title">Dietary preferences</h3>
          <div id="dietary-options" class="filter-chip-row"></div>
        </div>
        <div class="filter-divider" role="presentation"></div>
        <div class="filter-group">
          <h3 class="filter-group__title">Difficulty level</h3>
          <div class="filter-chip-row">
            <button type="button" data-difficulty="easy" class="filter-chip difficulty-chip">Easy</button>
            <button type="button" data-difficulty="medium" class="filter-chip difficulty-chip">Medium</button>
            <button type="button" data-difficulty="hard" class="filter-chip difficulty-chip">Hard</button>
          </div>
        </div>
      </div>
    </section>

    <div id="filter-info" class="filter-summary" role="status" aria-live="polite">
      <p id="active-filters" class="filter-summary__item">No active filters</p>
      <p id="matched-recipes" class="filter-summary__item">Matches: 0</p>
    </div>

    <div id="recipe-grid" class="recipe-grid" role="list"></div>
  `;
}

function readIngredients() {
  try {
    const stored = localStorage.getItem("ingredients");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Kunde inte läsa ingredienser från localStorage", error);
    return [];
  }
}

function updateIngredientLabel() {
  const target = document.getElementById("selected-ingredients");
  if (!target) return;
  target.textContent = ingredientList.length ? ingredientList.join(", ") : "no ingredients selected";
}

async function loadRecipes() {
  try {
    allRecipes = await getRecipes({ ingredients: ingredientList, diets: selectedDiets });
    console.log("✅ Fick tillbaka", allRecipes.length, "recept");
    renderRecipes();
  } catch (error) {
    console.error("❌ Det gick inte att hämta recept", error);
    renderEmptyState("Unable to load recipes right now.");
  }
}

function renderRecipes() {
  const grid = document.getElementById("recipe-grid");
  if (!grid) return;

  const filtered = filterRecipes();
  updateMatchCount(filtered.length);

  if (!filtered.length) {
    renderEmptyState("No recipes match the current filters.");
    return;
  }

  grid.innerHTML = filtered.map(buildCard).join("");
  bindCardNavigation(grid);
}

function filterRecipes() {
  return allRecipes.filter((recipe) => {
    const matchesDiet = !selectedDiets.length || selectedDiets.every((diet) => recipe.diets?.includes(diet));
    const matchesDifficulty = !selectedDifficulty || difficultyLabel(recipe.readyInMinutes).toLowerCase() === selectedDifficulty;
    return matchesDiet && matchesDifficulty;
  });
}

function difficultyLabel(minutes) {
  if (!minutes || Number.isNaN(minutes)) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

function buildDietButtons() {
  const container = document.getElementById("dietary-options");
  if (!container) return;

  container.innerHTML = "";

  DIET_FILTERS.forEach((diet) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.textContent = diet.replace(/\b\w/g, (letter) => letter.toUpperCase());
    button.dataset.diet = diet;

    button.addEventListener("click", () => {
      if (selectedDiets.includes(diet)) {
        selectedDiets = selectedDiets.filter((name) => name !== diet);
        button.classList.remove("active");
      } else {
        selectedDiets.push(diet);
        button.classList.add("active");
      }
      console.log("🧮 Valda dieter", selectedDiets);
      updateActiveFilterText();
      renderRecipes();
    });

    container.appendChild(button);
  });

  const clearButton = document.getElementById("clear-filters");
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      selectedDiets = [];
      selectedDifficulty = "";
      container.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
      document.querySelectorAll(".difficulty-chip").forEach((btn) => btn.classList.remove("active"));
      console.log("🔄 Filter återställda");
      updateActiveFilterText();
      renderRecipes();
    });
  }
}

function bindDifficultyButtons() {
  const buttons = document.querySelectorAll(".difficulty-chip");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const level = button.dataset.difficulty;
      selectedDifficulty = selectedDifficulty === level ? "" : level;

      buttons.forEach((other) => {
        other.classList.toggle("active", other.dataset.difficulty === selectedDifficulty);
      });

      console.log("🎯 Vald svårighet", selectedDifficulty || "ingen");
      updateActiveFilterText();
      renderRecipes();
    });
  });
}

function updateActiveFilterText() {
  const target = document.getElementById("active-filters");
  if (!target) return;

  const parts = [];
  if (selectedDiets.length) parts.push(`Diet: ${selectedDiets.join(", ")}`);
  if (selectedDifficulty) parts.push(`Difficulty: ${selectedDifficulty}`);

  target.textContent = parts.length ? `Active filters: ${parts.join(" | ")}` : "No active filters";
}

function updateMatchCount(total) {
  const target = document.getElementById("matched-recipes");
  if (target) {
    target.textContent = `Matches: ${total}`;
  }
}

function renderEmptyState(message) {
  const grid = document.getElementById("recipe-grid");
  if (!grid) return;
  grid.innerHTML = `<p class="empty-state">${message}</p>`;
  updateMatchCount(0);
}

function buildCard(recipe) {
  const image = recipe.image || PLACEHOLDER_IMAGE;
  const summary = stripHtml(recipe.summary || "");
  const preview = summary.length > 140 ? `${summary.slice(0, 140).trim()}...` : summary;
  const level = difficultyLabel(recipe.readyInMinutes);
  const diets = (recipe.diets || [])
    .slice(0, 4)
    .map((diet) => `<span class="pill">${diet}</span>`)
    .join("");

  return `
    <article class="recipe-card card" data-recipe-id="${recipe.id}" tabindex="0" role="listitem">
      <div class="recipe-card__media">
        <img src="${image}" alt="Image of ${recipe.title}" loading="lazy" />
        <span class="recipe-card__badge">${level}</span>
      </div>
      <div class="recipe-card__body">
        <h3 class="recipe-card__title">${recipe.title}</h3>
        <p class="recipe-card__summary">${preview || "Discover this recipe via Spoonacular."}</p>
        <ul class="recipe-card__meta">
          <li class="meta-item meta-item--time">
            <span class="meta-label">Time</span>
            <span class="meta-value">${recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Varies"}</span>
          </li>
          <li class="meta-item meta-item--servings">
            <span class="meta-label">Servings</span>
            <span class="meta-value">${recipe.servings ? `${recipe.servings}` : "Flexible"}</span>
          </li>
        </ul>
        <div class="recipe-card__tags">${diets}</div>
      </div>
      <footer class="recipe-card__footer">
        <a class="btn btn-solid btn-full" href="${DETAILS_PAGE}?recipeId=${recipe.id}">View recipe</a>
      </footer>
    </article>
  `;
}

function stripHtml(text) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = text;
  return wrapper.textContent || "";
}

function bindCardNavigation(grid) {
  if (grid.dataset.navigationBound === "true") return;
  grid.dataset.navigationBound = "true";

  const goToDetails = (id) => {
    if (!id) return;
    window.location.href = `${DETAILS_PAGE}?recipeId=${id}`;
  };

  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".recipe-card[data-recipe-id]");
    if (!card) return;
    if (event.target.closest("a, button")) return;
    goToDetails(card.dataset.recipeId);
  });

  grid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".recipe-card[data-recipe-id]");
    if (!card) return;
    event.preventDefault();
    goToDetails(card.dataset.recipeId);
  });
}
