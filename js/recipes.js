// ---------------------------------------------------------
// 📋 recipes.js – Hanterar receptsidan och filtrering
// ---------------------------------------------------------

import { getRecipes } from "./fetchdata.js";

let allRecipes = [];
let selectedDiets = [];
let selectedDifficulty = "";
let elements = null;

export async function startRecipesPage() {
  const container = document.querySelector("#recipe-results");
  if (!container) {
    console.warn("⚠️ Hittade inte behållaren för recepten.");
    return;
  }

  console.log("📦 Startar receptlistan");

  const ingredients = loadIngredients();
  renderLayout(container, ingredients);
  elements = getElements(container);
  attachFilterHandlers();

  allRecipes = await getRecipes({ ingredients });
  renderRecipes(allRecipes, elements);
}

function attachFilterHandlers() {
  if (!elements) return;

  elements.dietButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("chip--active");
      selectedDiets = elements.dietButtons
        .filter((item) => item.classList.contains("chip--active"))
        .map((item) => item.dataset.diet);
      renderFiltered();
    });
  });

  elements.diffButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedDifficulty =
        button.dataset.difficulty === selectedDifficulty ? "" : button.dataset.difficulty;
      elements.diffButtons.forEach((item) => {
        item.classList.toggle("chip--active", item.dataset.difficulty === selectedDifficulty);
      });
      renderFiltered();
    });
  });

  elements.clearBtn?.addEventListener("click", () => {
    selectedDiets = [];
    selectedDifficulty = "";
    elements.dietButtons.forEach((item) => item.classList.remove("chip--active"));
    elements.diffButtons.forEach((item) => item.classList.remove("chip--active"));
    renderFiltered();
  });
}

function renderFiltered() {
  const filtered = allRecipes.filter((recipe) => {
    const matchDiet = !selectedDiets.length || selectedDiets.every((diet) => recipe.diets?.includes(diet));
    const matchDifficulty = !selectedDifficulty || getDifficulty(recipe.readyInMinutes) === selectedDifficulty;
    return matchDiet && matchDifficulty;
  });

  renderRecipes(filtered, elements);
}

// --- Hjälpfunktioner ---

function loadIngredients() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch {
    return [];
  }
}

function renderLayout(container, ingredients) {
  container.innerHTML = `
    <a href="../index.html" class="back-link">← Tillbaka</a>
    <h1>Recept baserat på: ${ingredients.join(", ") || "inga ingredienser"}</h1>

    <div class="filters">
      <div>
        <h2>Kost</h2>
        <div id="diet-buttons" class="chip-row"></div>
      </div>
      <div>
        <h2>Svårighetsgrad</h2>
        <div id="diff-buttons" class="chip-row">
          <button data-difficulty="Easy" class="chip">Lätt</button>
          <button data-difficulty="Medium" class="chip">Medel</button>
          <button data-difficulty="Hard" class="chip">Svår</button>
        </div>
      </div>
      <button id="clear-btn" class="btn-outline">Rensa filter</button>
    </div>

    <div id="recipe-grid" class="recipe-grid"></div>
  `;
}

function getElements(container) {
  return {
    dietButtons: Array.from(container.querySelectorAll("#diet-buttons .chip")),
    diffButtons: Array.from(container.querySelectorAll("#diff-buttons .chip")),
    clearBtn: container.querySelector("#clear-btn"),
    grid: container.querySelector("#recipe-grid"),
  };
}

function renderRecipes(list, { grid }) {
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `<p class="empty-state">Inga recept hittades just nu.</p>`;
    return;
  }

  grid.innerHTML = list
    .map(
      (recipe) => {
        const difficulty = getDifficulty(recipe.readyInMinutes);
        return `
          <article class="recipe-card card">
            <img src="${recipe.image || "https://via.placeholder.com/640x360"}" alt="${recipe.title}" />
            <h3>${recipe.title}</h3>
            <p>Tid: ${recipe.readyInMinutes || "?"} min • ${translateDifficulty(difficulty)}</p>
            <p>Kost: ${recipe.diets?.slice(0, 3).join(", ") || "n/a"}</p>
            <a href="recipe-details.html?recipeId=${recipe.id}" class="btn-solid">Visa recept</a>
          </article>
        `;
      }
    )
    .join("");
}

function getDifficulty(minutes) {
  if (!minutes) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

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
