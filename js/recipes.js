// ---------------------------------------------------------
// recipes.js – Visar sökresultat och filter på receptsidan
// ---------------------------------------------------------
//
// Den här filen ansvarar för logiken på sidan som visar recepten.
// Den hämtar data från API:et, skapar knappar för filter (kost, intolerans,
// svårighetsgrad) och visar receptkort på sidan.
//
// Den pratar med två andra filer:
//   → fetchdata.js (för att hämta data från API:et)
//   → filter-options.js (för listor med alla tillgängliga filter)
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";
import { DIETARY_OPTIONS, INTOLERANCE_OPTIONS } from "./filter-options.js";

// ---------------------------------------------------------
// 🔹 GLOBALA VARIABLER – används för att hålla koll på filtren
// ---------------------------------------------------------
let allRecipes = [];           // Alla recept vi fått från API:et
let filteredRecipes = [];      // De recept som just nu visas (efter filter)
let selectedDiets = [];        // Användarens valda kostalternativ
let selectedIntolerances = []; // Användarens valda intoleranser
let selectedDifficulty = "";   // Användarens valda svårighetsnivå

// Huvudbehållaren där allt innehåll ska placeras
const recipeResults = document.querySelector("#recipe-results");

// ---------------------------------------------------------
// 🚀 START – körs automatiskt när sidan laddas
// ---------------------------------------------------------
export async function startRecipesPage() {
  if (!recipeResults) return; // Om elementet inte hittas, avbryt (säkerhetskontroll)

  // 1️⃣ Läs in ingredienser som användaren valt på startsidan
  const ingredients = loadIngredients();

  // 2️⃣ Bygg upp layouten för sidan (rubrik, filter och tomt receptgrid)
  renderLayout(ingredients);

  // 3️⃣ Skapa alla filterknappar och koppla deras händelser
  setupFilters();

  // 4️⃣ Hämta recept från API:et baserat på ingredienserna
  await loadRecipes(ingredients);

  // 5️⃣ Visa resultaten på sidan
  renderRecipes(filteredRecipes);
  displayActiveFilters();
  updateMatchedRecipes(filteredRecipes);
}

// ---------------------------------------------------------
// 🔹 HÄMTA RECEPT FRÅN API:ET
// ---------------------------------------------------------
// Denna funktion anropar getRecipes() från fetchdata.js
// och skickar med alla aktuella filter (kost + intoleranser).
async function loadRecipes(ingredients) {
  try {
    allRecipes = await getRecipes({
      ingredients,
      diets: selectedDiets,
      intolerances: selectedIntolerances,
    });

    filteredRecipes = allRecipes; // Vi sparar kopian som vi filtrerar lokalt

    // Uppdatera visuell information (filterstatus och antal träffar)
    displayActiveFilters();
    updateMatchedRecipes(filteredRecipes);
  } catch {
    // Om något går fel – visa ett meddelande på sidan
    recipeResults.innerHTML = `<p class="empty-state">Unable to fetch recipes right now.</p>`;
  }
}

