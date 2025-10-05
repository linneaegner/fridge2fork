// recipes.js
// Grab recipes from Spoonacular based on the ingredients saved in localStorage
const API_KEY = "32fa164a90a4441385aec42d7c8fe44d";
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

let fetchedRecipes = [];
let selectedFilters = [];
let userIngredients = [];
let userIngredientsNormalized = [];
let selectedDifficulty = null;

// --- Fetch recipes that include the ingredients the user typed on the home page ---
export async function getRecipesByIngredients(ingredients, number = 50) {
    const params = new URLSearchParams({
        includeIngredients: ingredients.join(","),
        number: number,
        apiKey: API_KEY,
        addRecipeInformation: true,
    });

    try {
        const response = await fetch(`${BASE_URL}?${params}`);
        if (!response.ok) throw new Error("Failed to fetch recipes");
        const data = await response.json();
        fetchedRecipes = data.results || [];
        return fetchedRecipes;
    } catch (error) {
        console.error("Error fetching recipes:", error);
        fetchedRecipes = [];
        return [];
    }
}

// --- Buttons for the dietary filters (Spoonacular expects these exact names) ---
const DIETARY_OPTIONS = [
    { name: "gluten free", description: "Avoid gluten-containing grains." },
    { name: "ketogenic", description: "Low carb, high fat foods." },
    { name: "vegetarian", description: "No meat or meat by-products." },
    { name: "vegan", description: "No meat, dairy, or eggs." },
    { name: "pescatarian", description: "Includes fish and seafood." },
    { name: "paleo", description: "No grains, dairy, or legumes." },
    { name: "primal", description: "Similar to paleo, allows dairy." },
    { name: "low FODMAP", description: "Avoid certain fermentable carbs." },
    { name: "dairy free", description: "No milk or milk by-products." },
    { name: "whole30", description: "No sugar, grains, or legumes." },
];

// --- Small helpers to keep rendering logic tidy ---
function formatIngredients(list = []) {
    const tidy = list
        .map((item) => item?.trim())
        .filter(Boolean);
    return tidy.length ? tidy.join(", ") : "Nothing selected yet";
}

function calculateDifficulty(minutes) {
    if (!minutes) return "Easy";
    if (minutes <= 30) return "Easy";
    if (minutes <= 45) return "Medium";
    return "Hard";
}

function stripHTML(value) {
    if (!value) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = value;
    return tmp.textContent || tmp.innerText || "";
}

function truncate(value, limit = 120) {
    if (!value) return "";
    if (value.length <= limit) return value;
    return `${value.slice(0, limit).trim()}...`;
}

function createDietaryFilterButtons() {
    const container = document.getElementById("dietary-options");
    if (!container) return;

    container.innerHTML = "";

    DIETARY_OPTIONS.forEach((option) => {
        const button = document.createElement("button");
        button.textContent = option.name.charAt(0).toUpperCase() + option.name.slice(1);
        button.className = "filter-chip";
        button.title = option.description;

        button.addEventListener("click", () => toggleFilter(option.name, button));
        container.appendChild(button);
    });

    const clearBtn = document.getElementById("clear-filters");
    if (clearBtn) clearBtn.addEventListener("click", clearFilters);
}

function toggleFilter(filter, button) {
    const isActive = selectedFilters.includes(filter);

    selectedFilters = isActive
        ? selectedFilters.filter((name) => name !== filter)
        : [...selectedFilters, filter];

    button.classList.toggle("active", !isActive);
    filterRecipesByDiet();
    displayActiveFilters();
}

function clearFilters() {
    selectedFilters = [];
    document
        .querySelectorAll("#dietary-options button")
        .forEach((btn) => btn.classList.remove("active"));
    selectedDifficulty = null;
    document
        .querySelectorAll(".difficulty-chip")
        .forEach((btn) => btn.classList.remove("active"));

    displayActiveFilters();
    filterRecipesByDiet();
}

function filterRecipesByDiet() {
    if (!fetchedRecipes.length) return;

    let filtered = fetchedRecipes;
    if (selectedFilters.length > 0) {
        filtered = fetchedRecipes.filter((recipe) =>
            selectedFilters.every((filter) => recipe.diets && recipe.diets.includes(filter.toLowerCase()))
        );
    }

    if (selectedDifficulty) {
        filtered = filtered.filter((recipe) => {
            const difficulty = calculateDifficulty(recipe.readyInMinutes).toLowerCase();
            return difficulty === selectedDifficulty;
        });
    }

    displayRecipes(filtered);
    updateMatchedRecipes(filtered);
}

