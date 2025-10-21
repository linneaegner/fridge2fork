// ---------------------------------------------------------
// recipe-details.js – Visar detaljer om ett enskilt recept
// ---------------------------------------------------------
//
// Den här filen ansvarar för sidan som visar ett specifikt recept.
// Den hämtar receptdata från API:et via receptets ID i URL:en
// och visar bild, titel, tillagningstid, portioner,
// ingredienser och steg-för-steg-instruktioner.
//
// Den använder:
//   → getRecipeDetails() från fetchdata.js
// ---------------------------------------------------------

import { getRecipeDetails } from "./fetchdata.js";

// === Globala element =====================================
const recipeDetailsWidget = document.querySelector("#recipe-details-widget");
const recipeDetailsStatus = document.querySelector("#recipe-details-status");

// === Startfunktion =======================================
//
// Körs automatiskt när receptdetaljsidan laddas.
//
export async function startRecipeDetailsPage() {
  if (!recipeDetailsWidget) return;

  announceStatus("Loading recipe…");

  // 1️⃣ Hämta receptets ID från URL:en (?recipeId=12345)
  const recipeId = new URLSearchParams(window.location.search).get("recipeId");

  if (!recipeId) {
    showFallback("No recipe selected.");
    return;
  }

  try {
    // 2️⃣ Hämta detaljerad information från API:et
    const recipe = await getRecipeDetails(recipeId);

    if (!recipe) {
      showFallback("Could not find recipe.");
      return;
    }

    // 3️⃣ Visa receptet på sidan
    renderRecipe(recipe);
    announceStatus(`${recipe.title || "Recipe"} loaded.`);
  } catch {
    showFallback("Could not load recipe details.");
  }
}

// === Visa fallback-meddelande ============================
function showFallback(message = "Could not find recipe.") {
  if (!recipeDetailsWidget) return;
  recipeDetailsWidget.innerHTML = `<p class="empty-state">${message}</p>`;
  announceStatus(message);
}

// === Uppdatera statusfältet ==============================
function announceStatus(message) {
  if (recipeDetailsStatus) {
    recipeDetailsStatus.textContent = message;
  }
}

// === Bygg upp receptets innehåll =========================
//
// Skapar HTML-strukturen och fyller den med data från API:et.
//
function renderRecipe(recipe) {
  if (!recipeDetailsWidget) return;

  recipeDetailsWidget.innerHTML = `
    <article class="recipe">
      <h1 id="recipe-title"></h1>

      <div class="recipe-media">
        <img
          id="recipe-image"
          src="https://via.placeholder.com/640x360?text=Loading..."
          alt="Recipe image"
        />
      </div>

      <div class="recipe-body">
        <p id="recipe-summary"></p>

        <dl class="recipe-stats">
          <div class="recipe-stat"><dd>⏱️ ${formatMinutes(recipe.readyInMinutes)}</dd></div>
          <div class="recipe-stat"><dd>👥 ${formatServings(recipe.servings)}</dd></div>
        </dl>

        <p id="recipe-tags" class="recipe-tags"></p>

        <button id="view-original-btn" class="btn-primary" type="button">
          View Original Recipe
        </button>
      </div>
    </article>

    <section class="recipe-content">
      <div class="card">
        <h2>Ingredients</h2>
        <ul id="ingredients-list"></ul>
      </div>

      <div class="card">
        <h2>Instructions</h2>
        <ol id="instructions-list"></ol>
      </div>
    </section>
  `;

  // === Hämta element från DOM ============================
  const image = document.querySelector("#recipe-image");
  const title = document.querySelector("#recipe-title");
  const summary = document.querySelector("#recipe-summary");
  const tags = document.querySelector("#recipe-tags");
  const ViewOriginalBtn = document.querySelector("#view-original-btn");

  // Om något viktigt saknas, visa fallback
  if (!image || !title || !summary || !tags || !ViewOriginalBtn) {
    showFallback("Some recipe details could not be displayed.");
    return;
  }

  // === Grundinformation ==================================
  image.src = recipe.image || "https://via.placeholder.com/640x360?text=No+image";
  image.alt = recipe.title || "Recipe image";
  title.textContent = recipe.title || "Untitled recipe";
  summary.textContent = plainText(recipe.summary) || "No description available.";

  // === Kost- och diet-taggar =============================
  tags.innerHTML = formatDietTags(recipe.diets);

  // === Ingredienser ======================================
  renderList(
    "ingredients-list",
    recipe.extendedIngredients?.map((item) => item.original) || [],
    "No ingredients found."
  );

  // === Instruktioner =====================================
  renderList(
    "instructions-list",
    recipe.analyzedInstructions?.[0]?.steps?.map((step) => step.step) || [],
    "No instructions found."
  );

  // === Länk till originalrecept ==========================
  setupSourceButton(ViewOriginalBtn, recipe.sourceUrl);
}

// === Visa lista eller fallbacktext =======================
function renderList(id, items, emptyMessage) {
  const list = document.getElementById(id);
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `<li>${emptyMessage}</li>`;
  } else {
    list.innerHTML = items.map(function (text) {
      return `<li>${text}</li>`;
    }).join("");
  }
}

// === Hantera "View Original Recipe"-knapp ================
function setupSourceButton(ViewOriginalBtn, url) {
  if (!ViewOriginalBtn) return;

  if (url) {
    ViewOriginalBtn.disabled = false;
    ViewOriginalBtn.textContent = "View Original Recipe";
    ViewOriginalBtn.addEventListener("click", function () {
      window.open(url, "_blank", "noopener");
    });
  } else {
    ViewOriginalBtn.disabled = true;
    ViewOriginalBtn.textContent = "Original recipe not available";
    announceStatus("Original recipe link not available.");
  }
}

// === Hjälpfunktioner =====================================

// Tar bort HTML-taggar (t.ex. <b> eller <a>) från text
function plainText(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || "";
}

// Formatterar tillagningstid
function formatMinutes(minutes) {
  if (!minutes || isNaN(minutes)) return "N/A";
  return `${minutes} ${minutes === 1 ? "min" : "mins"}`;
}

// Formatterar antal portioner
function formatServings(servings) {
  if (!servings || isNaN(servings)) return "N/A servings";
  return `${servings} ${servings === 1 ? "serving" : "servings"}`;
}

// Skapar diet-taggar
function formatDietTags(diets = []) {
  if (!diets.length) {
    return createTag("Diet: None", "none");
  }

  return diets
    .slice(0, 4)
    .map(function (diet) {
      return createTag(capitalizeWords(diet), slugifyClass(diet));
    })
    .join("");
}

// Skapar en enskild tagg
function createTag(label, variant = "") {
  const classes = ["recipe-tag", "recipe-tag--diet"];
  if (variant) {
    classes.push(`recipe-tag--${variant}`);
  }
  return `<span class="${classes.join(" ")}">${label}</span>`;
}

// Gör första bokstaven i varje ord stor
function capitalizeWords(text = "") {
  return text
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// Skapar CSS-vänliga klassnamn (små bokstäver, bindestreck)
function slugifyClass(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
