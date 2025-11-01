// ---------------------------------------------------------
// homepage.js – Manage ingredient list on the start page
// ---------------------------------------------------------

let ingredients = [];

const form = document.querySelector("#ingredient-form");
const input = document.querySelector("#ingredient-input");
const addBtn = document.querySelector("#add-ingredient-btn");
const clearBtn = document.querySelector("#clear-ingredients-btn");
const tagContainer = document.querySelector("#ingredient-tags");

// === Startfunktion ========================================
export function startHomepage() {
  if (!form || !input || !addBtn || !tagContainer) return;

  ingredients = loadIngredients();
  renderTags();

  addBtn.addEventListener("click", addIngredient);
  clearBtn?.addEventListener("click", clearIngredients);
  tagContainer.addEventListener("click", removeIngredient);
  form.addEventListener("submit", goToRecipes);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  });
}

// === Lägg till ingrediens ================================
function addIngredient() {
  const name = input.value.trim().toLowerCase();
  if (!name) return showMessage("Please enter an ingredient name.");
  if (ingredients.includes(name))
    return showMessage("That ingredient is already added.");

  ingredients.push(name);
  saveIngredients();
  renderTags();
  input.value = "";
}

// === Ta bort ingrediens =================================
function removeIngredient(e) {
  const btn = e.target.closest("button[data-remove]");
  if (!btn) return;
  ingredients = ingredients.filter((i) => i !== btn.dataset.remove);
  saveIngredients();
  renderTags();
}

// === Rensa alla ingredienser =============================
function clearIngredients() {
  ingredients = [];
  saveIngredients();
  renderTags();
}

// === Gå vidare till receptsidan ==========================
function goToRecipes(e) {
  e.preventDefault();
  if (!ingredients.length)
    return showMessage("Add at least one ingredient before searching!");
  saveIngredients();
  window.location.href = "pages/recipes.html";
}

// === Rendera taggar ======================================
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
        <button type="button" data-remove="${name}" aria-label="Ta bort ${name}">
          <span aria-hidden="true">×</span>
        </button>
      </span>`
    )
    .join("");
}

// === LocalStorage ========================================
function saveIngredients() {
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
}

function loadIngredients() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch {
    return [];
  }
}

// === Visa meddelande =====================================
function showMessage(text) {
  const msg = document.createElement("p");
  msg.textContent = text;
  msg.className = "temp-message";
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}