// ---------------------------------------------------------
// 🧱 SKAPA LAYOUTEN FÖR SIDAN (HTML-strukturen)
// ---------------------------------------------------------
// Här byggs hela receptsidan upp dynamiskt med rubrik, filter och tom grid.
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

    <!-- Information om vilka filter som används och antal träffar -->
    <section id="filter-info" class="card">
      <p id="active-filters">No active filters</p>
      <p id="matched-recipes">Matched Recipes: 0</p>
    </section>

    <!-- Här visas alla receptkort -->
    <div id="recipe-grid" class="recipe-grid"></div>
  `;
}

// ---------------------------------------------------------
// 🥕 HÄMTA INGREDIENSER FRÅN LOCALSTORAGE
// ---------------------------------------------------------
// När användaren väljer ingredienser på startsidan sparas de lokalt.
// Här hämtar vi tillbaka dem som en lista.
function loadIngredients() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------
// ⚙️ SKAPA FILTERKNAPPAR OCH KOPPLA FUNKTIONER
// ---------------------------------------------------------
function setupFilters() {
  // Skapar knappar för kost och intoleranser baserat på listorna i filter-options.js
  createFilterButtons(DIETARY_OPTIONS, "#diet-buttons", selectedDiets, "diet");
  createFilterButtons(INTOLERANCE_OPTIONS, "#intolerance-buttons", selectedIntolerances, "intolerance");

  // Hämtar svårighetsknappar och återställningsknapp
  const difficultyButtons = document.querySelectorAll("#difficulty-buttons .chip");
  const clearButton = document.querySelector("#clear-filters");

  // Kopplar deras funktionalitet
  setupDifficultyButtons(difficultyButtons);
  setupClearButton(clearButton);
}

// ---------------------------------------------------------
// 🧩 SKAPA FILTERKNAPPAR DYNAMISKT
// ---------------------------------------------------------
// Den här funktionen tar emot en lista (t.ex. alla kostalternativ) och skapar knappar
// för varje alternativ. När en knapp klickas, sparas valet och recepten laddas om.
function createFilterButtons(options, containerSelector, selectedArray, type) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "chip";
    button.textContent = option.name;      // Text som syns för användaren
    button.title = option.description;     // Tooltip (kort beskrivning)
    button.dataset[type] = option.name;    // T.ex. data-diet="vegan"

    // När användaren klickar på en knapp
    button.addEventListener("click", async () => {
      button.classList.toggle("chip--active"); // Aktivera/inaktivera visuellt

      // Hitta alla valda knappar av samma typ
      const active = Array.from(container.querySelectorAll(".chip--active")).map(
        (btn) => btn.dataset[type]
      );

      // Uppdatera rätt global variabel beroende på typ
      if (type === "diet") selectedDiets = active;
      if (type === "intolerance") selectedIntolerances = active;

      // Hämta nya recept från API:et baserat på de nya filtren
      await loadRecipes(loadIngredients());

      // Uppdatera visningen
      applyFilters();
      displayActiveFilters();
      updateMatchedRecipes(filteredRecipes);
    });

    // Lägg till knappen i sidan
    container.appendChild(button);
  });
}

// ---------------------------------------------------------
// 🏋️‍♀️ SVÅRIGHETSFILTER – hanteras lokalt
// ---------------------------------------------------------
function setupDifficultyButtons(buttons) {
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Om man klickar på samma knapp igen → ta bort markering
      selectedDifficulty =
        button.dataset.difficulty === selectedDifficulty ? "" : button.dataset.difficulty;

      // Markera endast den valda knappen
      buttons.forEach((btn) => {
        btn.classList.toggle("chip--active", btn.dataset.difficulty === selectedDifficulty);
      });

      // Uppdatera filtrering och visning
      applyFilters();
      displayActiveFilters();
      updateMatchedRecipes(filteredRecipes);
    });
  });
}

// ---------------------------------------------------------
// 🧼 RENSAR ALLA FILTER (återställer allt till standardläge)
// ---------------------------------------------------------
function setupClearButton(clearButton) {
  clearButton.addEventListener("click", async () => {
    // Töm alla val
    selectedDiets = [];
    selectedIntolerances = [];
    selectedDifficulty = "";

    // Ta bort visuell markering på alla knappar
    document.querySelectorAll(".chip").forEach((btn) => btn.classList.remove("chip--active"));

    // Ladda om recepten utan filter
    await loadRecipes(loadIngredients());

    // Uppdatera visningen
    applyFilters();
    displayActiveFilters();
    updateMatchedRecipes(allRecipes);
  });
}

// ---------------------------------------------------------
// 🔍 FILTRERAR RECEPTEN LOKALT EFTER SVÅRIGHET
// ---------------------------------------------------------
// Kost och intoleranser filtreras direkt i API:et – men svårighetsgrad
// beräknas här baserat på tillagningstid.
function applyFilters() {
  filteredRecipes = allRecipes.filter((recipe) => {
    const matchDifficulty =
      !selectedDifficulty || getDifficulty(recipe.readyInMinutes) === selectedDifficulty;
    return matchDifficulty;
  });

  // Visa resultaten och uppdatera informationen
  renderRecipes(filteredRecipes);
  displayActiveFilters();
  updateMatchedRecipes(filteredRecipes);
}

// ---------------------------------------------------------
// 🧾 VISAR VILKA FILTER SOM ÄR AKTIVA
// ---------------------------------------------------------
function displayActiveFilters() {
  const activeFiltersContainer = document.getElementById("active-filters");
  if (!activeFiltersContainer) return;

  // Samla ihop alla filter i en lista (kost + intolerans + svårighet)
  const active = [
    ...selectedDiets.map((d) => d),
    ...selectedIntolerances.map((i) => i),
    ...(selectedDifficulty ? [selectedDifficulty] : []),
  ];

  // Visa antingen "Active Filters: ..." eller standardtext
  activeFiltersContainer.textContent =
    active.length > 0
      ? `Active Filters: ${active.join(", ")}`
      : "No active filters";
}

// ---------------------------------------------------------
// 📊 VISAR HUR MÅNGA RECEPT SOM MATCHAR FILTREN
// ---------------------------------------------------------
function updateMatchedRecipes(recipes) {
  const matchedRecipesContainer = document.getElementById("matched-recipes");
  if (!matchedRecipesContainer) return;

  matchedRecipesContainer.textContent = `Matched Recipes: ${recipes.length}`;
}

// ---------------------------------------------------------
// 🖼️ VISAR ALLA RECEPT SOM KORT I SIDANS GRID
// ---------------------------------------------------------
function renderRecipes(recipes) {
  const grid = document.querySelector("#recipe-grid");
  if (!grid) return;

  // Om inga recept hittas
  if (!recipes.length) {
    grid.innerHTML = `<p class="empty-state">No recipes found for these filters.</p>`;
    return;
  }

  // Skapa HTML för varje receptkort
  grid.innerHTML = recipes
    .map(
      (recipe) => `
        <article class="recipe-card card">
          <img 
            src="${recipe.image || "https://via.placeholder.com/640x360"}" 
            alt="${recipe.title}" 
          />
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
// ⏱️ RÄKNAR UT SVÅRIGHETSNIVÅ BASERAT PÅ TID
// ---------------------------------------------------------
function getDifficulty(minutes) {
  // Om ingen tid anges – anta "Easy"
  if (!minutes) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}
