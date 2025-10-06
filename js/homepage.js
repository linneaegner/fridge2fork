// ---------------------------------------------------------
// 🍳 homepage.js – Hanterar ingredienslistan på startsidan
// ---------------------------------------------------------

let ingredients = [];
let elements = {
  form: null,
  input: null,
  addBtn: null,
  clearBtn: null,
  tags: null,
};

export function startHomepage() {
  elements = {
    form: document.querySelector("#ingredient-form"),
    input: document.querySelector("#ingredient-input"),
    addBtn: document.querySelector("#add-ingredient-btn"),
    clearBtn: document.querySelector("#clear-ingredients-btn"),
    tags: document.querySelector("#ingredient-tags"),
  };

  if (!elements.form || !elements.input || !elements.addBtn || !elements.tags) {
    console.warn("⚠️ Hittade inte formuläret för ingredienser.");
    return;
  }

  ingredients = loadIngredients();
  renderTags();

  elements.addBtn.addEventListener("click", addIngredient);
  elements.input.addEventListener("keydown", handleInputKeydown);
  elements.tags.addEventListener("click", removeIngredient);
  elements.clearBtn?.addEventListener("click", clearIngredients);
  elements.form.addEventListener("submit", goToRecipes);
}

function handleInputKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addIngredient();
}

function addIngredient() {
  const value = elements.input.value.trim().toLowerCase();
  if (!value || ingredients.includes(value)) return;

  ingredients.push(value);
  elements.input.value = "";
  saveIngredients();
  renderTags();
}

function removeIngredient(event) {
  const button = event.target.closest("button[data-remove]");
  if (!button) return;

  ingredients = ingredients.filter((item) => item !== button.dataset.remove);
  saveIngredients();
  renderTags();
}

function clearIngredients() {
  ingredients = [];
  saveIngredients();
  renderTags();
}

function goToRecipes(event) {
  event.preventDefault();
  if (!ingredients.length) {
    alert("Lägg till minst en ingrediens först!");
    return;
  }
  saveIngredients();
  window.location.href = "pages/recipes.html";
}

function renderTags() {
  if (!elements.tags) return;

  if (!ingredients.length) {
    elements.tags.innerHTML =
      '<p class="ingredient-empty">Inga ingredienser ännu. Lägg till en för att börja!</p>';
    return;
  }

  elements.tags.innerHTML = ingredients
    .map(
      (name) => `
        <span class="ingredient-badge">
          ${name}
          <button type="button" data-remove="${name}">×</button>
        </span>
      `
    )
    .join("");
}

function loadIngredients() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch {
    return [];
  }
}

function saveIngredients() {
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
}
