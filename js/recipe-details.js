// ---------------------------------------------------------
// 📄 recipe-details.js – Handles rendering of a single recipe
// ---------------------------------------------------------

import { getRecipeDetails } from "./fetchdata.js";

// ---------------------------------------------------------
// START
// ---------------------------------------------------------
export async function startRecipeDetailsPage() {
  console.log("📄 Initializing recipe details page...");

  // 1️⃣ Grab the recipe ID from the URL (e.g. ?recipeId=12345)
  const recipeId = new URLSearchParams(window.location.search).get("recipeId");

  if (!recipeId) {
    console.warn("⚠️ No recipeId found in the URL.");
    showMessage("We could not find a recipe. Please return to the recipes page.");
    return;
  }

  try {
    // 2️⃣ Fetch recipe details from the API
    const recipe = await getRecipeDetails(recipeId);
    console.log("✅ Recipe data loaded:", recipe.title);

    // 3️⃣ Render the recipe on the page
    renderRecipe(recipe);
  } catch (error) {
    console.error("❌ Could not load the recipe:", error);
    showMessage("We could not load this recipe right now. Please try again later.");
  }
}

// ---------------------------------------------------------
// FUNCTIONS
// ---------------------------------------------------------

// Render the full recipe on the page
function renderRecipe(recipe) {
  // Grab all elements from the DOM
  const image = document.querySelector("#recipe-image");
  const title = document.querySelector("#recipe-title");
  const summary = document.querySelector("#recipe-summary");
  const time = document.querySelector("#recipe-time");
  const servings = document.querySelector("#recipe-servings");
  const tags = document.querySelector("#recipe-tags");
  const button = document.querySelector("#view-original-btn");

  // Verify that every element exists
  if (!image || !title || !summary || !time || !servings || !tags) {
    console.warn("⚠️ Missing elements required to render the recipe.");
    return;
  }

  // --- Populate primary information ---
  image.src = recipe.image || "https://via.placeholder.com/640x360?text=No+image";
  image.alt = recipe.title || "Recipe image";
  title.textContent = recipe.title || "Unknown recipe";
  summary.textContent = plainText(recipe.summary) || "No description available.";
  time.textContent = recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Unknown";
  servings.textContent = recipe.servings ? `${recipe.servings} servings` : "Varies";

  // --- Show difficulty and diet info ---
  const difficulty = getDifficulty(recipe.readyInMinutes);
  const diets = recipe.diets?.length ? recipe.diets.join(", ") : "n/a";
  tags.textContent = `Difficulty: ${difficulty} • Diet: ${diets}`;

  // --- Render ingredients ---
  renderList(
    "ingredients-list",
    recipe.extendedIngredients?.map((item) => item.original) || [],
    "No ingredients available."
  );

  // --- Render instructions ---
  renderList(
    "instructions-list",
    recipe.analyzedInstructions?.[0]?.steps?.map((step) => step.step) || [],
    "No instructions available."
  );

  // --- Handle the "View Original Recipe" button ---
  setupSourceButton(button, recipe.sourceUrl);
}

// Render a list (ingredients or instructions)
function renderList(id, items, emptyMessage) {
  const list = document.getElementById(id);
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `<li>${emptyMessage}</li>`;
    return;
  }

  // Create an <li> for every entry
  list.innerHTML = items.map((text) => `<li>${text}</li>`).join("");
}

// Manage the button linking to the original recipe
function setupSourceButton(button, url) {
  if (!button) return;

  if (url) {
    button.disabled = false;
    button.addEventListener("click", () => {
      console.log("🔗 Opening original recipe:", url);
      window.open(url, "_blank", "noopener");
    });
  } else {
    button.disabled = true;
    button.textContent = "Original recipe unavailable";
  }
}

// Remove HTML tags to show plain text
function plainText(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || "";
}

// Determine difficulty based on cooking time
function getDifficulty(minutes) {
  if (!minutes) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

// Display a message in the main section (used for errors)
function showMessage(message) {
  const main = document.querySelector("main.container");
  if (!main) return;

  main.innerHTML = `<p class="empty-state">${message}</p>`;
}
