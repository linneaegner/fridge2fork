// ---------------------------------------------------------
// recipes.js – Visar sökresultat och filter på receptsidan
// ---------------------------------------------------------
//
// Den här filen ansvarar för logiken på sidan som visar recepten.
// Den hämtar data från API:et, hanterar svårighetsfiltret och visar receptkort på sidan.
//
// Den pratar med fetchdata.js för att hämta data från API:et.
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";

// ---------------------------------------------------------
// 🔹 GLOBALA VARIABLER – används för att hålla koll på filtren
// ---------------------------------------------------------
let allRecipes = [];         // Alla recept vi fått från API:et
let filteredRecipes = [];    // De recept som just nu visas (efter filter)
let selectedDifficulty = ""; // Användarens valda svårighetsnivå

// Huvudbehållaren där allt innehåll ska placeras
const recipesSection = document.querySelector("#recipes-section");
const foodWidget = document.querySelector("#food-widget");

// ---------------------------------------------------------
// 🚀 START – körs automatiskt när sidan laddas
// ---------------------------------------------------------
export async function startRecipesPage() {
  if (!recipesSection || !foodWidget) return; // Om element saknas, avbryt

  // 1️⃣ Läs in ingredienser som användaren valt på startsidan
  const ingredients = loadIngredients();
  console.info("[Recipes] Startar sidan med ingredienser", ingredients);

  // 2️⃣ Bygg upp layouten för sidan (rubrik, filter och tomt receptgrid)
  renderLayout(ingredients);

  // 3️⃣ Skapa alla filterknappar och koppla deras händelser
  setupFilters();

  // 4️⃣ Hämta recept från API:et baserat på ingredienserna
  const success = await loadRecipes(ingredients);

  if (!success) {
    return;
  }

  // 5️⃣ Visa resultaten på sidan
  renderRecipes(filteredRecipes);
  displayActiveFilters();
  updateMatchedRecipes(filteredRecipes);
}

// ---------------------------------------------------------
// 🔹 HÄMTA RECEPT FRÅN API:ET
// ---------------------------------------------------------
// Denna funktion anropar getRecipes() från fetchdata.js
// och skickar med ingredienserna som användaren valt.
async function loadRecipes(ingredients) {
  console.groupCollapsed("📋 UI:loadRecipes");
  console.info("Aktuella filter innan anrop", {
    ingredients,
    difficulty: selectedDifficulty,
  });

  try {
    allRecipes = await getRecipes({ ingredients });

    filteredRecipes = allRecipes; // Vi sparar kopian som vi filtrerar lokalt

    console.info(`[Recipes] Mottog ${allRecipes.length} recept från API:t`);
    if (allRecipes.length) {
      console.table(
        allRecipes.map(({ id, title, readyInMinutes }) => ({ id, title, readyInMinutes }))
      );
    }

    // Uppdatera visuell information (filterstatus och antal träffar)
    displayActiveFilters();
    updateMatchedRecipes(filteredRecipes);

    return true;
  } catch (error) {
    // Om något går fel – visa ett meddelande på sidan
    console.error("[Recipes] Kunde inte ladda recept", error);
    allRecipes = [];
    filteredRecipes = [];
    foodWidget.innerHTML = `<p class="empty-state">Unable to fetch recipes right now.</p>`;
    return false;
  } finally {
    console.groupEnd();
  }
}

// ---------------------------------------------------------
// 🧱 FÖRBERED SIDANS LAYOUT (uppdaterar statiska sektioner)
// ---------------------------------------------------------
function renderLayout(ingredients) {
  const formattedIngredients = formatIngredientsList(ingredients);

  selectedDifficulty = "";

  const ingredientsLabel = document.querySelector("#selected-ingredients");
  if (ingredientsLabel) {
    ingredientsLabel.textContent = formattedIngredients;
  }

  const activeFilters = document.getElementById("active-filters");
  if (activeFilters) {
    activeFilters.textContent = "No active filters";
  }

  const matchedRecipes = document.getElementById("matched-recipes");
  if (matchedRecipes) {
    matchedRecipes.textContent = "Matched Recipes: 0";
  }

  document
    .querySelectorAll("#difficulty-buttons .filter-button")
    .forEach((button) => button.classList.remove("active"));

  if (foodWidget) {
    foodWidget.innerHTML = "";
  }
}

function formatIngredientsList(ingredients) {
  if (!ingredients.length) {
    return "no ingredients selected";
  }

  if (ingredients.length === 1) {
    return ingredients[0];
  }

  const lastIngredient = ingredients[ingredients.length - 1];
  const initial = ingredients.slice(0, -1).join(", ");
  return `${initial} and ${lastIngredient}`;
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
  // Hämtar svårighetsknappar och återställningsknapp
  const difficultyButtons = document.querySelectorAll("#difficulty-buttons .filter-button");
  const clearButton = document.querySelector("#clear-filters");

  // Kopplar deras funktionalitet
  setupDifficultyButtons(difficultyButtons);
  setupClearButton(clearButton);
}

