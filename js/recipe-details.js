const API_KEY = "32fa164a90a4441385aec42d7c8fe44d";
const BASE_URL = "https://api.spoonacular.com/recipes";

function getRecipeId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("recipeId");
}

function buildTag(label, variant = "default") {
    const className = variant === "primary" ? "pill" : "pill pill--muted";
    return `<span class="${className}">${label}</span>`;
}

function renderTags(recipe) {
    const tags = [];
    if (recipe.dishTypes && recipe.dishTypes.length) {
        tags.push(...recipe.dishTypes.slice(0, 3).map((type) => buildTag(type)));
    }
    if (recipe.diets && recipe.diets.length) {
        tags.push(...recipe.diets.slice(0, 3).map((diet) => buildTag(diet)));
    }
    const difficulty = recipe.readyInMinutes <= 20 ? "Easy" : recipe.readyInMinutes <= 40 ? "Moderate" : "Advanced";
    tags.unshift(buildTag(difficulty, "primary"));
    return tags.join("");
}

function renderIngredients(ingredients) {
    if (!ingredients || !ingredients.length) {
        return "<li>No ingredient list available.</li>";
    }
    return ingredients
        .map((item) => `<li>${item.original}</li>`)
        .join("");
}

function renderInstructions(instructions) {
    if (!instructions || !instructions.length) {
        return "<li>No instructions available.</li>";
    }

    const steps = instructions[0]?.steps;
    if (!steps || !steps.length) {
        return "<li>No instructions available.</li>";
    }

    return steps.map((step) => `<li><span>${step.step}</span></li>`).join("");
}

async function fetchRecipeDetails(recipeId) {
    const params = new URLSearchParams({
        apiKey: API_KEY,
        includeNutrition: false,
    });

    const url = `${BASE_URL}/${recipeId}/information?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch recipe details");
    }
    return response.json();
}

function populateRecipe(recipe) {
    const image = recipe.image || "https://via.placeholder.com/1280x720?text=No+Image";
    const summaryPlain = recipe.summary ? recipe.summary.replace(/<[^>]+>/g, "") : "";
    const summaryDisplay = summaryPlain || "A delightful recipe discoverable via Spoonacular.";

    document.getElementById("recipe-image").src = image;
    document.getElementById("recipe-image").alt = recipe.title;
    document.getElementById("recipe-title").textContent = recipe.title;
    document.getElementById("recipe-summary").textContent = summaryDisplay;
    document.getElementById("recipe-time").textContent = recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : "Time varies";
    document.getElementById("recipe-servings").textContent = recipe.servings ? `${recipe.servings} servings` : "Flexible servings";
    document.getElementById("recipe-tags").innerHTML = renderTags(recipe);

    const viewOriginal = document.getElementById("view-original");
    if (recipe.sourceUrl) {
        viewOriginal.addEventListener("click", () => {
            window.open(recipe.sourceUrl, "_blank", "noopener");
        });
    } else {
        viewOriginal.disabled = true;
        viewOriginal.classList.add("btn-disabled");
        viewOriginal.textContent = "Original recipe unavailable";
    }

    document.getElementById("ingredients-list").innerHTML = renderIngredients(recipe.extendedIngredients);
    document.getElementById("instructions-list").innerHTML = renderInstructions(recipe.analyzedInstructions);
}

async function init() {
    const recipeId = getRecipeId();
    if (!recipeId) {
        window.location.href = "recipe-matches.html";
        return;
    }

    try {
        const recipe = await fetchRecipeDetails(recipeId);
        populateRecipe(recipe);
    } catch (error) {
        console.error(error);
        const main = document.querySelector(".details-main");
        if (main) {
            main.innerHTML = '<p class="empty-state">Unable to load recipe details right now.</p>';
        }
    }
}

init();
