// -------------------------------------------------------------
// HOMEPAGE – Ingredient selection and navigation
// -------------------------------------------------------------

const INGREDIENTS_KEY = "ingredients";

let ingredients = [];

const form = document.querySelector("#ingredient-form");
const input = document.querySelector("#ingredient-input");
const addBtn = document.querySelector("#add-ingredient-btn");
const clearBtn = document.querySelector("#clear-ingredients-btn");
const tagContainer = document.querySelector("#ingredient-tags");

// -------------------------------------------------------------
// INIT
// -------------------------------------------------------------
// Körs när startsidan laddas. Hämtar lagrade ingredienser och kopplar event.
export function startHomepage() {
  if (!form || !input || !addBtn || !tagContainer) return;

  ingredients = loadStoredIngredients();
  renderTags();

  addBtn.addEventListener("click", addIngredient);
  clearBtn?.addEventListener("click", clearIngredients);
  tagContainer.addEventListener("click", removeIngredient);
  form.addEventListener("submit", goToRecipes);

  // Gör det möjligt att trycka Enter i inputfältet
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  });
}

// -------------------------------------------------------------
// INGREDIENT HANDLING
// -------------------------------------------------------------
function addIngredient() {
  const name = input.value.trim().toLowerCase();
  if (!name) return showMessage("Please enter an ingredient name.");
  if (ingredients.includes(name))
    return showMessage("That ingredient is already added.");

  ingredients.push(name);
  saveStoredIngredients(ingredients);
  renderTags();
  input.value = "";
  input.focus();
}

function removeIngredient(e) {
  const btn = e.target.closest("button[data-remove]");
  if (!btn) return;

  ingredients = ingredients.filter((i) => i !== btn.dataset.remove);
  saveStoredIngredients(ingredients);
  renderTags();
}

function clearIngredients() {
  ingredients = [];
  saveStoredIngredients(ingredients);
  renderTags();
}

// -------------------------------------------------------------
// NAVIGATION
// -------------------------------------------------------------
// Skickar användaren till recipes.html om minst en ingrediens finns.
function goToRecipes(e) {
  e.preventDefault();

  if (!ingredients.length)
    return showMessage("Add at least one ingredient before searching!");

  saveStoredIngredients(ingredients);
  window.location.href = "pages/recipes.html";
}

// -------------------------------------------------------------
// UI HELPERS
// -------------------------------------------------------------
function renderTags() {
  if (!ingredients.length) {
    tagContainer.innerHTML =
      '<p class="ingredient-empty">No ingredients yet. Add one to start!</p>';
    return;
  }

  tagContainer.innerHTML = ingredients
    .map(
      (name) => `
      <span class="ingredient-badge">
        ${name}
        <button type="button" data-remove="${name}" aria-label="Remove ${name}">
          <span aria-hidden="true">×</span>
        </button>
      </span>`
    )
    .join("");
}

function showMessage(text) {
  const msg = document.createElement("p");
  msg.textContent = text;
  msg.className = "temp-message";
  msg.classList.add("fade-in-out");
  msg.setAttribute("role", "status");

  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}

export function saveStoredIngredients(list) {
  try {
    localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors (e.g., private browsing)
  }
}

export function loadStoredIngredients() {
  try {
    const stored = localStorage.getItem(INGREDIENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
