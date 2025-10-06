import { searchRecipes } from "./fetchdata.js";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x280?text=No+Image";
const DETAILS_PAGE = "recipe-details.html";
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
  allRecipes: [],
  activeDiets: new Set(),
  difficulty: null,
};

function readIngredients() {
  try {
    const value = localStorage.getItem("ingredients");
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function difficultyLabel(minutes) {
  if (!minutes || Number.isNaN(minutes)) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

function stripHtml(text) {
  if (!text) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = text;
  return tmp.textContent || "";
}

function updateIngredientsLabel(ingredients) {
  const target = document.getElementById("selected-ingredients");
  if (!target) return;
  target.textContent = ingredients.length ? ingredients.join(", ") : "no ingredients yet";
}

function updateMatchedCount(value) {
  const target = document.getElementById("matched-recipes");
  if (target) {
    target.textContent = `Matched Recipes: ${value}`;
  }
}

function buildCard(recipe) {
  const image = recipe.image || PLACEHOLDER_IMAGE;
  const time = recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : "Time varies";
  const servings = recipe.servings ? `${recipe.servings} servings` : "Flexible servings";
  const summary = stripHtml(recipe.summary || "");
  const preview = summary.length > 140 ? `${summary.slice(0, 140).trim()}...` : summary;
  const difficulty = difficultyLabel(recipe.readyInMinutes);
  const diets = (recipe.diets || [])
    .slice(0, 4)
    .map((diet) => `<span class="pill">${diet}</span>`)
    .join("");

  return `
    <article class="recipe-card card" data-recipe-id="${recipe.id}" tabindex="0">
      <div class="recipe-card__media">
        <img src="${image}" alt="Image of ${recipe.title}" loading="lazy" />
        <span class="recipe-card__badge">${difficulty}</span>
      </div>
      <div class="recipe-card__body">
        <h3 class="recipe-card__title">${recipe.title}</h3>
        <p class="recipe-card__summary">${preview || "Discover this recipe on Spoonacular."}</p>
        <ul class="recipe-card__meta">
          <li class="meta-item meta-item--time">
            <span class="meta-label">Time</span>
            <span class="meta-value">${time}</span>
          </li>
          <li class="meta-item meta-item--servings">
            <span class="meta-label">Servings</span>
            <span class="meta-value">${servings}</span>
          </li>
        </ul>
        <div class="recipe-card__tags">${diets}</div>
      </div>
      <footer class="recipe-card__footer">
        <a class="btn btn-solid btn-full" href="recipe-details.html?recipeId=${recipe.id}">View Recipe</a>
      </footer>
    </article>
  `;
}

function renderRecipes(recipes) {
  const grid = document.getElementById("recipe-grid");
  if (!grid) return;

  if (!recipes.length) {
    grid.innerHTML = '<p class="empty-state">No recipes found. Try changing the filters.</p>';
    updateMatchedCount(0);
    return;
  }

  grid.innerHTML = recipes.map(buildCard).join("");
  updateMatchedCount(recipes.length);
  bindCardNavigation(grid);
}

function bindCardNavigation(container) {
  if (container.dataset.navigationBound === "true") return;
  container.dataset.navigationBound = "true";

  const navigate = (recipeId) => {
    if (!recipeId) return;
    window.location.href = `${DETAILS_PAGE}?recipeId=${recipeId}`;
  };

  container.addEventListener("click", (event) => {
    const card = event.target.closest(".recipe-card[data-recipe-id]");
    if (!card) return;
    if (event.target.closest("a, button")) return;
    navigate(card.dataset.recipeId);
  });

  container.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".recipe-card[data-recipe-id]");
    if (!card) return;
    event.preventDefault();
    navigate(card.dataset.recipeId);
  });
}

function selectedDietArray() {
  return Array.from(state.activeDiets.values());
}

function applyFilters() {
  if (!state.allRecipes.length) {
    renderRecipes([]);
    return;
  }

  let filtered = [...state.allRecipes];

  if (state.activeDiets.size) {
    filtered = filtered.filter((recipe) => {
      if (!recipe.diets || !recipe.diets.length) return false;
      return Array.from(state.activeDiets).every((diet) => recipe.diets.includes(diet));
    });
  }

  if (state.difficulty) {
    filtered = filtered.filter((recipe) => difficultyLabel(recipe.readyInMinutes).toLowerCase() === state.difficulty);
  }

  renderRecipes(filtered);
  updateActiveFiltersLabel();
}

function updateActiveFiltersLabel() {
  const target = document.getElementById("active-filters");
  if (!target) return;

  const diets = selectedDietArray();
  const labels = [];
  if (diets.length) labels.push(`Diet: ${diets.join(", ")}`);
  if (state.difficulty) labels.push(`Difficulty: ${state.difficulty}`);

  target.textContent = labels.length ? `Active Filters: ${labels.join(" | ")}` : "No active filters";
}

function setupDietFilters() {
  const container = document.getElementById("dietary-options");
  if (!container) return;

  container.innerHTML = "";

  DIET_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.textContent = option.replace(/\b\w/g, (letter) => letter.toUpperCase());
    button.dataset.diet = option;

    button.addEventListener("click", () => {
      if (state.activeDiets.has(option)) {
        state.activeDiets.delete(option);
        button.classList.remove("active");
      } else {
        state.activeDiets.add(option);
        button.classList.add("active");
      }
      applyFilters();
    });

    container.appendChild(button);
  });

  const clearBtn = document.getElementById("clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.activeDiets.clear();
      state.difficulty = null;
      container.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
      document.querySelectorAll(".difficulty-chip").forEach((btn) => btn.classList.remove("active"));
      applyFilters();
    });
  }
}

function setupDifficultyFilters() {
  const buttons = document.querySelectorAll(".difficulty-chip");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const level = button.dataset.difficulty;
      const isActive = state.difficulty === level;
      state.difficulty = isActive ? null : level;

      buttons.forEach((item) => {
        item.classList.toggle("active", state.difficulty === item.dataset.difficulty);
      });

      applyFilters();
    });
  });
}

async function loadRecipes(ingredients) {
  try {
    const recipes = await searchRecipes({ ingredients, diets: selectedDietArray() });
    state.allRecipes = recipes;
    renderRecipes(recipes);
  } catch (error) {
    console.error(error);
    renderRecipes([]);
  }
}

async function init() {
  const ingredients = readIngredients();
  updateIngredientsLabel(ingredients);
  setupDietFilters();
  setupDifficultyFilters();
  updateActiveFiltersLabel();
  await loadRecipes(ingredients);
}

document.addEventListener("DOMContentLoaded", init);