// 🏋️‍♀️ SVÅRIGHETSFILTER – hanteras lokalt
// ---------------------------------------------------------
function setupDifficultyButtons(buttons) {
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Om man klickar på samma knapp igen → ta bort markering
      selectedDifficulty =
        button.dataset.difficulty === selectedDifficulty ? "" : button.dataset.difficulty;

      console.info("[Filters] Vald svårighetsgrad", selectedDifficulty || "Alla");

      // Markera endast den valda knappen
      buttons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.difficulty === selectedDifficulty);
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
  if (!clearButton) return;

  clearButton.addEventListener("click", async () => {
    // Töm alla val
    selectedDifficulty = "";

    console.info("[Filters] Rensade alla filter");

    // Ta bort visuell markering på alla knappar
    document
      .querySelectorAll("#difficulty-buttons .filter-button")
      .forEach((btn) => btn.classList.remove("active"));

    // Ladda om recepten utan filter
    const success = await loadRecipes(loadIngredients());

    if (!success) {
      return;
    }

    // Uppdatera visningen
    applyFilters();
    displayActiveFilters();
    updateMatchedRecipes(allRecipes);
  });
}

// ---------------------------------------------------------
// 🔍 FILTRERAR RECEPTEN LOKALT EFTER SVÅRIGHET
// ---------------------------------------------------------
// Svårighetsgrad beräknas här baserat på tillagningstid.
function applyFilters() {
  filteredRecipes = allRecipes.filter((recipe) => {
    const matchDifficulty =
      !selectedDifficulty || getDifficulty(recipe.readyInMinutes) === selectedDifficulty;
    return matchDifficulty;
  });

  console.info("[Filters] Resultat efter lokal filtrering", {
    difficulty: selectedDifficulty || "Alla",
    matchCount: filteredRecipes.length,
    total: allRecipes.length,
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

  const activeText = selectedDifficulty ? `Active Filters: ${selectedDifficulty}` : "No active filters";

  activeFiltersContainer.textContent = activeText;
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
  if (!foodWidget) return;

  // Om inga recept hittas
  if (!recipes.length) {
    foodWidget.innerHTML = `<p class="empty-state">No recipes found for these filters.</p>`;
    return;
  }

  // Skapa HTML för varje receptkort
  foodWidget.innerHTML = recipes
    .map(
      (recipe) => {
        const summary = recipe.summary ? truncateText(recipe.summary) : "";
        const dietsMarkup = formatDiets(recipe.diets);

        return `
        <article class="recipe-card card">
          <div class="recipe-card__media">
            <img 
              src="${recipe.image || "https://via.placeholder.com/640x360"}" 
              alt="${recipe.title}" 
            />
          </div>
          <div class="recipe-card__content">
            <h3 class="recipe-card__title">${recipe.title}</h3>
            ${summary ? `<p class="recipe-card__summary">${summary}</p>` : ""}
            <p class="recipe-card__diets">${dietsMarkup}</p>
            <dl class="recipe-card__meta">
              <div class="recipe-card__meta-item">
                <dt class="sr-only">Time</dt>
                <dd>
                  <span aria-hidden="true" class="recipe-card__icon">⏱️</span>
                  ${formatMinutes(recipe.readyInMinutes)}
                </dd>
              </div>
              <div class="recipe-card__meta-item">
                <dt class="sr-only">Servings</dt>
                <dd>
                  <span aria-hidden="true" class="recipe-card__icon">👥</span>
                  ${formatServings(recipe.servings)}
                </dd>
              </div>
            </dl>
            
          </div>
          <footer class="recipe-card__footer">
            <a href="recipe-details.html?recipeId=${recipe.id}" class="btn-solid">View Recipe</a>
          </footer>
        </article>
        `;
      }
    )
    .join("");
}

function truncateText(text, maxLength = 120) {
  const plainText = text.replace(/<[^>]+>/g, "");
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength).trim()}...`;
}

function formatMinutes(minutes) {
  if (!minutes || Number.isNaN(Number(minutes))) {
    return "N/A";
  }

  return `${minutes} mins`;
}

function formatServings(servings) {
  if (!servings || Number.isNaN(Number(servings))) {
    return "N/A servings";
  }

  const value = Number(servings);
  return `${value} ${value === 1 ? "serving" : "servings"}`;
}

function formatDiets(diets = []) {
  if (!Array.isArray(diets) || diets.length === 0) {
    return "";
  }

  return diets
    .slice(0, 3)
    .map((diet) => `<span class="recipe-card__diet-tag">${capitalizeWords(diet)}</span>`)
    .join("");
}

function capitalizeWords(text = "") {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
