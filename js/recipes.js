// ---------------------------
// 🍲 RECIPES PAGE SCRIPT
// Loads and filters recipes from the API
// ---------------------------

import { getRecipes } from "./fetchdata.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
    const container = document.getElementById("recipe-results");
    if (!container) return;

    // State variables
    let recipes = [];
    let selectedDiets = [];
    let selectedDifficulty = "";
    const ingredients = readIngredients();

    renderLayout(container);
    const elements = getElements(container);
    updateIngredientText(elements);

    // Load recipes
    recipes = await getRecipes({ ingredients });
    renderRecipes(recipes, elements);

    // Filter buttons
    elements.dietButtons.forEach((btn) =>
        btn.addEventListener("click", () => {
            const diet = btn.dataset.diet;
            btn.classList.toggle("chip--active");
            selectedDiets = elements.dietButtons
                .filter((b) => b.classList.contains("chip--active"))
                .map((b) => b.dataset.diet);
            filterAndRender();
        })
    );

    elements.diffButtons.forEach((btn) =>
        btn.addEventListener("click", () => {
            selectedDifficulty = btn.dataset.difficulty === selectedDifficulty ? "" : btn.dataset.difficulty;
            elements.diffButtons.forEach((b) =>
                b.classList.toggle("chip--active", b.dataset.difficulty === selectedDifficulty)
            );
            filterAndRender();
        })
    );

    elements.clearBtn.addEventListener("click", () => {
        selectedDiets = [];
        selectedDifficulty = "";
        elements.dietButtons.forEach((b) => b.classList.remove("chip--active"));
        elements.diffButtons.forEach((b) => b.classList.remove("chip--active"));
        filterAndRender();
    });

    function filterAndRender() {
        const filtered = recipes.filter((r) => {
            const matchDiet =
                !selectedDiets.length || selectedDiets.every((d) => r.diets?.includes(d));
            const matchDiff =
                !selectedDifficulty || getDifficulty(r.readyInMinutes) === selectedDifficulty;
            return matchDiet && matchDiff;
        });
        renderRecipes(filtered, elements);
    }
}

// --- Helper functions ---

function readIngredients() {
    try {
        return JSON.parse(localStorage.getItem("ingredients")) || [];
    } catch {
        return [];
    }
}

function renderLayout(container) {
    container.innerHTML = `
    <a href="../index.html" class="back-link">← Back to search</a>
    <h1>Recipe Suggestions</h1>
    <p>Based on: <span id="ingredient-list"></span></p>

    <div class="filters">
      <div>
        <h2>Diets</h2>
        <div id="diet-buttons" class="chip-row"></div>
      </div>
      <div>
        <h2>Difficulty</h2>
        <div id="diff-buttons" class="chip-row">
          <button data-difficulty="Easy" class="chip">Easy</button>
          <button data-difficulty="Medium" class="chip">Medium</button>
          <button data-difficulty="Hard" class="chip">Hard</button>
        </div>
      </div>
      <button id="clear-btn" class="btn-outline">Clear filters</button>
    </div>

    <div id="recipe-grid" class="recipe-grid"></div>
  `;
}

function getElements(container) {
    return {
        ingredientText: container.querySelector("#ingredient-list"),
        dietButtons: Array.from(container.querySelectorAll("#diet-buttons .chip")),
        diffButtons: Array.from(container.querySelectorAll("#diff-buttons .chip")),
        clearBtn: container.querySelector("#clear-btn"),
        grid: container.querySelector("#recipe-grid"),
    };
}

function updateIngredientText({ ingredientText }) {
    const ingredients = readIngredients();
    ingredientText.textContent = ingredients.length ? ingredients.join(", ") : "no ingredients";
}

function renderRecipes(list, { grid }) {
    if (!list.length) {
        grid.innerHTML = `<p class="empty-state">No recipes found.</p>`;
        return;
    }

    grid.innerHTML = list
        .map(
            (r) => `
      <article class="recipe-card card">
        <img src="${r.image || "https://via.placeholder.com/640x360"}" alt="${r.title}" />
        <h3>${r.title}</h3>
        <p>Time: ${r.readyInMinutes || "?"} min • ${getDifficulty(r.readyInMinutes)}</p>
        <p>Diet: ${r.diets?.slice(0, 3).join(", ") || "n/a"}</p>
        <a href="recipe-details.html?recipeId=${r.id}" class="btn-solid">View Recipe</a>
      </article>
    `
        )
        .join("");
}

function getDifficulty(mins) {
    if (!mins) return "Easy";
    if (mins <= 30) return "Easy";
    if (mins <= 45) return "Medium";
    return "Hard";
}