function displayActiveFilters() {
    const activeFiltersContainer = document.getElementById("active-filters");
    if (!activeFiltersContainer) return;

    activeFiltersContainer.textContent =
        selectedFilters.length > 0 ? `Active Filters: ${selectedFilters.join(", ")}` : "No active filters";
}

function updateMatchedRecipes(recipes) {
    const matchedRecipesContainer = document.getElementById("matched-recipes");
    if (!matchedRecipesContainer) return;
    matchedRecipesContainer.textContent = `Matched Recipes: ${recipes.length}`;
}

function buildDietTags(diets) {
    if (!diets || !diets.length) {
        return '<span class="pill pill--muted">General</span>';
    }

    return diets
        .map((diet) => `<span class="pill">${diet.charAt(0).toUpperCase() + diet.slice(1)}</span>`)
        .join("");
}

function buildRecipeCard(recipe) {
    const image = recipe.image || "https://via.placeholder.com/400x280?text=No+Image";
    const difficulty = calculateDifficulty(recipe.readyInMinutes);
    const summary = truncate(stripHTML(recipe.summary), 140) || "A delightful recipe discoverable via Spoonacular.";
    const timeText = recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : "Time varies";
    const servingsText = recipe.servings ? `${recipe.servings} servings` : "Flexible servings";
    const diets = buildDietTags(recipe.diets);

    return `
    <article class="recipe-card card" data-recipe-id="${recipe.id}" tabindex="0">
      <div class="recipe-card__media">
        <img src="${image}" alt="${recipe.title}" loading="lazy" />
        <span class="recipe-card__badge">${difficulty}</span>
      </div>
      <div class="recipe-card__body">
        <h3 class="recipe-card__title">${recipe.title}</h3>
        <p class="recipe-card__summary">${summary}</p>
        <ul class="recipe-card__meta">
          <li class="meta-item meta-item--time">
            <span class="meta-label">Time</span>
            <span class="meta-value">${timeText}</span>
          </li>
          <li class="meta-item meta-item--servings">
            <span class="meta-label">Servings</span>
            <span class="meta-value">${servingsText}</span>
          </li>
        </ul>
        <div class="recipe-card__tags">${diets}</div>
      </div>
      <footer class="recipe-card__footer">
        <a href="recipe-details.html?recipeId=${recipe.id}" class="btn btn-solid btn-full">View Recipe</a>
      </footer>
    </article>
  `;
}

function displayRecipes(recipes) {
    const recipeGrid = document.getElementById("recipe-grid");
    if (!recipeGrid) return;

    if (!recipes.length) {
        recipeGrid.innerHTML = '<p class="empty-state">No recipes found for these filters.</p>';
        return;
    }

    recipeGrid.innerHTML = recipes.map((recipe) => buildRecipeCard(recipe)).join("");
    enableRecipeCardNavigation();
}

function enableRecipeCardNavigation() {
    const cards = document.querySelectorAll(".recipe-card[data-recipe-id]");
    cards.forEach((card) => {
        const recipeId = card.getAttribute("data-recipe-id");
        if (!recipeId) return;

        const navigateToRecipe = () => {
            window.location.href = `recipe-details.html?recipeId=${recipeId}`;
        };

        card.addEventListener("click", (event) => {
            if (event.target.closest("a, button")) return;
            navigateToRecipe();
        });

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigateToRecipe();
            }
        });
    });
}

// --- Kick everything off once the page loads ---
document.addEventListener("DOMContentLoaded", () => {
    userIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];

    const ingredientTarget = document.getElementById("selected-ingredients");
    if (ingredientTarget) ingredientTarget.textContent = formatIngredients(userIngredients);

    getRecipesByIngredients(userIngredients).then((recipes) => {
        displayRecipes(recipes);
        updateMatchedRecipes(recipes);
    });

    createDietaryFilterButtons();
    displayActiveFilters();
    setupDifficultyFilters();
});

function setupDifficultyFilters() {
    const buttons = document.querySelectorAll(".difficulty-chip");
    if (!buttons.length) return;

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const difficulty = btn.dataset.difficulty;
            const isActive = selectedDifficulty === difficulty;

            selectedDifficulty = isActive ? null : difficulty;

            buttons.forEach((other) => other.classList.toggle("active", other.dataset.difficulty === selectedDifficulty));
            filterRecipesByDiet();
        });
    });
}
