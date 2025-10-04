// script.js
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("ingredient-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const input = document.getElementById("ingredients").value;
        const ingredients = input.split(",").map((i) => i.trim());

        localStorage.setItem("ingredients", JSON.stringify(ingredients));
        window.location.href = "pages/recipe-matches.html";
    });
});
