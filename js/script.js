// Hanterar ingredienslistan på startsidan på ett enkelt sätt
document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    form: document.getElementById("ingredient-form"),
    input: document.getElementById("ingredients"),
    add: document.getElementById("add-ingredient"),
    clear: document.getElementById("clear-ingredients"),
    badges: document.getElementById("ingredient-badges"),
  };

  if (!elements.form || !elements.input || !elements.add || !elements.badges) {
    console.warn("Hittade inte formuläret – avbryter initiering");
    return;
  }

  const state = {
    ingredients: readStoredIngredients(),
  };

  renderBadges(state, elements);
  elements.add.addEventListener("click", () => addIngredient(state, elements));
  elements.badges.addEventListener("click", (event) => handleBadgeClick(event, state, elements));
  elements.input.addEventListener("keydown", (event) => handleEnterKey(event, state, elements));
  elements.form.addEventListener("submit", (event) => handleSubmit(event, state, elements));

  if (elements.clear) {
    elements.clear.addEventListener("click", () => clearIngredients(state, elements));
  }
});

function readStoredIngredients() {
  try {
    const stored = localStorage.getItem("ingredients");
    const list = stored ? JSON.parse(stored) : [];
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.warn("Kunde inte läsa ingredienser från localStorage", error);
    return [];
  }
}

function saveIngredients(state) {
  localStorage.setItem("ingredients", JSON.stringify(state.ingredients));
}

function renderBadges(state, elements) {
  if (!state.ingredients.length) {
    elements.badges.innerHTML = '<p class="ingredient-empty">No ingredients yet. Add one to get started!</p>';
    return;
  }

  elements.badges.innerHTML = state.ingredients
    .map(
      (name) => `
        <span class="ingredient-badge" data-ingredient="${name}">
          ${name}
          <button type="button" aria-label="Remove ${name}" data-remove="${name}">×</button>
        </span>
      `
    )
    .join("");
}

function addIngredient(state, elements) {
  const value = elements.input.value.trim();
  if (!value) return;

  const exists = state.ingredients.some((name) => normalizeValue(name) === normalizeValue(value));
  if (exists) {
    console.log("ℹ️ Ingrediensen fanns redan", value);
    elements.input.value = "";
    return;
  }

  state.ingredients.push(value);
  console.log("➕ Ingrediens tillagd", value);
  elements.input.value = "";
  renderBadges(state, elements);
  saveIngredients(state);
}

function clearIngredients(state, elements) {
  state.ingredients = [];
  console.log("🧹 Alla ingredienser borttagna");
  renderBadges(state, elements);
  saveIngredients(state);
  elements.input.focus();
}

function removeIngredient(name, state, elements) {
  state.ingredients = state.ingredients.filter((item) => item !== name);
  console.log("➖ Ingrediens borttagen", name);
  renderBadges(state, elements);
  saveIngredients(state);
}

function handleBadgeClick(event, state, elements) {
  const button = event.target.closest("button[data-remove]");
  if (!button) return;
  removeIngredient(button.dataset.remove, state, elements);
}

function handleEnterKey(event, state, elements) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addIngredient(state, elements);
}

function handleSubmit(event, state, elements) {
  event.preventDefault();
  addIngredient(state, elements);

  if (!state.ingredients.length) {
    elements.input.focus();
    return;
  }

  saveIngredients(state);
  console.log("🚀 Navigerar till receptsidan", state.ingredients);
  window.location.href = "pages/recipes.html";
}

function normalizeValue(text) {
  return text.trim().toLowerCase();
}
