// ---------------------------
// 🍳 HOMEPAGE SCRIPT
// Handles the ingredient list form on the homepage
// ---------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Store references to all the important HTML elements
    const form = document.getElementById("ingredient-form");
    const input = document.getElementById("ingredient-input");
    const addBtn = document.getElementById("add-ingredient-btn");
    const clearBtn = document.getElementById("clear-ingredients-btn");
    const tagContainer = document.getElementById("ingredient-tags");

    if (!form || !input || !addBtn || !tagContainer) return;

    // Load ingredients from local storage (if any)
    let ingredients = loadIngredients();
    renderTags();

    // Add ingredient when button clicked
    addBtn.addEventListener("click", addIngredient);

    // Add ingredient when pressing Enter
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addIngredient();
        }
    });

    // Remove an ingredient when clicking its X button
    tagContainer.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-remove]");
        if (!button) return;
        ingredients = ingredients.filter((item) => item !== button.dataset.remove);
        saveIngredients();
        renderTags();
    });

    // Clear all ingredients
    clearBtn.addEventListener("click", () => {
        ingredients = [];
        saveIngredients();
        renderTags();
    });

    // Handle form submission (go to recipes page)
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!ingredients.length) return;
        saveIngredients();
        window.location.href = "pages/recipes.html";
    });

    // --- Helper functions ---

    function addIngredient() {
        const value = input.value.trim().toLowerCase();
        if (!value || ingredients.includes(value)) return;

        ingredients.push(value);
        input.value = "";
        saveIngredients();
        renderTags();
    }

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
});
