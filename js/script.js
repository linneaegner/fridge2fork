// script.js
// Manage the ingredient list on the home page before jumping to recipe matches
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("ingredient-form");
    const input = document.getElementById("ingredients");
    const addButton = document.getElementById("add-ingredient");
    const badgeContainer = document.getElementById("ingredient-badges");

    if (!form || !input || !addButton || !badgeContainer) return;

    let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];

    const normalise = (value) => value.trim().toLowerCase();

    const saveIngredients = () => {
        localStorage.setItem("ingredients", JSON.stringify(ingredients));
    };

    const renderBadges = () => {
        if (!ingredients.length) {
            badgeContainer.innerHTML = '<p class="ingredient-empty">No ingredients yet. Add a few to start!</p>';
            return;
        }

        badgeContainer.innerHTML = ingredients
            .map(
                (item) => `
          <span class="ingredient-badge" data-ingredient="${item}">
            ${item}
            <button type="button" aria-label="Remove ${item}" data-remove="${item}">×</button>
          </span>
        `
            )
            .join("");
    };

    const addIngredient = () => {
        const value = input.value.trim();
        if (!value) return;

        const exists = ingredients.some((item) => normalise(item) === normalise(value));
        if (exists) {
            input.value = "";
            return;
        }

        ingredients = [...ingredients, value];
        input.value = "";
        renderBadges();
        saveIngredients();
    };

    const removeIngredient = (ingredient) => {
        ingredients = ingredients.filter((item) => item !== ingredient);
        renderBadges();
        saveIngredients();
    };

    badgeContainer.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-remove]");
        if (!button) return;
        removeIngredient(button.dataset.remove);
    });

    addButton.addEventListener("click", addIngredient);

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addIngredient();
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        // Add whatever is currently typed before submitting
        addIngredient();

        if (!ingredients.length) {
            input.focus();
            return;
        }

        saveIngredients();
        window.location.href = "pages/recipe-matches.html";
    });

    renderBadges();
});
