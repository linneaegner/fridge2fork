// ---------------------------------------------------------
// recipes.js – Visar sökresultat och filter på receptsidan
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";
import { DIETARY_OPTIONS, INTOLERANCE_OPTIONS } from "./filter-options.js";

// ---------------------------------------------------------
// GLOBALA VARIABLER – lagrar aktuella filter och hämtad data
// ---------------------------------------------------------
let allRecipes = [];          // Alla recept vi fått från API:et
let filteredRecipes = [];     // De recept som matchar valda filter
let selectedDiets = [];       // Användarens valda kostalternativ
let selectedIntolerances = [];// Användarens valda intoleranser
let selectedDifficulty = "";  // Vald svårighetsgrad

const recipeResults = document.querySelector("#recipe-results");

// ---------------------------------------------------------
// START – körs när sidan laddas
// ---------------------------------------------------------
export async function startRecipesPage() {
  if (!recipeResults) return;

  // 1️⃣ Läs in ingredienser från startsidan
  const ingredients = loadIngredients();

  // 2️⃣ Skapa sidans layout (rubrik, filter, receptgrid)
  renderLayout(ingredients);

  // 3️⃣ Koppla knappar och filter
  setupFilters();

  // 4️⃣ Hämta recept från API:et baserat på ingredienser
  await loadRecipes(ingredients);

  // 5️⃣ Visa resultaten
  renderRecipes(filteredRecipes);
}

// ---------------------------------------------------------
// Hämta recept från API:et via fetchdata.js
// ---------------------------------------------------------
async function loadRecipes(ingredients) {
  try {
    // 🔹 Skickar både diet och intoleranser till API:et
    allRecipes = await getRecipes({
      ingredients,
      diets: selectedDiets,
      intolerances: selectedIntolerances,
    });

    filteredRecipes = allRecipes;
  } catch {
    recipeResults.innerHTML = `<p class="empty-state">Unable to fetch recipes right now.</p>`;
  }
}

// ---------------------------------------------------------
// Skapar upp sidan: rubrik, filter och receptområde
// ---------------------------------------------------------
function renderLayout(ingredients) {
  recipeResults.innerHTML = `
    <a href="../index.html" class="back-link">← Back</a>
    <h1>Recipes based on: ${ingredients.join(", ") || "no ingredients selected"}</h1>

    <section id="filter-section" class="card">
      <h2>Filter recipes</h2>

      <!-- Kostfilter -->
      <div class="filter-group">
        <h3>Diet</h3>
        <div id="diet-buttons" class="chip-row"></div>
      </div>

      <!-- Intoleranser -->
      <div class="filter-group">
        <h3>Intolerances</h3>
        <div id="intolerance-buttons" class="chip-row"></div>
      </div>

      <!-- Svårighetsgrad -->
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

    <!-- Här visas recepten -->
    <div id="recipe-grid" class="recipe-grid"></div>
  `;
}

// ---------------------------------------------------------
// Läser in ingredienser från localStorage (från startsidan)
// ---------------------------------------------------------
function loadIngredients() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------
// Skapar alla filterknappar och kopplar funktionerna
// ---------------------------------------------------------
function setupFilters() {
  // 🔹 Skapar knappar automatiskt baserat på listorna i filter-options.js
  createFilterButtons(DIETARY_OPTIONS, "#diet-buttons", selectedDiets, "diet");
  createFilterButtons(INTOLERANCE_OPTIONS, "#intolerance-buttons", selectedIntolerances, "intolerance");

  // 🔹 Hämta övriga knappar
  const difficultyButtons = document.querySelectorAll("#difficulty-buttons .chip");
  const clearButton = document.querySelector("#clear-filters");

  // 🔹 Aktivera deras funktionalitet
  setupDifficultyButtons(difficultyButtons);
  setupClearButton(clearButton);
}

// ---------------------------------------------------------
// Skapar filterknappar dynamiskt från en lista
// ---------------------------------------------------------
function createFilterButtons(options, containerSelector, selectedArray, type) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "chip";
    button.textContent = option.name;     // Namnet visas för användaren
    button.title = option.description;    // Kort beskrivning när man hovrar
    button.dataset[type] = option.name;   // Lagrar t.ex. "diet" eller "intolerance"

    // När användaren klickar på en knapp
    button.addEventListener("click", async () => {
      button.classList.toggle("chip--active");

      // Hitta alla valda knappar av samma typ (t.ex. alla valda dieter)
      const active = Array.from(container.querySelectorAll(".chip--active")).map(
        (btn) => btn.dataset[type]
      );

      // Uppdatera rätt lista i våra globala variabler
      if (type === "diet") selectedDiets = active;
      if (type === "intolerance") selectedIntolerances = active;

      // Ladda om recepten baserat på nya val
      await loadRecipes(loadIngredients());
      applyFilters();
    });

    container.appendChild(button);
  });
}

// ---------------------------------------------------------
// Hanterar svårighetsfilter (lätt, medel, svår)
// ---------------------------------------------------------
function setupDifficultyButtons(buttons) {
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Om man klickar på samma knapp igen → ta bort markering
      selectedDifficulty =
        button.dataset.difficulty === selectedDifficulty ? "" : button.dataset.difficulty;

      // Markera bara den valda
      buttons.forEach((btn) => {
        btn.classList.toggle("chip--active", btn.dataset.difficulty === selectedDifficulty);
      });

      applyFilters();
    });
  });
}

// ---------------------------------------------------------
// Rensa alla filter (kost, intoleranser, svårighet)
// ---------------------------------------------------------
function setupClearButton(clearButton) {
  clearButton.addEventListener("click", async () => {
    // Återställ val
    selectedDiets = [];
    selectedIntolerances = [];
    selectedDifficulty = "";

    // Ta bort visuell markering på alla knappar
    document.querySelectorAll(".chip").forEach((btn) => btn.classList.remove("chip--active"));

    // Ladda om allt
    await loadRecipes(loadIngredients());
    applyFilters();
  });
}

// ---------------------------------------------------------
// Filtrerar recepten lokalt efter svårighet (API hanterar resten)
// ---------------------------------------------------------
function applyFilters() {
  filteredRecipes = allRecipes.filter((recipe) => {
    const matchDifficulty =
      !selectedDifficulty || getDifficulty(recipe.readyInMinutes) === selectedDifficulty;
    return matchDifficulty;
  });

  renderRecipes(filteredRecipes);
}

// ---------------------------------------------------------
// Visar alla receptkort på sidan
// ---------------------------------------------------------
function renderRecipes(recipes) {
  const grid = document.querySelector("#recipe-grid");
  if (!grid) return;

  if (!recipes.length) {
    grid.innerHTML = `<p class="empty-state">No recipes found for these filters.</p>`;
    return;
  }

  grid.innerHTML = recipes
    .map(
      (recipe) => `
        <article class="recipe-card card">
          <img src="${recipe.image || "https://via.placeholder.com/640x360"}" alt="${recipe.title}" />
          <h3>${recipe.title}</h3>
          <p>Ready in: ${recipe.readyInMinutes || "?"} min • Difficulty: ${getDifficulty(recipe.readyInMinutes)}</p>
          <p>Diets: ${recipe.diets?.slice(0, 3).join(", ") || "None"}</p>
          <a href="recipe-details.html?recipeId=${recipe.id}" class="btn-solid">View Recipe</a>
        </article>
      `
    )
    .join("");
}

// ---------------------------------------------------------
// Hjälpfunktioner – beräknar svårighetsgrad
// ---------------------------------------------------------
function getDifficulty(minutes) {
  if (!minutes) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}
