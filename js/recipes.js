import { getRecipes } from "./fetchdata.js";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/640x360?text=No+image";
const DETAILS_PAGE = "recipe-details.html";
const WIDGET_ID = "recipe-widget";
const DIET_OPTIONS = [
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

const state = {
  recipes: [],
  diets: [],
  difficulty: "",
  ingredients: [],
};

document.addEventListener("DOMContentLoaded", initRecipePage);

async function initRecipePage() {
  const root = document.getElementById(WIDGET_ID);
  if (!root) {
    console.warn("Hittade inte widget-roten – avbryter initiering");
    return;
  }

  state.ingredients = readIngredients();
  renderLayout(root);
  const elements = collectElements(root);
  updateIngredientLabel(elements);
  buildDietButtons(elements);
  bindDifficultyButtons(elements);
  bindClearFilters(elements);
  updateActiveFilterText(elements);

  await loadRecipes(elements);
}

function renderLayout(root) {
  root.innerHTML = `
    <a class="back-link" href="../index.html">&larr; Back to search</a>

    <section class="widget card">
      <p class="widget__eyebrow">Based on your ingredients</p>
      <h1 class="widget__title">Recipe suggestions</h1>
      <p class="widget__subtitle">
        Ingredients:
        <span id="selected-ingredients" class="widget__highlight">your ingredients</span>
      </p>
    </section>

    <section class="filter card">
      <div class="filter__group">
        <h2>Dietary preferences</h2>
        <div id="dietary-options" class="chip-row"></div>
      </div>
      <div class="filter__group">
        <h2>Difficulty level</h2>
        <div class="chip-row">
          <button type="button" data-difficulty="easy" class="chip">Easy</button>
          <button type="button" data-difficulty="medium" class="chip">Medium</button>
          <button type="button" data-difficulty="hard" class="chip">Hard</button>
        </div>
      </div>
      <button id="clear-filters" type="button" class="btn btn-outline">Clear filters</button>
    </section>

    <div class="filter-info" role="status" aria-live="polite">
      <p id="active-filters">No active filters</p>
      <p id="matched-recipes">Matches: 0</p>
    </div>

    <div id="recipe-grid" class="recipe-grid" role="list"></div>
  `;
}

function collectElements(root) {
  return {
    ingredients: root.querySelector("#selected-ingredients"),
    dietRow: root.querySelector("#dietary-options"),
    difficultyButtons: Array.from(root.querySelectorAll("button[data-difficulty]")),
    clearButton: root.querySelector("#clear-filters"),
    activeFilters: root.querySelector("#active-filters"),
    matchCount: root.querySelector("#matched-recipes"),
    grid: root.querySelector("#recipe-grid"),
  };
}

function readIngredients() {
  try {
    const stored = localStorage.getItem("ingredients");
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Kunde inte läsa ingredienser från localStorage", error);
    return [];
  }
}

function updateIngredientLabel(elements) {
  if (!elements.ingredients) return;
  elements.ingredients.textContent = state.ingredients.length
    ? state.ingredients.join(", ")
    : "no ingredients selected";
}

async function loadRecipes(elements) {
  try {
    state.recipes = await getRecipes({ ingredients: state.ingredients, diets: state.diets });
    console.log("✅ Hämtade receptlista", state.recipes.length);
    renderRecipes(elements);
  } catch (error) {
    console.error("❌ Kunde inte hämta recept", error);
    renderEmptyState(elements, "Unable to load recipes right now.");
  }
}

function renderRecipes(elements) {
  if (!elements.grid) return;

  const filtered = state.recipes.filter(matchesActiveFilters);
  updateMatchCount(elements, filtered.length);

  if (!filtered.length) {
    renderEmptyState(elements, "No recipes match the current filters.");
    return;
  }

  elements.grid.innerHTML = filtered.map(buildCard).join("");
}

function matchesActiveFilters(recipe) {
  const matchesDiet =
    !state.diets.length || state.diets.every((diet) => recipe.diets?.includes(diet));
  const matchesDifficulty =
    !state.difficulty || difficultyLabel(recipe.readyInMinutes).toLowerCase() === state.difficulty;
  return matchesDiet && matchesDifficulty;
}

function difficultyLabel(minutes) {
  if (!minutes || Number.isNaN(minutes)) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

function buildDietButtons(elements) {
  if (!elements.dietRow) return;
  elements.dietRow.innerHTML = "";

  DIET_OPTIONS.forEach((diet) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.dataset.diet = diet;
    button.textContent = toTitleCase(diet);

    button.addEventListener("click", () => {
      toggleDiet(diet, button);
      updateActiveFilterText(elements);
      renderRecipes(elements);
    });

    elements.dietRow.appendChild(button);
  });
}

function toggleDiet(diet, button) {
  if (state.diets.includes(diet)) {
    state.diets = state.diets.filter((item) => item !== diet);
    button.classList.remove("chip--active");
  } else {
    state.diets.push(diet);
    button.classList.add("chip--active");
  }
  console.log("🧮 Valda dieter", state.diets);
}

function bindDifficultyButtons(elements) {
  elements.difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const level = button.dataset.difficulty;
      state.difficulty = state.difficulty === level ? "" : level;

      elements.difficultyButtons.forEach((other) => {
        other.classList.toggle("chip--active", other.dataset.difficulty === state.difficulty);
      });

      console.log("🎯 Vald svårighet", state.difficulty || "ingen");
      updateActiveFilterText(elements);
      renderRecipes(elements);
    });
  });
}

