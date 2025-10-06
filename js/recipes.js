// ---------------------------------------------------------
// 📋 recipes.js – Hanterar receptsidan (visar resultat + filter)
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";

// ---------------------------------------------------------
// GLOBALA VARIABLER
// ---------------------------------------------------------
let allRecipes = [];            // Alla recept från API:et
let filteredRecipes = [];       // Filtrerad lista beroende på val
let selectedDiets = [];         // Valda kostfilter
let selectedDifficulty = "";    // Vald svårighetsgrad

// Hämtar referenser till viktiga DOM-element
const recipeResults = document.querySelector("#recipe-results");

// ---------------------------------------------------------
// START
// ---------------------------------------------------------
export async function startRecipesPage() {
    console.log("📦 Initializing recipes page...");

    if (!recipeResults) {
        console.warn("⚠️ Could not find the #recipe-results element.");
        return;
    }

    // 1️⃣ Hämta ingredienser som användaren valt på startsidan
    const ingredients = loadIngredients();
    console.log("🥕 Ingredients loaded:", ingredients);

    // 2️⃣ Skapa layout och filter
    renderLayout(ingredients);
    setupFilterButtons();

    // 3️⃣ Hämta recept från API baserat på ingredienser
    await loadRecipes(ingredients);

    // 4️⃣ Visa recepten på sidan
    renderRecipes(filteredRecipes);
}

// ---------------------------------------------------------
// FUNKTIONER
// ---------------------------------------------------------

// Hämtar recept från API:et
async function loadRecipes(ingredients) {
    try {
        allRecipes = await getRecipes({ ingredients });
        filteredRecipes = allRecipes; // Visa alla till att börja med
        console.log(`✅ Retrieved ${allRecipes.length} recipes from the API.`);
    } catch (error) {
        console.error("❌ Could not fetch recipes:", error);
        recipeResults.innerHTML = `<p class="empty-state">Could not get recipes right now.</p>`;
    }
}

// Skapar sidlayouten och filtersektionen
function renderLayout(ingredients) {
    recipeResults.innerHTML = `
    <a href="../index.html" class="back-link">← Back</a>
    <h1>Recipes based on: ${ingredients.join(", ") || "no ingredients"}</h1>

    <section id="filter-section" class="card">
      <h2>Filter recipes</h2>

      <!-- Diet -->
      <div class="filter-group">
        <h3>Diet</h3>
        <div id="diet-buttons" class="chip-row">
          <button class="chip" data-diet="gluten free">Gluten Free</button>
          <button class="chip" data-diet="vegetarian">Vegetarian</button>
          <button class="chip" data-diet="vegan">Vegan</button>
          <button class="chip" data-diet="pescatarian">Pescatarian</button>
        </div>
      </div>

      <!-- Difficulty -->
      <div class="filter-group">
        <h3>Difficulty</h3>
        <div id="difficulty-buttons" class="chip-row">
          <button class="chip" data-difficulty="Easy">Easy</button>
          <button class="chip" data-difficulty="Medium">Medium</button>
          <button class="chip" data-difficulty="Hard">Hard</button>
        </div>
      </div>

      <button id="clear-filters" class="btn-outline">Clear filters</button>
    </section>

    <!-- Recipe results -->
    <div id="recipe-grid" class="recipe-grid"></div>
  `;
}

// Laddar ingredienser från localStorage
function loadIngredients() {
    try {
        return JSON.parse(localStorage.getItem("ingredients")) || [];
    } catch {
        console.warn("⚠️ Could not read ingredients from localStorage.");
        return [];
    }
}

// Hämtar referenser till filterknapparna och lägger till eventlyssnare
function setupFilterButtons() {
    const dietButtons = Array.from(document.querySelectorAll("#diet-buttons .chip"));
    const diffButtons = Array.from(document.querySelectorAll("#difficulty-buttons .chip"));
    const clearBtn = document.querySelector("#clear-filters");

    // Kostfilter
    dietButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("chip--active");
            selectedDiets = dietButtons
                .filter((button) => button.classList.contains("chip--active"))
                .map((button) => button.dataset.diet);
            applyFilters();
        });
    });

    // Svårighetsfilter
    diffButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            selectedDifficulty =
                btn.dataset.difficulty === selectedDifficulty ? "" : btn.dataset.difficulty;

            diffButtons.forEach((button) => {
                button.classList.toggle("chip--active", button.dataset.difficulty === selectedDifficulty);
            });
            applyFilters();
        });
    });

    // Rensa filter
    clearBtn?.addEventListener("click", () => {
        selectedDiets = [];
        selectedDifficulty = "";
        dietButtons.forEach((b) => b.classList.remove("chip--active"));
        diffButtons.forEach((b) => b.classList.remove("chip--active"));
        applyFilters();
    });
}

// Filtrerar recepten baserat på valda filter
function applyFilters() {
    console.log("🔍 Filtering recipes...");

    filteredRecipes = allRecipes.filter((recipe) => {
        const matchDiet =
            !selectedDiets.length || selectedDiets.every((diet) => recipe.diets?.includes(diet));

        const matchDifficulty =
            !selectedDifficulty ||
            getDifficulty(recipe.readyInMinutes) === selectedDifficulty;

        return matchDiet && matchDifficulty;
    });

    renderRecipes(filteredRecipes);
}

// Skapar korten för varje recept
function renderRecipes(recipes) {
    const grid = document.querySelector("#recipe-grid");
    if (!grid) return;

    if (!recipes.length) {
        grid.innerHTML = `<p class="empty-state">No recipes match your filters.</p>`;
        return;
    }

    let recipeHTML = "";
    recipes.forEach((recipe) => {
        const difficulty = getDifficulty(recipe.readyInMinutes);
        recipeHTML += `
      <article class="recipe-card card">
        <img
          src="${recipe.image || "https://via.placeholder.com/640x360"}"
          alt="${recipe.title}"
        />
        <h3>${recipe.title}</h3>
        <p>Time: ${recipe.readyInMinutes || "?"} min • Difficulty: ${difficulty}</p>
        <p>Diet: ${recipe.diets?.slice(0, 3).join(", ") || "n/a"}</p>
        <a href="recipe-details.html?recipeId=${recipe.id}" class="btn-solid">View recipe</a>
      </article>
    `;
    });

    grid.innerHTML = recipeHTML;
}

// Returnerar svårighetsnivå beroende på tid
function getDifficulty(minutes) {
    if (!minutes) return "Easy";
    if (minutes <= 30) return "Easy";
    if (minutes <= 45) return "Medium";
    return "Hard";
}
