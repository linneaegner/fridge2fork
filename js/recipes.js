// ---------------------------------------------------------
// recipes.js – Visar sökresultat och filter på receptsidan
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";

// ---------------------------------------------------------
// GLOBALA VARIABLER
// ---------------------------------------------------------
let allRecipes = []; // Alla recept som hämtas från API:et
let filteredRecipes = []; // Receptlistan efter att filter har applicerats
let selectedDiets = []; // Aktuellt valda kostpreferenser
let selectedDifficulty = ""; // Aktuellt vald svårighetsgrad

// Hämtar referensen till huvudbehållaren på sidan
const recipeResults = document.querySelector("#recipe-results");

// ---------------------------------------------------------
// START
// ---------------------------------------------------------
export async function startRecipesPage() {
  console.log("📦 Startar logiken för receptsidan...");

  if (!recipeResults) {
    console.warn("⚠️ Hittade inte elementet #recipe-results.");
    return;
  }

  // 1️⃣ Hämta ingredienser som sparats på startsidan.
  const ingredients = loadIngredients();
  console.log("🥕 Ingredienser som används i sökningen:", ingredients);

  // 2️⃣ Skapa grundlayouten och knapparna för filter.
  renderLayout(ingredients);
  setupFilterButtons();

  // 3️⃣ Hämta recept från API:et baserat på ingredienserna.
  await loadRecipes(ingredients);

  // 4️⃣ Visa den första listan med recept.
  renderRecipes(filteredRecipes);
}

// ---------------------------------------------------------
// FUNKTIONER
// ---------------------------------------------------------

// Hämtar recept från API:et och sparar resultatet
async function loadRecipes(ingredients) {
  try {
    allRecipes = await getRecipes({ ingredients });
    filteredRecipes = allRecipes; // Börja med att visa allt
    console.log(`✅ Fick ${allRecipes.length} recept från API:et.`);
  } catch (error) {
    console.error("❌ Kunde inte hämta recept:", error);
    recipeResults.innerHTML = `<p class="empty-state">Kunde inte hämta recept just nu.</p>`;
  }
}

// Skapar uppbyggnaden för sidan: rubriker, filter och tomt resultatgrid
function renderLayout(ingredients) {
  recipeResults.innerHTML = `
    <a href="../index.html" class="back-link">← Tillbaka</a>
    <h1>Recept baserade på: ${ingredients.join(", ") || "inga ingredienser"}</h1>

    <section id="filter-section" class="card">
      <h2>Filtrera recept</h2>

      <!-- Kost -->
      <div class="filter-group">
        <h3>Kost</h3>
        <div id="diet-buttons" class="chip-row">
          <button class="chip" data-diet="gluten free">Glutenfritt</button>
          <button class="chip" data-diet="vegetarian">Vegetariskt</button>
          <button class="chip" data-diet="vegan">Veganskt</button>
          <button class="chip" data-diet="pescatarian">Pescetariskt</button>
        </div>
      </div>

      <!-- Svårighetsgrad -->
      <div class="filter-group">
        <h3>Svårighetsgrad</h3>
        <div id="difficulty-buttons" class="chip-row">
          <button class="chip" data-difficulty="Easy">Lätt</button>
          <button class="chip" data-difficulty="Medium">Medel</button>
          <button class="chip" data-difficulty="Hard">Svår</button>
        </div>
      </div>

      <button id="clear-filters" class="btn-outline">Rensa filter</button>
    </section>

    <!-- Här kommer kort för recepten att placeras -->
    <div id="recipe-grid" class="recipe-grid"></div>
  `;
}

// Läser in ingredienser från localStorage
function loadIngredients() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch (error) {
    console.warn("⚠️ Kunde inte läsa ingredienser från localStorage:", error);
    return [];
  }
}

// Kopplar knapparna för filter till rätt funktioner
function setupFilterButtons() {
  const dietButtons = Array.from(document.querySelectorAll("#diet-buttons .chip"));
  const difficultyButtons = Array.from(document.querySelectorAll("#difficulty-buttons .chip"));
  const clearButton = document.querySelector("#clear-filters");

  setupDietButtons(dietButtons);
  setupDifficultyButtons(difficultyButtons);
  setupClearButton(clearButton, dietButtons, difficultyButtons);
}

// Hantera klick på kostknapparna
function setupDietButtons(dietButtons) {
  dietButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("chip--active");

      selectedDiets = dietButtons
        .filter((btn) => btn.classList.contains("chip--active"))
        .map((btn) => btn.dataset.diet);

      applyFilters();
    });
  });
}

// Hantera klick på svårighetsknapparna (endast en aktiv åt gången)
function setupDifficultyButtons(difficultyButtons) {
  difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedDifficulty =
        button.dataset.difficulty === selectedDifficulty ? "" : button.dataset.difficulty;

      difficultyButtons.forEach((btn) => {
        const shouldBeActive = btn.dataset.difficulty === selectedDifficulty;
        btn.classList.toggle("chip--active", shouldBeActive);
      });

      applyFilters();
    });
  });
}

// Återställer alla filter till ursprungsläge
function setupClearButton(clearButton, dietButtons, difficultyButtons) {
  clearButton?.addEventListener("click", () => {
    selectedDiets = [];
    selectedDifficulty = "";
    dietButtons.forEach((btn) => btn.classList.remove("chip--active"));
    difficultyButtons.forEach((btn) => btn.classList.remove("chip--active"));
    applyFilters();
  });
}

// Filtrerar recepten baserat på valda filter
function applyFilters() {
  console.log("🔍 Filtrerar recept...");

  filteredRecipes = allRecipes.filter((recipe) => {
    const matchDiet =
      !selectedDiets.length || selectedDiets.every((diet) => recipe.diets?.includes(diet));

    const matchDifficulty =
      !selectedDifficulty || getDifficulty(recipe.readyInMinutes) === selectedDifficulty;

    return matchDiet && matchDifficulty;
  });

  renderRecipes(filteredRecipes);
}

// Visar alla receptkort i griden
function renderRecipes(recipes) {
  const grid = document.querySelector("#recipe-grid");
  if (!grid) return;

  if (!recipes.length) {
    grid.innerHTML = `<p class="empty-state">Inga recept matchade dina filter.</p>`;
    return;
  }

  grid.innerHTML = recipes
    .map((recipe) => {
      const difficulty = getDifficulty(recipe.readyInMinutes);
      const difficultyLabel = translateDifficulty(difficulty);
      const diets = recipe.diets?.slice(0, 3).join(", ") || "saknas"; // API:t returnerar engelska ord

      return `
        <article class="recipe-card card">
          <img
            src="${recipe.image || "https://via.placeholder.com/640x360"}"
            alt="${recipe.title}"
          />
          <h3>${recipe.title}</h3>
          <p>Tid: ${recipe.readyInMinutes || "?"} min • Svårighet: ${difficultyLabel}</p>
          <p>Kost: ${diets}</p>
          <a href="recipe-details.html?recipeId=${recipe.id}" class="btn-solid">Visa recept</a>
        </article>
      `;
    })
    .join("");
}

// Returnerar svårighetsnivå beroende på tid i minuter
function getDifficulty(minutes) {
  if (!minutes) return "Easy"; // Vi använder API:ets engelska värde för att matcha knapparna
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

// Översätter API:ets engelska svårighetsnivå till svensk text för visning
function translateDifficulty(value) {
  switch (value) {
    case "Easy":
      return "Lätt";
    case "Medium":
      return "Medel";
    case "Hard":
      return "Svår";
    default:
      return value;
  }
}