function bindClearFilters(elements) {
  if (!elements.clearButton) return;
  elements.clearButton.addEventListener("click", () => {
    state.diets = [];
    state.difficulty = "";
    elements.dietRow?.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("chip--active"));
    elements.difficultyButtons.forEach((button) => button.classList.remove("chip--active"));
    console.log("🔄 Filter återställda");
    updateActiveFilterText(elements);
    renderRecipes(elements);
  });
}

function updateActiveFilterText(elements) {
  if (!elements.activeFilters) return;

  const parts = [];
  if (state.diets.length) parts.push(`Diet: ${state.diets.join(", ")}`);
  if (state.difficulty) parts.push(`Difficulty: ${state.difficulty}`);

  elements.activeFilters.textContent = parts.length
    ? `Active filters: ${parts.join(" | ")}`
    : "No active filters";
}

function updateMatchCount(elements, total) {
  if (elements.matchCount) {
    elements.matchCount.textContent = `Matches: ${total}`;
  }
}

function renderEmptyState(elements, message) {
  if (!elements.grid) return;
  elements.grid.innerHTML = `<p class="empty-state">${message}</p>`;
  updateMatchCount(elements, 0);
}

function buildCard(recipe) {
  const summary = plainText(recipe.summary || "");
  const preview = summary.length > 140 ? `${summary.slice(0, 140).trim()}...` : summary;
  const diets = recipe.diets?.length ? `Diet: ${recipe.diets.slice(0, 3).join(", ")}` : "Diet: n/a";
  const difficulty = difficultyLabel(recipe.readyInMinutes);

  return `
    <article class="recipe-card card" role="listitem">
      <img class="recipe-card__image" src="${recipe.image || PLACEHOLDER_IMAGE}" alt="Recipe ${recipe.title}" loading="lazy" />
      <div class="recipe-card__body">
        <h3>${recipe.title}</h3>
        <p class="recipe-card__summary">${preview || "Discover this recipe via Spoonacular."}</p>
        <p class="recipe-card__meta">Time: ${recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Varies"} • Servings: ${recipe.servings || "Flexible"} • ${difficulty}</p>
        <p class="recipe-card__tags">${diets}</p>
        <a class="btn btn-solid" href="${DETAILS_PAGE}?recipeId=${recipe.id}">View recipe</a>
      </div>
    </article>
  `;
}

function plainText(text) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = text;
  return wrapper.textContent || "";
}

function toTitleCase(text) {
  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
