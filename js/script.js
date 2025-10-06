// Enkel logik för startsidan – hanterar ingredienslistan i formuläret
document.addEventListener("DOMContentLoaded", initHomePage);

function initHomePage() {
  const form = document.getElementById("ingredient-form");
  const input = document.getElementById("ingredients");
  const addButton = document.getElementById("add-ingredient");
  const clearButton = document.getElementById("clear-ingredients");
  const badgeContainer = document.getElementById("ingredient-badges");

  if (!form || !input || !addButton || !badgeContainer) {
    console.warn("Hittade inte formuläret – avbryter initiering");
    return;
  }

  let ingredients = readStoredIngredients();
  renderBadges();

  addButton.addEventListener("click", addIngredient);
  badgeContainer.addEventListener("click", handleBadgeClick);
  input.addEventListener("keydown", handleEnterKey);
  form.addEventListener("submit", handleSubmit);

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      ingredients = [];
      console.log("🧹 Alla ingredienser borttagna");
      renderBadges();
      saveIngredients();
      input.focus();
    });
  }

  // --- Hjälpfunktioner ---
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

  function saveIngredients() {
    localStorage.setItem("ingredients", JSON.stringify(ingredients));
  }

  function renderBadges() {
    if (!ingredients.length) {
      badgeContainer.innerHTML = '<p class="ingredient-empty">No ingredients yet. Add one to get started!</p>';
      return;
    }

    badgeContainer.innerHTML = ingredients
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

  function normalizeValue(text) {
    return text.trim().toLowerCase();
  }

  function addIngredient() {
    const value = input.value.trim();
    if (!value) return;

    const exists = ingredients.some((name) => normalizeValue(name) === normalizeValue(value));
    if (exists) {
      console.log("ℹ️ Ingrediensen fanns redan", value);
      input.value = "";
      return;
    }

    ingredients.push(value);
    console.log("➕ Ingrediens tillagd", value);
    input.value = "";
    renderBadges();
    saveIngredients();
  }

  function removeIngredient(name) {
    ingredients = ingredients.filter((item) => item !== name);
    console.log("➖ Ingrediens borttagen", name);
    renderBadges();
    saveIngredients();
  }

  function handleBadgeClick(event) {
    const button = event.target.closest("button[data-remove]");
    if (!button) return;
    removeIngredient(button.dataset.remove);
  }

  function handleEnterKey(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addIngredient();
  }

  function handleSubmit(event) {
    event.preventDefault();
    addIngredient();

    if (!ingredients.length) {
      input.focus();
      return;
    }

    saveIngredients();
    console.log("🚀 Navigerar till receptsidan", ingredients);
    window.location.href = "pages/recipes.html";
  }
}
