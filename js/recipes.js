// recipes.js
const API_KEY = "32fa164a90a4441385aec42d7c8fe44d";
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

let fetchedRecipes = [];
let selectedFilters = [];

// --- Fetch Recipes ---
export async function getRecipesByIngredients(ingredients, number = 20) {
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

// --- Dietary Filter Options (use Spoonacular naming) ---
const DIETARY_OPTIONS = [
    { name: "gluten free", description: "Avoid gluten-containing grains." },
    { name: "ketogenic", description: "Low carb, high fat foods." },
    { name: "vegetarian", description: "No meat or meat by-products." },
    { name: "vegan", description: "No meat, dairy, or eggs." },
    { name: "pescatarian", description: "Includes fish and seafood." },
    { name: "paleo", description: "No grains, dairy, or legumes." },
    { name: "primal", description: "Similar to paleo, allows dairy." },
    { name: "whole30", description: "No sugar, grains, or legumes." },
];

// --- Utility Helpers ---
function formatIngredients(ingredients) {
    if (!ingredients || !ingredients.length) return "Nothing selected yet";
    const trimmed = ingredients.filter(Boolean).map((item) => item.trim()).filter(Boolean);
    if (!trimmed.length) return "Nothing selected yet";
    return trimmed.join(", ");
}

function calculateDifficulty(minutes) {
    if (!minutes) return "Easy";
    if (minutes <= 20) return "Easy";
    if (minutes <= 40) return "Moderate";
    return "Advanced";
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
        button.className = "filter-btn";
        button.title = option.description;

        button.addEventListener("click", () => toggleFilter(option.name, button));
        container.appendChild(button);
    });

    const clearBtn = document.getElementById("clear-filters");
    if (clearBtn) clearBtn.addEventListener("click", clearFilters);
}

function toggleFilter(filter, button) {
    if (selectedFilters.includes(filter)) {
        selectedFilters = selectedFilters.filter((f) => f !== filter);
        button.classList.remove("active");
    } else {
        selectedFilters.push(filter);
        button.classList.add("active");
    }

    filterRecipesByDiet();
    displayActiveFilters();
}

function clearFilters() {
    selectedFilters = [];
    document
        .querySelectorAll("#dietary-options button")
        .forEach((btn) => btn.classList.remove("active"));
    displayRecipes(fetchedRecipes);
    displayActiveFilters();
    updateMatchedRecipes(fetchedRecipes);
}

function filterRecipesByDiet() {
    if (!fetchedRecipes.length) return;

    let filtered = fetchedRecipes;
    if (selectedFilters.length > 0) {
        filtered = fetchedRecipes.filter((recipe) =>
            selectedFilters.every((filter) => recipe.diets && recipe.diets.includes(filter.toLowerCase()))
        );
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

// --- Initialize Everything Once the Page Loads ---
document.addEventListener("DOMContentLoaded", () => {
    const ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    const ingredientTarget = document.getElementById("selected-ingredients");
    if (ingredientTarget) {
        ingredientTarget.textContent = formatIngredients(ingredients);
    }

    getRecipesByIngredients(ingredients).then((recipes) => {
        displayRecipes(recipes);
        updateMatchedRecipes(recipes);
    });

    createDietaryFilterButtons();
    displayActiveFilters();
});
